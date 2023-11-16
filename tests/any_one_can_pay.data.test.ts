import {e2eProvider} from "../src/config";
import {getAnyOneCanPayAccount, getSecp256k1Account, randomSecp256k1Account} from "../src/utils";
import {MNEMONIC, MNEMONIC2} from "../src/constants";
import {AddressType} from "@ckb-lumos/hd";
import {BI} from "@ckb-lumos/bi";
import {common, sudt} from "@ckb-lumos/common-scripts";
import {TransactionSkeleton} from "@ckb-lumos/helpers";



describe('any_one_can_pay', function () {

    it("generate any one can pay  ckb cell", async () => {
        const AnyOneCanPayAccounts1 = [
            getAnyOneCanPayAccount(MNEMONIC, AddressType.Receiving, 0),
            getAnyOneCanPayAccount(MNEMONIC, AddressType.Receiving, 1),
        ]

        const Secp256k1Accounts = [
            getSecp256k1Account(MNEMONIC, AddressType.Receiving, 0),
            getSecp256k1Account(MNEMONIC, AddressType.Change, 1),
        ]


        const AnyOneCanPayAccounts2 = [
            getAnyOneCanPayAccount(MNEMONIC2, AddressType.Receiving, 0),
            getAnyOneCanPayAccount(MNEMONIC2, AddressType.Change, 1)
        ]


        const Secp256k1Accounts2 = [
            getSecp256k1Account(MNEMONIC2, AddressType.Receiving, 0),
            getSecp256k1Account(MNEMONIC2, AddressType.Change, 1),
        ]

        for (let i = 0; i < AnyOneCanPayAccounts1.length; i++) {

            await e2eProvider.claimCKB({
                claimer: AnyOneCanPayAccounts1[i].address,
                amount: BI.from(100000 * 10 ** 8)
            });

            await e2eProvider.claimCKB({
                claimer: AnyOneCanPayAccounts2[i].address,
                amount: BI.from(100000 * 10 ** 8)
            });

            await e2eProvider.claimCKB({
                claimer: Secp256k1Accounts[i].address,
                amount: BI.from(100000 * 10 ** 8)
            });

            await e2eProvider.claimCKB ({
                claimer: Secp256k1Accounts2[i].address,
                amount: BI.from(100000 * 10 ** 8)
            });
        }
    })

    it("(any one can pay address) transfer ckb to (any one can pay address)", async () => {
        const AnyOneCanPayAccounts1 = [
            getAnyOneCanPayAccount(MNEMONIC, AddressType.Receiving, 0),
            getAnyOneCanPayAccount(MNEMONIC, AddressType.Receiving, 1),
        ]

        const Secp256k1Accounts = [
            getSecp256k1Account(MNEMONIC, AddressType.Receiving, 0),
            getSecp256k1Account(MNEMONIC, AddressType.Change, 1),
        ]


        const AnyOneCanPayAccounts2 = [
            getAnyOneCanPayAccount(MNEMONIC2, AddressType.Receiving, 0),
            getAnyOneCanPayAccount(MNEMONIC2, AddressType.Change, 1)
        ]


        const Secp256k1Accounts2 = [
            getSecp256k1Account(MNEMONIC2, AddressType.Receiving, 0),
            getSecp256k1Account(MNEMONIC2, AddressType.Change, 1),
        ]

        let test_list = [
            {from: AnyOneCanPayAccounts1[0], to: AnyOneCanPayAccounts1[1].address, amount: 100},
            {from: AnyOneCanPayAccounts1[0], to: AnyOneCanPayAccounts2[0].address, amount: 200},
            {from: AnyOneCanPayAccounts1[0], to: AnyOneCanPayAccounts2[1].address, amount: 300},

            {from: AnyOneCanPayAccounts2[0], to: AnyOneCanPayAccounts2[1].address, amount: 500},
            {from: AnyOneCanPayAccounts2[0], to: AnyOneCanPayAccounts1[0].address, amount: 400},
            {from: AnyOneCanPayAccounts2[0], to: AnyOneCanPayAccounts1[1].address, amount: 600},
        ]

        for (let i = 0; i < test_list.length; i++) {
            let from = test_list[i].from
            let to = test_list[i].to
            let amount = test_list[i].amount
            let txSkeleton = TransactionSkeleton({cellProvider: e2eProvider.indexer});
            console.log(from)
            console.log(to)
            txSkeleton = await common.transfer(
                txSkeleton,
                [from.address],
                to,
                amount
            );
            let txHash = await e2eProvider.sendAndSignTxSkeleton(txSkeleton, 1000, randomSecp256k1Account(from.privKey))
            await e2eProvider.waitTransactionCommitted(txHash)
            let ret = await e2eProvider.getTransactionDetail(txHash)
            console.log(ret)
        }
    })

    it("any one can pay transfer ckb", async () => {

        const AnyOneCanPayAccounts1 = [
            getAnyOneCanPayAccount(MNEMONIC, AddressType.Receiving, 0),
            getAnyOneCanPayAccount(MNEMONIC, AddressType.Receiving, 1),
        ]

        const Secp256k1Accounts = [
            getSecp256k1Account(MNEMONIC, AddressType.Receiving, 0),
            getSecp256k1Account(MNEMONIC, AddressType.Change, 1),
        ]


        const AnyOneCanPayAccounts2 = [
            getAnyOneCanPayAccount(MNEMONIC2, AddressType.Receiving, 0),
            getAnyOneCanPayAccount(MNEMONIC2, AddressType.Change, 1)
        ]


        const Secp256k1Accounts2 = [
            getSecp256k1Account(MNEMONIC2, AddressType.Receiving, 0),
            getSecp256k1Account(MNEMONIC2, AddressType.Change, 1),
        ]

        let test_list = [
            {from: AnyOneCanPayAccounts1[0], to: Secp256k1Accounts[1].address, amount: 100 * 10 ** 8},
            {from: AnyOneCanPayAccounts1[0], to: Secp256k1Accounts2[0].address, amount: 101 * 10 ** 8},
            {from: AnyOneCanPayAccounts1[0], to: Secp256k1Accounts2[1].address, amount: 102 * 10 ** 8},

            {from: AnyOneCanPayAccounts2[0], to: Secp256k1Accounts2[1].address, amount: 103 * 10 ** 8},
            {from: AnyOneCanPayAccounts2[0], to: Secp256k1Accounts[1].address, amount: 104 * 10 ** 8},
            {from: AnyOneCanPayAccounts2[0], to: Secp256k1Accounts[0].address, amount: 105 * 10 ** 8},
        ]
        for (let i = 0; i < test_list.length; i++) {
            console.log(`----${i}----`)
            let from = test_list[i].from
            let to = test_list[i].to
            let amount = test_list[i].amount
            let cap = await e2eProvider.getCapacities(from.address)
            let cap2 = await e2eProvider.getCapacities(randomSecp256k1Account(from.privKey).address)

            let cap1 = await e2eProvider.getCapacities(to)
            console.log(`from1: ${from.address}:${cap.toNumber()}`)
            console.log(`from2: ${randomSecp256k1Account(from.privKey).address}:${cap2.toNumber()}`)
            console.log(`to: ${to}:${cap1.toNumber()}`)
            let txSkeleton = new TransactionSkeleton({cellProvider: e2eProvider.indexer});
            txSkeleton = await common.transfer(
                txSkeleton,
                [from.address],
                to,
                amount
            );
            let txHash = await e2eProvider.sendAndSignTxSkeleton(txSkeleton, 1000, randomSecp256k1Account(from.privKey))
            await e2eProvider.waitTransactionCommitted(txHash)
            let ret = await e2eProvider.getTransactionDetail(txHash)
            console.log(ret)
        }
    })

    // it.skip("any one can pay transfer sudt", async () => {
    //
    //     // issue sudt
    //     let account = getSecp256k1Account(MNEMONIC, AddressType.Change, 1)
    //     let issueBalance = 1000000;
    //     let txSkeleton = TransactionSkeleton({cellProvider: e2eProvider.indexer});
    //     txSkeleton = await sudt.issueToken(txSkeleton, account.address, BI.from(issueBalance))
    //     let txHash = await e2eProvider.sendAndSignTxSkeleton(txSkeleton, 1000, account)
    //     await e2eProvider.waitTransactionCommitted(txHash)
    //     console.log("tx hash committed:", txHash)
    //
    //     // transfer sudt to any one can pay
    //     let fromAccount = account
    //     let SUDTTokenId = sudt.ownerForSudt(account.address)
    //     let to = getAnyOneCanPayAccount(MNEMONIC, AddressType.Change, 2).address
    //     let transferAmount = 1000;
    //     let txSkeleton2 = TransactionSkeleton({cellProvider: e2eProvider.indexer});
    //     txSkeleton2 = await sudt.transfer(
    //         txSkeleton,
    //         [fromAccount.address],
    //         SUDTTokenId,
    //         to,
    //         transferAmount, undefined, undefined,
    //     );
    //     txHash = await e2eProvider.sendAndSignTxSkeleton(txSkeleton2, 1000, fromAccount)
    //     console.log(txHash)
    //     await e2eProvider.waitTransactionCommitted(txHash)
    //
    // })


    // it("1111(any one can pay address) transfer ckb to (any one can pay address)", async () => {
    //     const AnyOneCanPayAccounts1 = [
    //         getAnyOneCanPayAccount(MNEMONIC, AddressType.Receiving, 0),
    //         getAnyOneCanPayAccount(MNEMONIC, AddressType.Receiving, 1),
    //     ]
    //
    //     const Secp256k1Accounts = [
    //         getSecp256k1Account(MNEMONIC, AddressType.Receiving, 119),
    //         getSecp256k1Account(MNEMONIC, AddressType.Change, 119),
    //     ]
    //
    //
    //     const AnyOneCanPayAccounts2 = [
    //         getAnyOneCanPayAccount(MNEMONIC2, AddressType.Receiving, 119),
    //         getAnyOneCanPayAccount(MNEMONIC2, AddressType.Change, 119)
    //     ]
    //
    //
    //     const Secp256k1Accounts2 = [
    //         getSecp256k1Account(MNEMONIC2, AddressType.Receiving, 119),
    //         getSecp256k1Account(MNEMONIC2, AddressType.Change, 119),
    //     ]
    //
    //     // await e2eProvider.claimCKB({
    //     //     claimer: AnyOneCanPayAccounts1[0].address,
    //     //     amount: BI.from(1000 * 10 ** 8)
    //     // });
    //     // await e2eProvider.claimCKB({
    //     //     claimer: getSecp256k1Account(MNEMONIC, AddressType.Change, 111).address,
    //     //     amount: BI.from(1000 * 10 ** 8)
    //     // });
    //     //
    //     // await e2eProvider.claimCKB({
    //     //     claimer: getAnyOneCanPayAccount(MNEMONIC, AddressType.Receiving, 111).address,
    //     //     amount: BI.from(1000 * 10 ** 8)
    //     // });
    //
    //     // await e2eProvider.claimCKB({
    //     //     claimer: getSecp256k1Account(MNEMONIC, AddressType.Receiving, 120).address,
    //     //     amount: BI.from(1000 * 10 ** 8)
    //     // });
    //
    //     // let from = getAnyOneCanPayAccount(MNEMONIC, AddressType.Change, 0)
    //     // let to = getAnyOneCanPayAccount(MNEMONIC, AddressType.Receiving, 0).address
    //     // let amount = 9999999999
    //
    //     // let from = getAnyOneCanPayAccount(MNEMONIC, AddressType.Change, 111)
    //     // let to = getSecp256k1Account(MNEMONIC, AddressType.Receiving, 111).address
    //     let from = getAnyOneCanPayAccount(MNEMONIC, AddressType.Receiving, 0)
    //     let to = AnyOneCanPayAccounts1[1].address
    //     let amount = 1000000000
    //     console.log(from)//164000000000000
    //     console.log(to)  //10000000000
    //     let cap = await e2eProvider.getCapacities(from.address)
    //     console.log("from:", cap.toNumber(), " address:", from.address)
    //     console.log("address:",AnyOneCanPayAccounts1[0].address)
    //     let txSkeleton = TransactionSkeleton({cellProvider: e2eProvider.indexer});
    //     txSkeleton = await common.transfer(
    //         txSkeleton,
    //         [from.address],
    //         to,
    //         amount
    //     );
    //     let txHash = await e2eProvider.sendAndSignTxSkeleton(txSkeleton, 1000, randomSecp256k1Account(from.privKey))
    //     await e2eProvider.waitTransactionCommitted(txHash)
    //     let ret = await e2eProvider.getTransactionDetail(txHash)
    //     console.log(ret)
    //
    // })

});