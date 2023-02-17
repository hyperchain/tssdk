import { ContractMethod, GenesisInfo } from "../../type/vm/bvm";
import BuiltinOperation from "../builtin-operation";
import BuiltinOperationBuilder from "../builtin-operation-builder";

export default class HashOperation extends BuiltinOperation {
  public static Builder: typeof Builder;
}

class Builder extends BuiltinOperationBuilder {
  constructor() {
    super(new HashOperation());
    this.opt.setAddress("0x0000000000000000000000000000000000ffff01");
  }

  public setGenesisInfoForHpc(genesisInfo: GenesisInfo): Builder {
    this.opt.setMethod(ContractMethod.HashSet);
    this.opt.setArgs("the_key_for_genesis_info", JSON.stringify(genesisInfo));
    return this;
  }

  public getGenesisInfoForHpc(): Builder {
    this.opt.setMethod(ContractMethod.HashGet);
    this.opt.setArgs("the_key_for_genesis_info");
    return this;
  }

  public set(key: string, value: string): Builder {
    this.opt.setMethod(ContractMethod.HashSet);
    this.opt.setArgs(key, value);
    return this;
  }

  public get(key: string): Builder {
    this.opt.setMethod(ContractMethod.HashGet);
    this.opt.setArgs(key);
    return this;
  }
}

HashOperation.Builder = Builder;
