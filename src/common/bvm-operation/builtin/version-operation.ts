import { ContractMethod } from "../../type/vm/bvm";
import BuiltinOperation from "../builtin-operation";
import BuiltinOperationBuilder from "../builtin-operation-builder";

export default class VersionOperation extends BuiltinOperation {
  public static Builder: typeof Builder;
}

class Builder extends BuiltinOperationBuilder {
  constructor() {
    super(new VersionOperation());
    this.opt.setAddress("0x0000000000000000000000000000000000ffff0c");
  }

  public getLatestVersions(): Builder {
    this.opt.setMethod(ContractMethod.VersionGetLatestVersions);
    return this;
  }

  public getSupportedVersionByHostname(hostname: string): Builder {
    this.opt.setMethod(ContractMethod.VersionGetSupportedVersionByHostname);
    this.opt.setArgs(hostname);
    return this;
  }
}

VersionOperation.Builder = Builder;
