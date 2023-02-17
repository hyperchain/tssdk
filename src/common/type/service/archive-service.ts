export interface ArchiveLatest {
  filterId: string;
  status: string;
  reason: string;
}

export interface Archive {
  height: string;
  genesis: string;
  hash: string;
  filterId: string;
  merkleRoot: string;
  status: string;
  namespace: string;
  txCount: string;
  invalidTxCount: string;
  dbVersion: string;
}
