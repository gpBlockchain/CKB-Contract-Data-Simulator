import { e2eProvider} from "../src/config";
import {MNEMONIC, MNEMONIC2} from "../src/constants";
import {AddressType} from "@ckb-lumos/hd";
import {BI} from "@ckb-lumos/bi";
import {sudt} from "@ckb-lumos/common-scripts";
import {TransactionSkeleton} from "@ckb-lumos/helpers";
import {getConfig} from "@ckb-lumos/config-manager";
import {getAnyOneCanPayAccount, getSecp256k1Account} from "../src/utils";
import {unpackAmount} from "@ckb-lumos/common-scripts/lib/sudt";


describe('SUDT', function () {

    // beforeAll(async () => {
    //     for (let i = 0; i < 5; i++) {
    //         await e2eProvider.claimCKB({
    //             claimer: getSecp256k1Account(MNEMONIC, AddressType.Change, i).address,
    //             amount: BI.from(1000 * 10 ** 8)
    //         });
    //         await e2eProvider.claimCKB({
    //             claimer: getSecp256k1Account(MNEMONIC2, AddressType.Change, i).address,
    //             amount: BI.from(1000 * 10 ** 8)
    //         });
    //
    //     }
    // })

    it("issue  simple udt", async () => {
        let issue_test_list = [
            {
                account: getSecp256k1Account(MNEMONIC, AddressType.Change, 1),
                address: getSecp256k1Account(MNEMONIC, AddressType.Change, 1).address,
                issueBalance: 3340282300000n,
                tx_hash: "0x0"
            },
            {
                account: getSecp256k1Account(MNEMONIC, AddressType.Change, 2),
                address: getSecp256k1Account(MNEMONIC, AddressType.Change, 2).address,
                issueBalance: 100000000000,
                tx_hash: "0x0"
            },
            {
                account: getSecp256k1Account(MNEMONIC, AddressType.Change, 3),
                address: getSecp256k1Account(MNEMONIC, AddressType.Change, 3).address,
                issueBalance: 100000000000000,
                tx_hash: "0x0"
            },

            {
                account: getSecp256k1Account(MNEMONIC2, AddressType.Change, 1),
                address: getSecp256k1Account(MNEMONIC2, AddressType.Change, 1).address,
                issueBalance: 3340282300000n,
                tx_hash: "0x0"
            },
            {
                account: getSecp256k1Account(MNEMONIC2, AddressType.Change, 2),
                address: getSecp256k1Account(MNEMONIC2, AddressType.Change, 2).address,
                issueBalance: 100000000000,
                tx_hash: "0x0"
            },
            {
                account: getSecp256k1Account(MNEMONIC2, AddressType.Change, 3),
                address: getSecp256k1Account(MNEMONIC2, AddressType.Change, 3).address,
                issueBalance: 100000000000000,
                tx_hash: "0x0"
            },

        ]
        for (let i = 0; i < issue_test_list.length; i++) {
            let {account, issueBalance} = issue_test_list[i];
            let txSkeleton = TransactionSkeleton({cellProvider: e2eProvider.indexer});
            txSkeleton = await sudt.issueToken(txSkeleton, account.address, BI.from(issueBalance))
            let txHash = await e2eProvider.sendAndSignTxSkeleton(txSkeleton, 1000, account)
            await e2eProvider.waitTransactionCommitted(txHash)
            console.log("tx hash committed:", txHash)
            issue_test_list[i].tx_hash = txHash
        }
        console.table(issue_test_list)

    })

    it("transfer token", async () => {

        let test_transfer_list = [
            {
                fromAccount: getSecp256k1Account(MNEMONIC, AddressType.Change, 1),
                fromAddress: getSecp256k1Account(MNEMONIC, AddressType.Change, 1).address,
                SUDTTokenId: sudt.ownerForSudt(getSecp256k1Account(MNEMONIC, AddressType.Change, 1).address),
                to: getSecp256k1Account(MNEMONIC, AddressType.Change, 2).address,
                transferAmount: 1,
                tx_hash: ""
            },
            {
                fromAccount: getSecp256k1Account(MNEMONIC, AddressType.Change, 1),
                fromAddress: getSecp256k1Account(MNEMONIC, AddressType.Change, 1).address,
                SUDTTokenId: sudt.ownerForSudt(getSecp256k1Account(MNEMONIC, AddressType.Change, 1).address),
                to: getSecp256k1Account(MNEMONIC2, AddressType.Change, 2).address,
                transferAmount: 1,
                tx_hash: ""
            },
            {
                fromAccount: getSecp256k1Account(MNEMONIC2, AddressType.Change, 1),
                fromAddress: getSecp256k1Account(MNEMONIC2, AddressType.Change, 1).address,
                SUDTTokenId: sudt.ownerForSudt(getSecp256k1Account(MNEMONIC2, AddressType.Change, 1).address),
                to: getSecp256k1Account(MNEMONIC, AddressType.Change, 2).address,
                transferAmount: 1,
                tx_hash: ""
            },
            {
                fromAccount: getSecp256k1Account(MNEMONIC2, AddressType.Change, 1),
                fromAddress: getSecp256k1Account(MNEMONIC2, AddressType.Change, 1).address,
                SUDTTokenId: sudt.ownerForSudt(getSecp256k1Account(MNEMONIC2, AddressType.Change, 1).address),
                to: getSecp256k1Account(MNEMONIC2, AddressType.Change, 2).address,
                transferAmount: 1,
                tx_hash: ""
            },
        ]
        for (let i = 0; i < test_transfer_list.length; i++) {
            console.log(`----${i}--------`)
            let {fromAccount, SUDTTokenId, to, transferAmount} = test_transfer_list[i]
            let txSkeleton = TransactionSkeleton({cellProvider: e2eProvider.indexer});
            txSkeleton = await sudt.transfer(
                txSkeleton,
                [fromAccount.address],
                SUDTTokenId,
                to,
                transferAmount, undefined, undefined,
            );
            let txHash = await e2eProvider.sendAndSignTxSkeleton(txSkeleton, 1000, fromAccount)
            console.log(txHash)
            await e2eProvider.waitTransactionCommitted(txHash)
            test_transfer_list[i].tx_hash = txHash
        }
        console.table(test_transfer_list)
    })


    it.skip("transfer to any one can pay",async ()=>{

        let test_transfer_list = [
            {
                fromAccount: getSecp256k1Account(MNEMONIC, AddressType.Change, 1),
                fromAddress: getSecp256k1Account(MNEMONIC, AddressType.Change, 1).address,
                SUDTTokenId: sudt.ownerForSudt(getSecp256k1Account(MNEMONIC, AddressType.Change, 1).address),
                to: getAnyOneCanPayAccount(MNEMONIC, AddressType.Change, 2).address,
                transferAmount: 1,
                tx_hash: ""
            },

            // {
            //     fromAccount: getSecp256k1Account(MNEMONIC, AddressType.Change, 2),
            //     fromAddress: getSecp256k1Account(MNEMONIC, AddressType.Change, 2).address,
            //     SUDTTokenId: sudt.ownerForSudt(getSecp256k1Account(MNEMONIC, AddressType.Change, 2).address),
            //     to: getAnyOneCanPayAccount(MNEMONIC, AddressType.Change, 5).address,
            //     transferAmount: 100,
            //     tx_hash: ""
            // },
            //
            // {
            //     fromAccount: getSecp256k1Account(MNEMONIC, AddressType.Change, 3),
            //     fromAddress: getSecp256k1Account(MNEMONIC, AddressType.Change, 3).address,
            //     SUDTTokenId: sudt.ownerForSudt(getSecp256k1Account(MNEMONIC, AddressType.Change, 3).address),
            //     to: getAnyOneCanPayAccount(MNEMONIC, AddressType.Change, 8).address,
            //     transferAmount: 10000,
            //     tx_hash: ""
            // },

            // {
            //     fromAccount: getSecp256k1Account(MNEMONIC, AddressType.Change, 2),
            //     fromAddress: getSecp256k1Account(MNEMONIC, AddressType.Change, 2).address,
            //     SUDTTokenId: sudt.ownerForSudt(getSecp256k1Account(MNEMONIC, AddressType.Change, 2).address),
            //     to: getSecp256k1Account(MNEMONIC, AddressType.Change, 1).address,
            //     transferAmount: 1000,
            //     tx_hash: ""
            // }
        ]
        for (let i = 0; i < test_transfer_list.length; i++) {
            let {fromAccount, SUDTTokenId, to, transferAmount} = test_transfer_list[i]
            let txSkeleton = TransactionSkeleton({cellProvider: e2eProvider.indexer});
            txSkeleton = await sudt.transfer(
                txSkeleton,
                [fromAccount.address],
                SUDTTokenId,
                to,
                transferAmount, undefined, undefined,
            );
            let txHash = await e2eProvider.sendAndSignTxSkeleton(txSkeleton, 1000, fromAccount)
            console.log(txHash)
            await e2eProvider.waitTransactionCommitted(txHash)
            test_transfer_list[i].tx_hash = txHash
        }
        console.table(test_transfer_list)

    })

    it("query sudt balance", async () => {
        let config = await getConfig()
        let query_list = [
            {
                queryAccount: getSecp256k1Account(MNEMONIC, AddressType.Change, 1),
                address: getSecp256k1Account(MNEMONIC, AddressType.Change, 1).address,
                SUDTTokenId: sudt.ownerForSudt(getSecp256k1Account(MNEMONIC, AddressType.Change, 1).address),
                balance: 0n
            },
            // {
            //     queryAccount: getSecp256k1Account(MNEMONIC, AddressType.Change, 2),
            //     address: getSecp256k1Account(MNEMONIC, AddressType.Change, 2).address,
            //     SUDTTokenId: sudt.ownerForSudt(getSecp256k1Account(MNEMONIC, AddressType.Change, 2).address),
            //     balance: 0n
            // },
            // {
            //     queryAccount: getSecp256k1Account(MNEMONIC, AddressType.Change, 3),
            //     address: getSecp256k1Account(MNEMONIC, AddressType.Change, 3).address,
            //     SUDTTokenId: sudt.ownerForSudt(getSecp256k1Account(MNEMONIC, AddressType.Change, 3).address),
            //     balance: 0n
            // },
            // {
            //     queryAccount: getSecp256k1Account(MNEMONIC, AddressType.Change, 4),
            //     address: getSecp256k1Account(MNEMONIC, AddressType.Change, 4).address,
            //     SUDTTokenId: sudt.ownerForSudt(getSecp256k1Account(MNEMONIC, AddressType.Change, 4).address),
            //     balance: 0n
            // },

        ]

        for (let i = 0; i < query_list.length; i++) {
            let {queryAccount, SUDTTokenId} = query_list[i]
            if (config.SCRIPTS && config.SCRIPTS.SUDT) {
                let cells = await e2eProvider.findCells({
                    lock: queryAccount.lockScript,
                    type: {
                        args: SUDTTokenId,
                        codeHash: config.SCRIPTS.SUDT.CODE_HASH,
                        hashType: config.SCRIPTS.SUDT.HASH_TYPE
                    }
                })
                let balance = cells.reduce((accumulator, x) => {
                    const bigUInt = unpackAmount(x.data);
                    return BI.from(accumulator).add(bigUInt);
                }, BI.from(0)).toBigInt();
                query_list[i].balance = balance
            }
        }
    })

    it("ddd",async ()=>{
        for (let i = 0; i < 5; i++) {
            let addr2 = getSecp256k1Account(MNEMONIC, AddressType.Change, i)
            console.log(addr2)
            let addr1 = getSecp256k1Account(MNEMONIC2, AddressType.Change, i)
            console.log(addr1)

        }
    })


});