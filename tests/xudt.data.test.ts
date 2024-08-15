import {issueSUDT} from "../lumos/examples/exchange-sudt-for-ckb/src/lib";
import {addressToScript, cellHelper, TransactionSkeleton, TransactionSkeletonType} from "@ckb-lumos/helpers";
import {computeScriptHash} from "@ckb-lumos/lumos/utils";
import {Account, getSecp256k1Account} from "../src/utils";
import {MNEMONIC} from "../src/constants";
import {AddressType} from "@ckb-lumos/hd";
import {bytes, Uint128} from "@ckb-lumos/lumos/codec";
import {addCellDep} from "@ckb-lumos/lumos/helpers";
import {common, sudt} from "@ckb-lumos/common-scripts";
import {e2eProvider} from "../src/config";
import {Indexer} from "@ckb-lumos/ckb-indexer";
import {getConfig, ScriptConfig} from "@ckb-lumos/config-manager";
import {BytesLike} from "@ckb-lumos/codec";
import {Cell, CellDep, Script, utils} from "@ckb-lumos/base";
import {BI} from "@ckb-lumos/bi";
import helper from "@ckb-lumos/common-scripts/lib/helper";

const alice = getSecp256k1Account(MNEMONIC, AddressType.Change, 1);
const bob = getSecp256k1Account(MNEMONIC, AddressType.Change, 2);
const candy = getSecp256k1Account(MNEMONIC, AddressType.Change, 3);


describe('xudt', function () {
    it("mint", async () => {
        console.log("demo")
        let account = alice;
        let txSkeleton = await mint(account, 100000000, e2eProvider.indexer)
        let txHash = await e2eProvider.sendAndSignTxSkeleton(txSkeleton, 1000, account)
        await e2eProvider.waitTransactionCommitted(txHash)
    })
    it("quert id",async ()=>{
        let owner = alice.lockScript;
       let script =  getXudtTypeScript(owner)
        console.log(script)
    })



    it("transfer", async () => {
        let from = alice
        let owner = alice

        let to = bob
        // mint
        let mintTxSkeleton = await mint(owner, 100000000, e2eProvider.indexer)
        let mintTxHash = await e2eProvider.sendAndSignTxSkeleton(mintTxSkeleton, 1000, owner)
        await e2eProvider.waitTransactionCommitted(mintTxHash)
        // transfer
        let txSkeleton = await transfer(owner.lockScript, from, to.lockScript, e2eProvider.indexer)
        let txHash = await e2eProvider.sendAndSignTxSkeleton(txSkeleton, 1000, from)
        await e2eProvider.waitTransactionCommitted(txHash)
    })

    it("transfer to any can pay",async ()=>{
        let from = alice
        let owner = alice

        let to = bob.anyOneCanPayLockScript


        // mint
        let mintTxSkeleton = await mint(owner, 99999, e2eProvider.indexer)
        let mintTxHash = await e2eProvider.sendAndSignTxSkeleton(mintTxSkeleton, 1000, owner)
        await e2eProvider.waitTransactionCommitted(mintTxHash)
        // transfer
        let txSkeleton = await transfer(owner.lockScript, from, to, e2eProvider.indexer)
        let txHash = await e2eProvider.sendAndSignTxSkeleton(txSkeleton, 1000, from)
        await e2eProvider.waitTransactionCommitted(txHash)

    })

    it('query balance', async () => {
        let queryAccount = bob;
        let owner = alice.lockScript;

        let cells = await e2eProvider.findCells({
            lock: queryAccount.lockScript,
            type: getXudtTypeScript(owner)
        })
        let balance = cells.reduce((accumulator, x) => {
            const bigUInt = utils.readBigUInt128LE(x.data);
            return BI.from(accumulator).add(bigUInt);
        }, BI.from(0)).toBigInt();
        console.log("account xudt  balance:", balance)

    })
});

async function mint(owner: Account, amount: number, indexer: Indexer): Promise<TransactionSkeletonType> {
    console.log("Please Claim some testnet CKB first from https://faucet.nervos.org")
    console.log("Your owner address:", owner.address)

    // 1. Create the xUDT Type Script
    // This script defines the structure of the xUDT token.
    const xudtTypeScript = createScript(getConfig().SCRIPTS['XUDT']!, computeScriptHash(owner.lockScript))

    // 2. Define Cell Provider (Optional)
    // This helps filter out unnecessary cells during transaction building.
    const cellProvider: TransactionSkeletonType["cellProvider"] = {
        collector: (query) => indexer.collector({type: "empty", data: "0x", ...query}),
    }

    // 3. Create Transaction Skeleton
    // This is the base structure for our transaction.
    let txSkeleton = TransactionSkeleton({cellProvider})

    // 4. Create Minted Cell with Amount
    // This defines the cell that will hold the minted xUDT tokens.
    const mintCell = cellHelper.create({
        lock: owner.lockScript, // The owner (you) controls this cell.
        type: xudtTypeScript, // This cell holds xUDT tokens.
        data: Uint128.pack(amount), // Set the initial amount of xUDT to mint (10000).
    })

    // 5. Add xUDT Script Dependency
    txSkeleton = addCellDep(txSkeleton, createCellDep(getConfig().SCRIPTS['XUDT']!))

    // 6. Inject Capacity for Minted Cell
    txSkeleton = await common.injectCapacity(txSkeleton, [owner.address], mintCell.cellOutput.capacity)

    // 7. Add Minted Cell to Outputs
    // Specify the minted cell as part of the transaction outputs.
    txSkeleton = txSkeleton.update("outputs", (outputs) => outputs.push(mintCell))

    return txSkeleton;
}


function getXudtTypeScript(ownerScript: Script): Script {
    const xudtTypeScript = createScript(getConfig().SCRIPTS['XUDT']!, computeScriptHash(ownerScript))
    return xudtTypeScript
}

async function transfer(owner: Script, from: Account, to: Script, indexer: Indexer) {
    const xudtTypeScript = createScript(getConfig().SCRIPTS['XUDT']!, computeScriptHash(owner))

    const cellProvider: TransactionSkeletonType["cellProvider"] = {
        collector: (query) => indexer.collector({type: "empty", data: "0x", ...query}),
    }


    // 1. Collect Minted xUDT Cell
    // Find the xUDT cell owned by you (based on owner lock script).
    const xudtCollector = indexer.collector({type: xudtTypeScript, lock: from.lockScript})

    let transferCell: Cell | undefined

    for await (const cell of xudtCollector.collect()) {
        transferCell = cell
        // Collect only one (assuming you have only one minted xUDT cell).
        break
    }

    if (!transferCell) {
        throw new Error("Owner do not have an xUDT cell yet, please call mint first")
    }

    const transferAmount = Uint128.unpack(transferCell.data)
    console.log("Transfer to Alice", transferAmount.toNumber(), "xUDT")

    // 2. Create Transaction Skeleton
    let txSkeleton = TransactionSkeleton({cellProvider})

    // 3. Add xUDT Script Dependency
    txSkeleton = addCellDep(txSkeleton, createCellDep(getConfig().SCRIPTS['XUDT']!))

    // 4. Set Up Input Cell (Transfer Cell)
    // Include the minted xUDT cell as both input and output (for transfer).
    txSkeleton = await common.setupInputCell(txSkeleton, transferCell)

    // 5. Update Output Cell Lock to Alice's Lock
    // Change the ownership of the minted xUDT cell to Alice's lock.
    txSkeleton = txSkeleton.update("outputs", (outputs) =>
        outputs.update(0, (cell) => ({...cell!, cellOutput: {...cell!.cellOutput, lock: to}}))
    )
    return txSkeleton;
}


// a helper to create a Script from a ScriptConfig
function createScript(config: ScriptConfig, args: BytesLike): Script {
    return {codeHash: config.CODE_HASH, hashType: config.HASH_TYPE, args: bytes.hexify(args)}
}

// a helper to crete a CellDep from a ScriptConfig
function createCellDep(config: ScriptConfig): CellDep {
    return {depType: config.DEP_TYPE, outPoint: {txHash: config.TX_HASH, index: config.INDEX}}
}