import { ContractMethod } from "../../type/vm/bvm";
import BuiltinOperation from "../builtin-operation";
import BuiltinOperationBuilder from "../builtin-operation-builder";

export default class BalanceOperation extends BuiltinOperation {
  public static Builder: typeof Builder;
}

class Builder extends BuiltinOperationBuilder {
  constructor() {
    super(new BalanceOperation());
    this.opt.setAddress("0x0000000000000000000000000000000000ffff0e");
  }

  public issue(targetAddr: string, value: bigint): Builder {
    this.opt.setMethod(ContractMethod.IssueBalance);
    this.opt.setArgs(targetAddr, value.toString());
    return this;
  }
}

BalanceOperation.Builder = Builder;
