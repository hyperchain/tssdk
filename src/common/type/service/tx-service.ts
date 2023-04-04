import PlainObject from "../plain-object";

export interface Filter extends PlainObject {
  txHash: string;
  blkNumber: bigint;
  txIndex: bigint;
  txFrom: string;
  txTo: string;
  txName: string;
  extraId: PlainObject[];
}

export interface Bookmark extends PlainObject {
  blkNum: number;
  txIndex: number;
}

export interface MetaData extends PlainObject {
  pageSize: number;
  bookmark: Bookmark;
  backward: boolean;
}

export interface Transaction {
  version: string;
  hash: string;
  blockNumber: string;
  blockHash: string;
  txIndex: string;
  from: string;
  to: string;
  cName: string;
  amount: string;
  timestamp: string;
  nonce: string;
  extra: string;
  executeTime: string;
  payload: string;
  signature: string;
  blockTimestamp: string;
  blockWriteTime: string;
  op: number;
  vmType: string;
  extraId: unknown[];
  invalidMsg: string;
  gasPrice: bigint;
  gasLimit: bigint;
  expirationTimestamp: bigint;
  participant: {
    initiator: string;
    withholding: string[];
  };
}

export interface TxCount {
  count: string;
  lastIndex: string;
  lastBlockNum: string;
}
