import Algo from "./algo";
import Version from "./version";

export interface AccountJSON {
  address: string;
  publicKey: string;
  privateKey: string;
  version: Version;
  algo: Algo;
}

export default abstract class Account {
  protected static readonly ECFlag: Uint8Array = Uint8Array.from([0]);
  protected static readonly SMFlag: Uint8Array = Uint8Array.from([1]);
  protected static readonly ED25519Flag: Uint8Array = Uint8Array.from([2]);
  protected static readonly R1Flag: Uint8Array = Uint8Array.from([5]);
  protected static readonly PKIFlag: Uint8Array = Uint8Array.from([4]);

  protected address: string;
  protected publicKey: string;
  protected privateKey: string;
  protected version: Version;
  protected algo: Algo;

  constructor(account: AccountJSON);
  constructor(address: string, publicKey: string, privateKey: string, version: Version, algo: Algo);
  constructor(a: string | AccountJSON, b?: string, c?: string, d?: Version, e?: Algo) {
    if (typeof a === "object") {
      const account = a;
      this.address = account.address;
      this.publicKey = account.publicKey;
      this.privateKey = account.privateKey;
      this.algo = account.algo;
      this.version = account.version;
    } else {
      this.address = a!;
      this.publicKey = b!;
      this.privateKey = c!;
      this.version = d!;
      this.algo = e!;
    }
  }

  public abstract sign(sourceData: string): string;
  public abstract verify(sourceData: string, signature: string): boolean;

  public getPublicKey(): string {
    return this.publicKey;
  }

  public getAddress(): string {
    return this.address;
  }

  public getAlgo(): Algo {
    return this.algo;
  }

  public toJSON(): AccountJSON {
    const account: AccountJSON = {
      address: this.address,
      publicKey: this.publicKey,
      privateKey: this.privateKey,
      version: this.version,
      algo: this.algo,
    };
    return account;
  }

  public toJSONStr(): string {
    return JSON.stringify(this.toJSON());
  }
}
