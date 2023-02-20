export interface Proposal {
  id: number;
  code: string;
  timestamp: bigint;
  timeout: bigint;
  status: string;
  assentor: VoteInfo[];
  objector: VoteInfo[];
  threshold: number;
  score: number;
  creator: string;
  version: string;
  type: string;
  completed: string;
  cancel: string;
}

interface VoteInfo {
  addr: string;
  txHash: string;
}
