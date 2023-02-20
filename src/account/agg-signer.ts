import { ArgError } from "../common";
import { ByteUtil, StringUtil, HashUtil } from "../common";
import { Transaction } from "../transaction";
import Account from "./account";
import { AggContext } from "./crypto";
import DidAccount from "./did-account";
import SMAccount from "./sm-account";

export default class AggSigner {
  public static readonly AGGFlag: Uint8Array = Uint8Array.from([7]);
  public static readonly DIDAggFlag: Uint8Array = Uint8Array.from([7 | 128]);

  private account?: Account;
  private publicKeys?: string[];
  private address?: string;
  private publicKey?: string;
  private index: number;
  private aggContext?: AggContext;
  private hasDid?: boolean;

  public constructor(self: Account, publicKeys: string[]) {
    this.index = -1;
    let account: Account;
    if (self instanceof DidAccount) {
      account = self.getAccount();
      this.hasDid = true;
    } else {
      account = self;
    }
    if (!(account instanceof SMAccount)) {
      throw new ArgError("only support sm account");
    }
    this.account = self;
    this.publicKeys = publicKeys;
    for (let i = 0; i < publicKeys.length; i += 1) {
      if (publicKeys[i] === this.account.getPublicKey()) {
        this.index = i;
        break;
      }
    }
    if (this.index == -1) {
      throw new ArgError(`account ${account.getAddress()} is not in list ${publicKeys}`);
    }
    this.aggContext = new AggContext(this.index, publicKeys);
    this.publicKey = this.aggContext.getPK(-1);
    this.address = ByteUtil.toHex(HashUtil.sha3omit12(ByteUtil.fromHex(this.publicKey)));
  }

  /**
   * create self commitment.
   */
  public commitment(): Uint8Array {
    return this.aggContext!.init();
  }

  public aggCommitment(...commitments: Uint8Array[]): Uint8Array {
    return this.aggContext!.aggCommitment(...commitments);
  }

  public partSign(msg: Uint8Array | Transaction, aggCommitment: Uint8Array): Uint8Array {
    if (msg instanceof Transaction) {
      msg.setNeedHashString();
      const needHashString = msg.getNeedHashString() || "";
      msg = StringUtil.toByte(needHashString);
    }
    return this.aggContext!.partSign(this.account?.toJSON().privateKey ?? "", msg, aggCommitment);
  }

  public aggSign(...signs: Uint8Array[]) {
    let flag = AggSigner.AGGFlag;
    if (this.hasDid) {
      flag = AggSigner.DIDAggFlag;
    }
    const aggSign = this.aggContext!.aggSign(...signs);
    return ByteUtil.concat(flag, ByteUtil.fromHex(this.publicKey), aggSign);
  }

  public verify(msg: Uint8Array, sign: Uint8Array): boolean {
    return this.aggContext!.verify(this.publicKey!, msg, sign.slice(66, 66 + 65));
  }

  public getAddress() {
    return this.address;
  }

  public getAccount() {
    return this.account;
  }

  public getPublicKeys() {
    return this.publicKeys;
  }

  public getPublicKey() {
    return this.publicKey;
  }

  public setHasDID(hasDID: boolean) {
    this.hasDid = hasDID;
  }

  public isHasDID() {
    return this.hasDid;
  }
}
