import { Base64Util, ByteUtil, StringUtil } from "../common";
import { ArgError } from "../common";
import { DidAccount } from "../account";

export default class Participant {
  private initiator: string;
  private withholding: string[];

  constructor(initiator: string, withholding: string);
  constructor(initiator: string, withholding: string[]);
  constructor(initiator: string, withholding: string | string[]) {
    this.initiator = initiator;
    if (typeof withholding === "string") {
      this.withholding = [withholding];
    } else {
      if (withholding.length !== 1) {
        throw new ArgError("withholding only support one account");
      }
      this.withholding = withholding;
    }
  }

  /**
   * convert to base64.
   */
  public encodeBase64(): Participant {
    const encodeBase64Str = (str: string) => {
      let bytes;
      if (DidAccount.isDID(str)) {
        bytes = StringUtil.toByte(str);
      } else {
        bytes = ByteUtil.fromHex(str);
      }
      return ByteUtil.toBase64(bytes);
    };
    const initiator = encodeBase64Str(this.initiator);
    const withholding = this.withholding.map((w) => encodeBase64Str(w));
    return new Participant(initiator, withholding);
  }

  /**
   * convert json type to Participant.
   */
  public static parseBase64(initiator: string, withholding: string[]): Participant {
    const decodeBase64Str = (str: string) => {
      const bytes = Base64Util.decodeToUint8Array(str);

      if (DidAccount.isDID(ByteUtil.toString(bytes))) {
        return ByteUtil.toString(bytes);
      }
      return ByteUtil.toHex(bytes);
    };

    const decodedInitiator = decodeBase64Str(initiator);
    const decodedWithholding = withholding.map((w) => decodeBase64Str(w));
    return new Participant(decodedInitiator, decodedWithholding);
  }

  public getInitiator(): string {
    return this.initiator;
  }

  public setInitiator(initiator: string): void {
    this.initiator = initiator;
  }

  public getWithholding(): string[] {
    return this.withholding;
  }

  public setWithholding(withholding: string[]): void {
    this.withholding = withholding;
  }
}
