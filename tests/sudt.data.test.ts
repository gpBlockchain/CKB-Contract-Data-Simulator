import {e2eProvider} from "../src/config";
import {getSecp256k1Account} from "@ckb-lumos/e2e-test/src/utils";
import {MNEMONIC} from "../src/constants";
import {AddressType} from "@ckb-lumos/hd";
import {BI} from "@ckb-lumos/bi";
import {sudt} from "@ckb-lumos/common-scripts";
import {TransactionSkeleton} from "@ckb-lumos/helpers";
import {utils} from "@ckb-lumos/base";
import {getConfig} from "@ckb-lumos/config-manager";


const alice = getSecp256k1Account(MNEMONIC, AddressType.Change, 1);


describe('SUDT', function () {


    beforeAll(async () => {
        await e2eProvider.claimCKB({claimer: alice.address, amount: BI.from(1000 * 10 ** 8)});
    })

    it("issue  simple udt", async () => {
        let account = alice;
        let issueBalance = 100000;
        let txSkeleton = TransactionSkeleton({cellProvider: e2eProvider.indexer});
        txSkeleton = await sudt.issueToken(txSkeleton, alice.address, BI.from(issueBalance))
        let txHash = await e2eProvider.sendAndSignTxSkeleton(txSkeleton, 1000, account)
        await e2eProvider.waitTransactionCommitted(txHash)
        console.log("txhash committed:", txHash)
    })

    it("query sudt balance", async () => {
        let queryAccount = alice;
        let issHash = sudt.ownerForSudt(alice.address)
        let config = await getConfig()
        if (config.SCRIPTS && config.SCRIPTS.SUDT) {
            let cells = await e2eProvider.findCells({
                lock: queryAccount.lockScript,
                type: {args: issHash, codeHash: config.SCRIPTS.SUDT.CODE_HASH, hashType: config.SCRIPTS.SUDT.HASH_TYPE}
            })
            let balance = cells.reduce((accumulator, x) => {
                const bigUInt = utils.readBigUInt128LE(x.data);
                return BI.from(accumulator).add(bigUInt);
            }, BI.from(0)).toBigInt();
            console.log("account sudt  balance:", balance)
        }
    })

});