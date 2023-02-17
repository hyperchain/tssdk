import { BigInteger } from "jsbn";
import { ECCurveFp, ECPointFp } from "./ec";
export interface CurveParams {
  curve: ECCurveFp;
  G: ECPointFp;
  n: BigInteger;
}

export interface KeyPairHex {
  privateKey: string;
  publicKey: string;
}
