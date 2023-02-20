import { Account } from "../../account";
import { ByteUtil } from "../../common";
import { algo2AlgoType } from "./util";

export default class DidPublicKey {
  private type: string | null;
  private readonly key: string;

  private constructor(type: string | null, key: string) {
    this.type = type;
    this.key = key;
  }

  public static getPublicKeyFromAccount(didAccount: Account) {
    const algo = didAccount.getAlgo();
    const type = algo2AlgoType(algo);
    return new DidPublicKey(type, ByteUtil.toBase64(ByteUtil.fromHex(didAccount.getPublicKey())));
  }

  public getKey() {
    return this.key;
  }
}
