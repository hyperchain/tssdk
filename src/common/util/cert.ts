import { AsnParser } from "@peculiar/asn1-schema";
import { ECPrivateKey } from "@peculiar/asn1-ecc";
import { sm2 } from "sm-crypto";
import { ec as EC } from "elliptic";

import * as ByteUtil from "./byte";
import * as PemUtil from "./pem";
import * as HashUtil from "./hash";

export interface CertKeyPair {
  privateKey: string;
  publicKey: string;
  isGM: boolean;
}

// create cert key pair.
export const newCertKeyPair = (cert: Buffer, priv: Buffer) => {
  const result = PemUtil.PEM.parse(priv);
  const asn1Obj = result[0].body;

  const SM2_OID = "1.2.156.10197.1.301";
  let privateKey = "";
  let isGM = false;
  try {
    const privKey = AsnParser.parse(asn1Obj, ECPrivateKey);
    isGM = privKey.parameters?.namedCurve === SM2_OID;
    privateKey = ByteUtil.toHex(privKey.privateKey.buffer);
  } catch (_) {
    throw Error("parse PrivateKey failed: Only support EC | SM2;");
  }
  const publicKey = ByteUtil.toHex(cert);
  return {
    privateKey,
    publicKey,
    isGM,
  };
};

// signData
export const signData = (message: string, certKeyPair: CertKeyPair) => {
  let res = "";
  if (certKeyPair.isGM) {
    //sm2
    res = sm2.doSignature(message, certKeyPair.privateKey);
  } else {
    //ecdsa
    const ec = new EC("secp256k1");
    const sourceData = ByteUtil.fromHex(message);
    const hash = HashUtil.sha3(sourceData);
    const keypair = ec.keyFromPrivate(certKeyPair.privateKey, "hex");
    const signature = ec.sign(hash, keypair);
    const r = ByteUtil.fromHex(signature.r.toString("hex"), 32);
    const s = ByteUtil.fromHex(signature.s.toString("hex"), 32);
    const fixedV = Uint8Array.from([signature.recoveryParam || 0]);
    res = ByteUtil.toHex(ByteUtil.concat(r, s, fixedV));
  }
  return res;
};
