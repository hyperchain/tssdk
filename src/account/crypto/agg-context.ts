/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  compressPublicKeyHex,
  decodeCurvePointFromPk,
  decodeCurvePointFromUint8Array,
  getGlobalEcParams,
  leftPad,
} from "./sm2/utils";
import { sha256 } from "js-sha256";
import { CurveParams } from "./sm2/types";
import { BigInteger } from "jsbn";
import { ECPointFp } from "./sm2/ec";
import { ByteUtil } from "../../common";
import { SecureRandom } from "./sm2/secure-random";
import { sm3 } from "./sm3";

function point2Uint8Array(point: ECPointFp) {
  const x = ByteUtil.fromHex(leftPad(point.getX().toBigInteger().toString(16), 64));
  const y = ByteUtil.fromHex(leftPad(point.getY().toBigInteger().toString(16), 64));
  return { x, y };
}
export default class AggContext {
  private self: number;
  private pks: ECPointFp[];
  private apk: ECPointFp; // aggregate public key
  private curveParams: CurveParams;
  private ai: BigInteger[];
  private rSelfJ: BigInteger[];
  private isInitialized: boolean;
  private r?: ECPointFp;
  constructor(index: number, publicKeys: string[]) {
    const pkLen = publicKeys.length;
    this.self = index;
    if (index >= pkLen) {
      throw new Error("self index is too big");
    }
    this.curveParams = getGlobalEcParams();
    const h = sha256.create();
    this.pks = [];
    this.ai = [];
    this.rSelfJ = [];
    publicKeys.map((pk) => {
      this.pks!.push(decodeCurvePointFromPk(pk));
      h.update(ByteUtil.fromHex(pk));
    });
    const tmpBuf = h.hex();
    let tmpApk: ECPointFp;
    publicKeys.map((pk, pkIndex) => {
      const tmpHasher = sha256.create();
      tmpHasher.update(ByteUtil.fromHex(tmpBuf));
      tmpHasher.update(ByteUtil.fromHex(pk));
      this.ai.push(new BigInteger(tmpHasher.hex(), 16));
      const partPoint = this.pks[pkIndex].multiply(this.ai[pkIndex]);
      if (pkIndex === 0) tmpApk = partPoint;
      else tmpApk = tmpApk.add(partPoint);
    });
    this.apk = tmpApk!;
    this.isInitialized = false;
  }

  public getApk(): Uint8Array {
    return ByteUtil.fromHex(this.apk.toString());
  }

  public getPK(number: number): string {
    if (number >= this.pks.length) {
      throw Error("index is too large");
    }
    if (number < 0) {
      return this.apk.to65();
    }
    return this.pks[number].to65();
  }

  public init(): Uint8Array {
    if (this.isInitialized) {
      const commitment = new Uint8Array(this.rSelfJ.length * 64);
      this.rSelfJ.map((tmpE, i) => {
        const tmpPoint = this.curveParams.G.multiply(tmpE);
        const { x, y } = point2Uint8Array(tmpPoint);
        commitment.set(x, i * 64);
        commitment.set(y, i * 64 + 32);
      });
      return commitment;
    } else {
      const RandomGenerator = new SecureRandom();
      // return commitment
      const commitment = new Uint8Array(this.pks.length * 64);
      const n = this.curveParams.n;
      this.pks.map((_, pkIndex) => {
        const element = new BigInteger(n.bitLength(), RandomGenerator)
          .mod(n.subtract(BigInteger.ONE))
          .add(BigInteger.ONE);
        this.rSelfJ.push(element);
        const tmpPoint = this.curveParams.G.multiply(element);
        const { x, y } = point2Uint8Array(tmpPoint);
        commitment.set(x, pkIndex * 64);
        commitment.set(y, pkIndex * 64 + 32);
      });
      this.isInitialized = true;
      return commitment;
    }
  }

  public aggCommitment(...commitments: Uint8Array[]): Uint8Array {
    if (commitments.length == 0) {
      throw new Error("input is empty");
    }
    const firstCommitment = commitments[0];
    if (firstCommitment.length % 64 != 0) {
      throw new Error("parse commitment (0) error: length is not 64X");
    }
    const n = firstCommitment.length / 64;
    if (n != commitments.length) {
      throw new Error(`commitment length expect ${commitments.length} x 64, got ${n}`);
    }
    const retPoints: ECPointFp[] = [];
    for (let i = 0; i < n; i++) {
      if (commitments[i].length !== firstCommitment.length) {
        throw new Error(`parse commitment (${i}) error: length is not ${firstCommitment.length}`);
      }
      let retPoint: ECPointFp;
      for (let j = 0; j < n; j++) {
        const tmpPoint = getPartCommitment(commitments[j], i);
        if (j === 0) {
          retPoint = tmpPoint;
        } else {
          retPoint = retPoint!.add(tmpPoint);
        }
      }
      retPoints.push(retPoint!);
    }
    const ret = new Uint8Array(n * 64);
    for (let i = 0; i < n; i++) {
      const { x, y } = point2Uint8Array(retPoints[i]);
      ret.set(x, i * 64);
      ret.set(y, i * 64 + 32);
    }
    return ret;
  }

  public partSign(privKey: string, msg: Uint8Array, aggCommitment: Uint8Array): Uint8Array {
    if (!this.isInitialized) {
      throw new Error("'Aggcontext' has not been initialized");
    }
    msg = sm3(msg);
    const { n, G } = this.curveParams;
    const P = G.multiply(new BigInteger(privKey, 16));
    if (!P.equals(this.pks[this.self])) {
      throw new Error("the private key and public key do not match");
    }
    // 1. 计算b
    const h = sha256.create();
    const apkBytes = this.getApk();
    h.update(apkBytes);
    this.pks.map((pk) => {
      const pkBytes = pk.to65();
      h.update(ByteUtil.fromHex(pkBytes));
    });
    h.update(msg);
    const b = new BigInteger(h.hex(), 16);

    // 2. 计算R
    if (aggCommitment.length === 0 || aggCommitment.length % 64 !== 0) {
      throw new Error("aggCommitment length is not 64X");
    }
    const aggN = aggCommitment.length / 64;
    let bPower = new BigInteger("1");
    for (let i = 0; i < aggN; i++) {
      const tmp = getPartCommitment(aggCommitment, i);
      const t = tmp.multiply(bPower);
      if (i === 0) {
        this.r = t;
      } else {
        this.r = this.r!.add(t);
      }
      bPower = bPower.multiply(b);
      bPower = bPower.mod(n);
    }
    // 3. 计算c
    const h2 = sha256.create();
    h2.update(apkBytes);
    h2.update(ByteUtil.fromHex(this.r!.to64()));
    h2.update(msg);
    let c = new BigInteger(h2.hex(), 16);

    // 4. 计算s_i
    c = c.multiply(this.ai[this.self]);
    c = c.multiply(new BigInteger(privKey, 16));
    bPower = new BigInteger("1");
    for (let i = 0; i < aggN; i++) {
      const tmp = this.rSelfJ[i].multiply(bPower);
      bPower = bPower.multiply(b);
      c = c.add(tmp);
    }
    c = c.mod(n);
    return concatSignature(c, this.r!);
  }

  public aggSign(...signs: Uint8Array[]): Uint8Array {
    const n = this.curveParams.n;
    let aggS = new BigInteger("0");
    for (let i = 0; i < signs.length; i++) {
      const s = parseSign(signs[i]);
      if (!s.r.equals(this.r!)) {
        throw new Error(`R of signature ${i} is different from self`);
      }
      aggS = aggS.add(s.s);
    }
    aggS = aggS.mod(n);
    return concatSignature(aggS, this.r!);
  }

  public verify(publicKey: string, msg: Uint8Array, signature: Uint8Array): boolean {
    const sign = parseSign(signature);
    const key = decodeCurvePointFromPk(publicKey);
    const h = sha256.create();
    msg = sm3(msg);
    h.update(ByteUtil.fromHex(key.to65()));
    h.update(ByteUtil.fromHex(sign.r.to64()));
    h.update(msg);
    const c = new BigInteger(h.hex(), 16);
    let tiledX = key.multiply(c);
    const G = this.curveParams.G;
    const sG = G.multiply(sign.s);
    tiledX = tiledX.add(sign.r);

    return sG.equals(tiledX);
  }
}

interface Signature {
  r: ECPointFp;
  s: BigInteger;
}

function parseSign(sign: Uint8Array): Signature {
  if (sign.length != 65) {
    throw new Error("signature expect 65 bytes");
  }
  return {
    r: decodeCurvePointFromPk(ByteUtil.toHex(sign.slice(0, 33))),
    s: new BigInteger(ByteUtil.toHex(sign.slice(33, 65)), 16),
  };
}

function concatSignature(aggs: BigInteger, r: ECPointFp) {
  const compressedR = compressPublicKeyHex(r.to65());
  const ret = new Uint8Array(65);
  ret.set(ByteUtil.fromHex(compressedR), 0);
  ret.set(ByteUtil.fromHex(leftPad(aggs.toString(16), 64)), 33);
  return ret;
}

function getPartCommitment(commitment: Uint8Array, index: number) {
  if (index < 0 || index * 64 + 64 > commitment.length) {
    throw Error("index is illegal");
  }
  return decodeCurvePointFromUint8Array(
    commitment.slice(index * 64, index * 64 + 32),
    commitment.slice(index * 64 + 32, index * 64 + 64)
  );
}
