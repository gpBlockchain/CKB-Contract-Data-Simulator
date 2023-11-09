import { predefined } from '@ckb-lumos/config-manager';
import { SporeConfig } from './types';
import {readFileSync} from "fs";

export type PredefinedSporeConfigScriptName = 'Spore' | 'Cluster';

export const LUMOS_CONFIG_PATH = "lumos.json"

function getLocalConfig(): any {
  const config = readFileSync(LUMOS_CONFIG_PATH, 'utf-8');
  const configMap = JSON.parse(config);
  return configMap;
}

const TESTNET_SPORE_CONFIG: SporeConfig<PredefinedSporeConfigScriptName> = {
  lumos: getLocalConfig(),
  ckbNodeUrl: 'http://127.0.0.1:8114',
  ckbIndexerUrl: 'http://127.0.0.1:8114',
  maxTransactionSize: 500 * 1024, // 500 KB
  scripts: {
    Spore: {
      script: {
        codeHash: '0xf142459eb940a0a5a270ab3b4baf223d30236e5950b342fe6a050f735efc231f',
        hashType: 'type',
      },
      cellDep: {
        outPoint: {
          txHash: '0x6d86a7f259930c0bd2c7167f41581b4d9d5f8b1d52513934d6b216f2ada48ff1',
          index: '0x0',
        },
        depType: 'code',
      },
      versions: [],
    },
    Cluster: {
      script: {
        codeHash: '0x1bf1c14596c3f22c60a0018c0373e37674e3a3ce0bec902359a461f51259ae98',
        hashType: 'type',
      },
      cellDep: {
        outPoint: {
          txHash: '0xa38a2b62f75cbdcba4f55236abf6fd3e72ba5f41ecd22d1bbbfa73fe1f9f8a8f',
          index: '0x0',
        },
        depType: 'code',
      },
      versions: [],
    },
  },
  extensions: [],
};

export const predefinedSporeConfigs = {
  Aggron4: TESTNET_SPORE_CONFIG,
};
