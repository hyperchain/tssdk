import { ContractMethod } from "../../type/vm/bvm";
import BuiltinOperation from "../builtin-operation";
import BuiltinOperationBuilder from "../builtin-operation-builder";

export default class AccountOperation extends BuiltinOperation {
  public static Builder: typeof Builder;
}

class Builder extends BuiltinOperationBuilder {
  constructor() {
    super(new AccountOperation());
    this.opt.setAddress("0x0000000000000000000000000000000000ffff04");
  }

  public register(address: string, cert: string) {
    this.opt.setMethod(ContractMethod.AccountRegister);
    this.opt.setArgs(address, cert);
    return this;
  }

  public abandon(address: string, sdkCert: string) {
    this.opt.setMethod(ContractMethod.AccountAbandon);
    this.opt.setArgs(address, sdkCert);
    return this;
  }
}

AccountOperation.Builder = Builder;
