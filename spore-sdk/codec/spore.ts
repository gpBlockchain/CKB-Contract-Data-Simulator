import { blockchain } from '@ckb-lumos/base';
import { BytesLike, molecule } from '@ckb-lumos/codec';
import { bufferToRawString, bytifyRawString } from '@spore-sdk/core';

export const SporeData = molecule.table(
  {
    contentType: blockchain.Bytes,
    content: blockchain.Bytes,
    clusterId: blockchain.BytesOpt,
  },
  ['contentType', 'content', 'clusterId'],
);

export interface RawSporeData {
  contentType: string;
  content: Parameters<typeof SporeData.pack>[0]['content'];
  clusterId: Parameters<typeof SporeData.pack>[0]['clusterId'];
}

export function packRawSporeData(packable: RawSporeData) {
  return SporeData.pack({
    contentType: bytifyRawString(packable.contentType),
    content: packable.content,
    clusterId: packable.clusterId,
  });
}

export function unpackToRawSporeData(unpackable: BytesLike): RawSporeData {
  const unpacked = SporeData.unpack(unpackable);
  return {
    contentType: bufferToRawString(unpacked.contentType),
    content: unpacked.content,
    clusterId: unpacked.clusterId,
  };
}
