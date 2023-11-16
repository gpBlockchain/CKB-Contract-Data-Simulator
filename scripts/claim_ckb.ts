import {getSecp256k1Account} from "../src/utils";
import {CKB_RPC_URL, MNEMONIC, MNEMONIC2} from "../src/constants";
import {RPC} from "@ckb-lumos/rpc";
import {Indexer} from "@ckb-lumos/ckb-indexer";
import {E2EProvider} from "../src/e2eProvider";
import {FileFaucetQueue} from "../src/faucetQueue";
import {AddressType} from "@ckb-lumos/hd";

async function main() {
    console.log("---main---")
    const rpc = new RPC(CKB_RPC_URL);
    const indexer = new Indexer(CKB_RPC_URL);

    const e2eProvider = new E2EProvider({
        indexer,
        rpc,
        faucetQueue: FileFaucetQueue.getInstance(),
    });
    await e2eProvider.loadLocalConfig();

    for (let i = 0; i < 500; i++) {
        console.log(i)
        let account = getSecp256k1Account(MNEMONIC, AddressType.Receiving, i)

        await e2eProvider.claimCKB({
            claimer: account.address
        });

        account = getSecp256k1Account(MNEMONIC, AddressType.Change, i)
        await e2eProvider.claimCKB({
            claimer: account.address
        });

        account = getSecp256k1Account(MNEMONIC2, AddressType.Receiving, i)

        await e2eProvider.claimCKB({
            claimer: account.address
        });

        account = getSecp256k1Account(MNEMONIC2, AddressType.Change, i)
        await e2eProvider.claimCKB({
            claimer: account.address
        });

    }

}

main();
