import { Algo } from "../../account";

export function isEC(algo: Algo): boolean {
  return algo.startsWith("0x0");
}

export function isSM(algo: Algo): boolean {
  return algo.startsWith("0x1");
}

export function isR1(algo: Algo): boolean {
  return algo.startsWith("0x0") && algo.endsWith("1") && algo.length === 5;
}

export function isED(algo: Algo): boolean {
  return algo.startsWith("0x4");
}

export function isPKI(algo: Algo): boolean {
  return algo.startsWith("0x4");
}

// 是否是裸私钥，不需要加解密
export function isRAW(algo: Algo): boolean {
  const raws = [Algo.ECRAW, Algo.SMRAW, Algo.ECRAWR1, Algo.ED25519RAW];
  return raws.indexOf(algo) !== -1;
}
