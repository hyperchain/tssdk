import { AlgoUtil } from "../../common";
import { Algo } from "../../account";

export enum AlgoType {
  SM2 = "sm2",
  EC = "ecdsa",
  ED = "ed25519",
}

export function algo2AlgoType(algo: Algo): AlgoType | null {
  if (AlgoUtil.isSM(algo)) {
    return AlgoType.SM2;
  } else if (AlgoUtil.isEC(algo)) {
    return AlgoType.EC;
  } else if (AlgoUtil.isED(algo)) {
    return AlgoType.ED;
  }
  return null;
}
