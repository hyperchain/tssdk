import { Transaction } from "./tx-service";

export interface Block {
  version: string;
  number: string;
  hash: string;
  parentHash: string;
  writeTime: string;
  avgTime: string;
  txcounts: string;
  merkleRoot: string;
  transactions: Transaction[];
  txRoot: string;
  invalid: boolean;
  invalidMsg: string;
  author: string;
  signature: string;
  quorum_cert?: QuorumCert;
}

interface QuorumCert {
  vote_data: VoteData;
  signed_ledger_info: LedgerInfoWithSignatures;
}

interface VoteData {
  proposed: ConsensusBlockInfo;
  parent: ConsensusBlockInfo;
}

interface LedgerInfoWithSignatures {
  signatures: Record<string, string>;
  ledger_info: LedgerInfo;
}

interface LedgerInfo {
  commit_info: ConsensusBlockInfo;
  consensus_data_hash: string;
}

interface ConsensusBlockInfo {
  epoch: number;
  round: number;
  id: string;
  height: number;
  timestamp_nanos: number;
  reconfiguration: boolean;
  proof: boolean;
}
