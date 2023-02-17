import { ContractMethod } from "../../type/vm/bvm";
import BuiltinOperation from "../builtin-operation";
import BuiltinOperationBuilder from "../builtin-operation-builder";

export default class DIDOperation extends BuiltinOperation {
  public static Builder: typeof Builder;
}

class Builder extends BuiltinOperationBuilder {
  constructor() {
    super(new DIDOperation());
    this.opt.setAddress("0x0000000000000000000000000000000000ffff06");
  }

  public setChainID(chainID: string): Builder {
    this.opt.setMethod(ContractMethod.DIDSetChainID);
    this.opt.setArgs(chainID);
    return this;
  }
}

DIDOperation.Builder = Builder;
