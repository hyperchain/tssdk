import { ContractMethod } from "../type/vm/bvm";

export default abstract class Operation {
  private args?: string[];
  private method?: ContractMethod;

  public setArgs(...args: string[]): void {
    this.args = args;
  }

  public setMethod(method: ContractMethod): void {
    this.method = method;
  }

  public getMethod(): ContractMethod | undefined {
    return this.method;
  }

  public getArgs(): string[] | undefined {
    return this.args;
  }
}
