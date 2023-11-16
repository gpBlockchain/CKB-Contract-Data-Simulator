import {e2eProvider} from "../src/config";
import {MNEMONIC} from "../src/constants";
import {AddressType} from "@ckb-lumos/hd";
import {BI} from "@ckb-lumos/bi";
import {generateMofNMultisigInfo, getSecp256k1Account} from "../src/utils";

const bob = getSecp256k1Account(MNEMONIC, AddressType.Change, 3);
const alice = getSecp256k1Account(MNEMONIC, AddressType.Change, 5);
const lucy = getSecp256k1Account(MNEMONIC, AddressType.Change, 7);
const accounts = [bob, alice, lucy]
const TO_ADDRESS = getSecp256k1Account(MNEMONIC, AddressType.Change, 9).address;

describe('multisig', function () {
    //FIXME set timeout
    beforeAll(async () => {
        for (let i = 0; i < accounts.length; i++) {
            await e2eProvider.claimCKB({claimer: accounts[i].address, amount: BI.from(1000 * 10 ** 8)});
        }
    })

    it("transfer", async () => {
        const fromInfo = generateMofNMultisigInfo(2, 2,
            [accounts[0].lockScript.args, accounts[1].lockScript.args, accounts[2].lockScript.args]);
        const privKeys = [accounts[0].privKey, accounts[1].privKey];
        let multisigTx = await e2eProvider.multisigTransfer(
            { fromInfo,
                toAddress: TO_ADDRESS,
                amount: BI.from(120 * 10 ** 8 ),
                privKeys},
            BI.from(1000 * 10 ** 8 ),
            BI.from(10000));
        await e2eProvider.waitTransactionCommitted(multisigTx)
        console.log("depositTx committed:", multisigTx)
    })
});