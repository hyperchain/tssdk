export default interface EventLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: bigint;
  blockHash: string;
  txHash: string;
  txIndex: number;
  index: number;
}
