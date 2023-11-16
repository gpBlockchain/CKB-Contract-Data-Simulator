import {RPC, Indexer, BI} from '@ckb-lumos/lumos';
import { predefinedSporeConfigs } from '../../config';
import { createTestAccount } from './helpers';
import {e2eProvider} from "../../../src/config";
import {getSecp256k1Account} from "../../../src/utils";
import {MNEMONIC} from "../../../src/constants";
import {AddressType} from "@ckb-lumos/hd";

const config = predefinedSporeConfigs.Aggron4;

export const TESTNET_ENV = {
  config,
  rpc: new RPC(config.ckbNodeUrl),
  indexer: new Indexer(config.ckbIndexerUrl, config.ckbNodeUrl),
};

const charlie = getSecp256k1Account(MNEMONIC, AddressType.Change, 1);
const alice = getSecp256k1Account(MNEMONIC, AddressType.Change, 1);

beforeAll(async () => {
  await e2eProvider.claimCKB({claimer: charlie.address, amount: BI.from(100000000 * 10 ** 8)});
})
export const TESTNET_ACCOUNTS = {
  CHARLIE: createTestAccount(charlie.privKey, config),
  ALICE: createTestAccount(alice.privKey, config),
};
