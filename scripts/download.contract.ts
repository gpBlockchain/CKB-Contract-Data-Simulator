import {RPC} from "@ckb-lumos/rpc";
import {CKB_TEST_NET_RPC_URL} from "../src/constants";
import {Indexer} from "@ckb-lumos/ckb-indexer";
import {E2EProvider} from "../src/e2eProvider";
import {FileFaucetQueue} from "../src/faucetQueue";

async function main() {
    const rpc = new RPC(CKB_TEST_NET_RPC_URL);
    const indexer = new Indexer(CKB_TEST_NET_RPC_URL);
    console.log("---main---")
    const e2eProvider = new E2EProvider({
        indexer,
        rpc,
        faucetQueue: FileFaucetQueue.getInstance(),
    });
    // await e2eProvider.loadLocalConfig();
    await e2eProvider.saveChainContract("0xbf6fb538763efec2a70a6a3dcb7242787087e1030c4e7d86585bc63a9d337f5f", 0, "/Users/guopenglin/WebstormProjects/ggp/CKB-Contract-Data-Simulator/source/contracts/XUDT")
    console.log("save finished ")

}

main();
