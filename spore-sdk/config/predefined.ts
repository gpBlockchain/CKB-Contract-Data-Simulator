import { SporeConfig } from './types';
import {readFileSync} from "fs";
import * as fs from 'fs';

export type PredefinedSporeConfigScriptName = 'Spore' | 'Cluster';

export const LUMOS_CONFIG_PATH = "lumos.json"
const jsonData = JSON.parse(fs.readFileSync(LUMOS_CONFIG_PATH, 'utf8'));

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
        codeHash: jsonData.SCRIPTS.SPORE.CODE_HASH,
        hashType: 'type',
      },
      cellDep: {
        outPoint: {
          txHash: jsonData.SCRIPTS.SPORE.TX_HASH,
          index: '0x0',
        },
        depType: 'code',
      },
      versions: [],
    },
    Cluster: {
      script: {
        codeHash: jsonData.SCRIPTS.SPORE_CLUSTER.CODE_HASH,
        hashType: 'type',
      },
      cellDep: {
        outPoint: {
          txHash: jsonData.SCRIPTS.SPORE_CLUSTER.TX_HASH,
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
