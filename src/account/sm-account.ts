import { sm2 } from "sm-crypto";
import { ByteUtil } from "../common";
import Account from "./account";

export default class SMAccount extends Account {
  public sign(sourceData: string, isDid = false): string {
    const sigValueHex = sm2.doSignature(sourceData, this.privateKey, {
      der: true,
      hash: true,
    });
    return ByteUtil.toHex(
      ByteUtil.concat(
        Account.SMFlag,
        ByteUtil.fromHex(this.publicKey),
        ByteUtil.fromHex(sigValueHex)
      )
    );
  }

  public verify(sourceData: string, signature: string): boolean {
    // 去掉 flag 1 字节 + publicKey.length 字节
    const signatureBytes = Uint8Array.from(
      ByteUtil.fromHex(signature).slice(
        Account.SMFlag.byteLength + ByteUtil.fromHex(this.publicKey).byteLength
      )
    );
    return sm2.doVerifySignature(sourceData, ByteUtil.toHex(signatureBytes), this.publicKey, {
      der: true,
      hash: true,
    });
  }
}
