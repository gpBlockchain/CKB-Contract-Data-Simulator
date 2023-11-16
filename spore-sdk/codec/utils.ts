import { molecule } from '@ckb-lumos/codec';
import { blockchain } from '@ckb-lumos/base';

export const ScriptId = molecule.struct(
  {
    codeHash: blockchain.Byte32,
    hashType: blockchain.HashType,
  },
  ['codeHash', 'hashType'],
);

export const ScriptIdOpt = molecule.option(ScriptId);
