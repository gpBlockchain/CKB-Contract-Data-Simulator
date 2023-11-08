import {e2eProvider} from "../src/config";
import {MNEMONIC} from "../src/constants";
import {AddressType} from "@ckb-lumos/hd";
import {BI} from "@ckb-lumos/bi";
import {getSecp256k1Account} from "../src/utils";


const bob = getSecp256k1Account(MNEMONIC, AddressType.Change, 3);
const alice = getSecp256k1Account(MNEMONIC, AddressType.Change, 5);
const lucy = getSecp256k1Account(MNEMONIC, AddressType.Change, 7);
const accounts = [bob, alice, lucy]

describe('DAO', function () {
    //FIXME set timeout
    beforeAll(async () => {
        for (let i = 0; i < accounts.length; i++) {
            await e2eProvider.claimCKB({claimer: accounts[i].address, amount: BI.from(1000 * 10 ** 8)});
        }
    })

    it("dao deposit", async () => {
        let account = alice
        const depositTx = await e2eProvider.daoDeposit({fromPk:account.privKey, amount: BI.from(120 * 10 ** 8)})
        await e2eProvider.waitTransactionCommitted(depositTx)
        console.log("depositTx committed:", depositTx)
    })

    it("dao withdraw", async () => {
        let account = bob
        const depositTx = await e2eProvider.daoDeposit({fromPk:account.privKey, amount: BI.from(120 * 10 ** 8)})
        await e2eProvider.waitTransactionCommitted(depositTx)
        console.log("depositTx committed:", depositTx)
        const depositOutpoint = {txHash: depositTx, index: "0x0" }
        const withdrawTx = await e2eProvider.daoWithdraw(account.privKey, depositOutpoint)
        await e2eProvider.waitTransactionCommitted(withdrawTx)
        console.log("withdrawTx committed:", withdrawTx)
    })

    it("dao deposit && withdraw && unlock", async () => {
        let account = lucy
        const depositTx = await e2eProvider.daoDeposit({fromPk:account.privKey, amount: BI.from(120 * 10 ** 8)})
        await e2eProvider.waitTransactionCommitted(depositTx)
        console.log("depositTx committed:", depositTx)
        const depositOutpoint = {txHash: depositTx, index: "0x0" }
        console.log('depositOutpoint: ', depositOutpoint)
        const withdrawTx = await e2eProvider.daoWithdraw(account.privKey, depositOutpoint)
        await e2eProvider.waitTransactionCommitted(withdrawTx)
        console.log("withdrawTx committed:", withdrawTx)
        const withdrawOutpoint = { txHash: withdrawTx, index: '0x0' }
        console.log('withdrawOutpoint: ', withdrawOutpoint)
        await e2eProvider.waitForEpoch({relative: true, value: 180})
        const unlockTx = await e2eProvider.daoUnlock(account.privKey, depositOutpoint, withdrawOutpoint)
        await e2eProvider.waitTransactionCommitted(unlockTx)
        console.log("unlockTx committed:", unlockTx)
    })
});