import { ContractMethod } from "../../type/vm/bvm";
import BuiltinOperation from "../builtin-operation";
import BuiltinOperationBuilder from "../builtin-operation-builder";

export default class RootCAOperation extends BuiltinOperation {
  public static Builder: typeof Builder;
}

class Builder extends BuiltinOperationBuilder {
  constructor() {
    super(new RootCAOperation());
    this.opt.setAddress("0x0000000000000000000000000000000000ffff0b");
  }

  public addRootCA(rootCA: string): Builder {
    this.opt.setMethod(ContractMethod.RootCAAdd);
    this.opt.setArgs(rootCA);
    return this;
  }

  public getRootCAs(): Builder {
    this.opt.setMethod(ContractMethod.RootCAGet);
    return this;
  }
}

RootCAOperation.Builder = Builder;
