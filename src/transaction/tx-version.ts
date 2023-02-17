export default class TxVersion {
  public static readonly TxVersion10: TxVersion = new TxVersion("1.0");
  public static readonly TxVersion20: TxVersion = new TxVersion("2.0");
  public static readonly TxVersion21: TxVersion = new TxVersion("2.1");
  public static readonly TxVersion22: TxVersion = new TxVersion("2.2");
  public static readonly TxVersion25: TxVersion = new TxVersion("2.5");
  public static readonly TxVersion26: TxVersion = new TxVersion("2.6");
  public static readonly TxVersion30: TxVersion = new TxVersion("3.0");
  public static readonly TxVersion32: TxVersion = new TxVersion("3.2");
  public static readonly TxVersion34: TxVersion = new TxVersion("3.4");
  public static readonly TxVersion36: TxVersion = new TxVersion("3.6");
  public static readonly TxVersion37: TxVersion = new TxVersion("3.7");
  public static readonly TxVersion41: TxVersion = new TxVersion("4.1");
  public static readonly GLOBAL_TX_VERSION: TxVersion = TxVersion.TxVersion30;

  private strVersion: string;

  public constructor(sv: string) {
    this.strVersion = sv;
  }

  public getVersion(): string {
    return this.strVersion;
  }

  public isGreaterOrEqual(txV: TxVersion): boolean {
    if (this.compare(txV) >= 0) {
      return true;
    }
    return false;
  }

  public equal(txV: TxVersion): boolean {
    if (this.compare(txV) === 0) {
      return true;
    }
    return false;
  }

  private compare(txV: TxVersion): number {
    const res1: string[] = this.strVersion.split(/\./);
    const res2: string[] = txV.strVersion.split(/\./);
    let i1 = 0;
    let i2 = 0;
    while (i1 < res1.length || i2 < res2.length) {
      let t1 = 0;
      let t2 = 0;
      if (i1 < res1.length) {
        t1 = parseInt(res1[i1]);
        i1 += 1;
      }
      if (i2 > res2.length) {
        t2 = parseInt(res2[i2]);
        i2 += 1;
      }
      if (t1 > t2) {
        return 1;
      } else if (t1 < t2) {
        return -1;
      }
    }
    return 0;
  }

  /**
   * convert string to TxVersion struct.
   */
  public static convertTxVersion(strVersion: string): TxVersion {
    return new TxVersion(strVersion);
  }
}
