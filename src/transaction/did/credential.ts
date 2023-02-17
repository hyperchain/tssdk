import { v4 as uuidv4 } from "uuid";
import { Account } from "../../account";
import { NumUtil } from "../../common";
import { algo2AlgoType } from "./util";

export default class Credential {
  private readonly id: string;
  private readonly type: string;
  private readonly issuer: string;
  private readonly holder: string;
  private readonly issuanceDate: bigint;
  private readonly expirationDate: bigint;
  private signType?: string | null;
  private signature?: string;
  private readonly subject: string | null;

  constructor(
    type: string,
    issuer: string,
    holder: string,
    expirationDate: bigint,
    subject: string | null
  ) {
    this.id = uuidv4();
    this.type = type;
    this.issuer = issuer;
    this.holder = holder;
    this.issuanceDate = BigInt(
      new Date().valueOf() * 1000000 + 1000 + Math.floor(Math.random() * (1000000 - 1000 + 1))
    );
    this.expirationDate = expirationDate;
    this.subject = subject;
  }

  public sign(didAccount: Account): void {
    this.signType = algo2AlgoType(didAccount.getAlgo());
    const needHashString = this.toNeedHashString();
    this.signature = didAccount.sign(needHashString);
  }

  public verify(didAccount: Account): boolean {
    this.signType = algo2AlgoType(didAccount.getAlgo());
    const needHashString = this.toNeedHashString();
    if (this.signature == null) {
      return false;
    }
    return didAccount.verify(needHashString, this.signature);
  }

  private toNeedHashString(): string {
    const query: { [key: string]: string | null | undefined } = {
      id: this.id,
      type: this.type,
      issuer: this.issuer,
      holder: this.holder,
      issuanceDate: NumUtil.toHex(this.issuanceDate),
      expirationDate: NumUtil.toHex(this.expirationDate),
      subject: this.subject,
      signType: this.signType,
    };

    return Object.entries(query)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
  }

  public getId() {
    return this.id;
  }
}
