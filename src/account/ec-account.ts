import Account, { AccountJSON } from "./account";
import Algo from "./algo";
import { ec as EC } from "elliptic";
import Version from "./version";
import { ByteUtil, StringUtil, HashUtil } from "../common";

export default class ECAccount extends Account {
  private keypair: EC.KeyPair;

  constructor(account: AccountJSON);
  constructor(address: string, publicKey: string, privateKey: string, version: Version, algo: Algo);
  constructor(a: string | AccountJSON, b?: string, c?: string, d?: Version, e?: Algo) {
    if (typeof a === "object") {
      super(a);
    } else {
      super(a!, b!, c!, d!, e!);
    }
    const ec = new EC("secp256k1");
    this.keypair = ec.keyFromPrivate(this.privateKey, "hex");
  }

  public sign(sourceData: string | Uint8Array): string {
    let data: Uint8Array;
    if (typeof sourceData === "string") {
      data = StringUtil.toByte(sourceData);
    } else {
      data = sourceData;
    }
    const hash = HashUtil.sha3(data);
    const signature = this.keypair.sign(hash);
    if (signature.recoveryParam == null) {
      throw new Error("ec account sign error");
    }
    const r = ByteUtil.fromHex(signature.r.toString("hex"), 32);
    const s = ByteUtil.fromHex(signature.s.toString("hex"), 32);
    const recoveryParam = Uint8Array.from([signature.recoveryParam]);
    return ByteUtil.toHex(ByteUtil.concat(Account.ECFlag, r, s, recoveryParam));
  }

  public verify(sourceData: string | Uint8Array, signature: string): boolean {
    let data: Uint8Array;
    if (typeof sourceData === "string") {
      data = StringUtil.toByte(sourceData);
    } else {
      data = sourceData;
    }
    const hash = HashUtil.sha3(data);

    const sigValueBytes = Uint8Array.from(
      ByteUtil.fromHex(signature).slice(Account.ECFlag.byteLength)
    ); // 去掉 flag 1 字节
    const signatureOptions: EC.SignatureOptions = {
      r: sigValueBytes.slice(0, 32),
      s: sigValueBytes.slice(32, 64),
      recoveryParam: sigValueBytes.slice(64)[0],
    };
    return this.keypair.verify(hash, signatureOptions);
  }
}
