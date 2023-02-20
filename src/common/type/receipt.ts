import EventLog from "./event-log";
import VmType from "./vm/vm-type";

export default interface Receipt {
  contractAddress: string;
  ret: string;
  txHash: string;
  log: EventLog[];
  vmType: VmType;
  gasUsed: bigint;
  version: string;
}
