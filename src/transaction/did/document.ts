import { DidAccount, Account } from "../../account";
import DidPublicKey from "./public-key";

export default class Document {
  public static readonly NORMAL = 0;
  public static readonly FREEZE = 1;
  public static readonly ABANDON = 2;

  private didAddress: string;
  private state: number;
  private publicKey: DidPublicKey;
  private admins: string[];
  private extra?: { [key: string]: any };

  public constructor(didAccount: Account, admins: string[]) {
    this.didAddress = didAccount.getAddress();
    this.publicKey = DidPublicKey.getPublicKeyFromAccount(didAccount);
    this.state = Document.NORMAL;
    this.admins = admins;
  }
}
