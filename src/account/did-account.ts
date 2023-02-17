import { AlgoUtil, ByteUtil, StringUtil } from "../common";
import { IllegalAccountError } from "../common";
import Account, { AccountJSON } from "./account";

export default class DidAccount extends Account {
  private readonly didAddress: string;
  private readonly account: Account;

  private static readonly DIDECFlag: Uint8Array = Uint8Array.from([0x86]);
  private static readonly DIDSMFlag: Uint8Array = Uint8Array.from([0x81]);
  private static readonly DIDED25519Flag: Uint8Array = Uint8Array.from([0x82]);

  public static readonly DID_PREFIX = "did:hpc:";

  constructor(account: Account, didAddress: string) {
    super(account.toJSON());
    this.account = account;
    this.didAddress = didAddress;
  }

  public getAddress(): string {
    return this.didAddress;
  }

  public sign(sourceData: string): string {
    if (AlgoUtil.isSM(this.algo)) {
      // 把原签名后的 flag 前缀去掉，改为 did flag
      return ByteUtil.toHex(
        ByteUtil.concat(
          DidAccount.DIDSMFlag,
          Uint8Array.from(
            ByteUtil.fromHex(this.account.sign(sourceData)).slice(Account.SMFlag.byteLength) // 去掉原有的 Flag 字节
          )
        )
      );
    } else if (AlgoUtil.isEC(this.algo)) {
      return ByteUtil.toHex(
        ByteUtil.concat(
          DidAccount.DIDECFlag,
          ByteUtil.fromHex(this.account.getPublicKey()), // 还需要带上 publicKey
          Uint8Array.from(
            ByteUtil.fromHex(this.account.sign(sourceData)).slice(Account.ECFlag.byteLength)
          )
        )
      );
    } else if (AlgoUtil.isED(this.algo)) {
      throw new IllegalAccountError(this);
      // return `${DidAccount.DIDED25519Flag.toString().padStart(2, "0")}${signatureMainPart}`;
    }
    throw new IllegalAccountError(this);
  }

  public verify(sourceData: string, signature: string): boolean {
    if (AlgoUtil.isSM(this.algo)) {
      signature = ByteUtil.toHex(
        ByteUtil.concat(
          Account.SMFlag,
          Uint8Array.from(ByteUtil.fromHex(signature).slice(DidAccount.DIDSMFlag.byteLength))
        )
      );
    } else if (AlgoUtil.isEC(this.algo)) {
      signature = ByteUtil.toHex(
        ByteUtil.concat(
          Account.ECFlag,
          Uint8Array.from(
            ByteUtil.fromHex(signature)
              .slice(DidAccount.DIDECFlag.byteLength)
              .slice(ByteUtil.fromHex(this.account.getPublicKey()).byteLength)
          )
        )
      );
    }
    return this.account.verify(sourceData, signature);
  }

  public toJSONStr(): string {
    return JSON.stringify({
      account: this.toJSON(),
      didAddress: this.didAddress,
    });
  }

  public static isDID(address: string) {
    return address.startsWith(DidAccount.DID_PREFIX);
  }

  public static convertDIDAddrToHex(address: string): string {
    if (DidAccount.isDID(address)) {
      return StringUtil.toHex(address, { startsWith0x: true });
    }
    return StringUtil.toStartWith0x(address);
  }

  public getAccount() {
    return this.account;
  }
}
