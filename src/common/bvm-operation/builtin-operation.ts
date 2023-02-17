import Operation from "./operation";

export default class BuiltinOperation extends Operation {
  private address?: string;
  private base64Index?: boolean[];

  public getAddress(): string | undefined {
    return this.address;
  }

  public setAddress(address: string): void {
    this.address = address;
  }

  public getBase64Index(): boolean[] | undefined {
    return this.base64Index;
  }

  /**
   * set base64 decode index.
   * @param index the base64 decode param index
   */
  public setBase64Index(...indexes: number[]): void {
    if (indexes.length === 0) {
      return;
    }
    this.base64Index = new Array(this.getArgs()?.length || 0).fill(false);
    for (const i of indexes) {
      this.base64Index[i] = true;
    }
  }
}
