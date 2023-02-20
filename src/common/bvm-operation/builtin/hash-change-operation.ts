import { AlgoSet, ContractMethod } from "../../type/vm/bvm";
import BuiltinOperation from "../builtin-operation";
import BuiltinOperationBuilder from "../builtin-operation-builder";

export default class HashChangeOperation extends BuiltinOperation {
  public static Builder: typeof Builder;
}

class Builder extends BuiltinOperationBuilder {
  constructor() {
    super(new HashChangeOperation());
    this.opt.setAddress("0x0000000000000000000000000000000000ffff0d");
  }

  public changeHashAlgo(algoSet: AlgoSet): Builder {
    this.opt.setMethod(ContractMethod.HashChangeChangeHashAlgo);
    this.opt.setArgs(JSON.stringify(algoSet));
    return this;
  }

  public getSupportHashAlgo(): Builder {
    this.opt.setMethod(ContractMethod.HashChangeGetSupportHashAlgo);
    return this;
  }

  public getHashAlgo(): Builder {
    this.opt.setMethod(ContractMethod.HashChangeGetHashAlgo);
    return this;
  }
}

HashChangeOperation.Builder = Builder;
