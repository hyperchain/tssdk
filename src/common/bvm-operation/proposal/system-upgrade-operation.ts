import { ContractMethod, ProposalType } from "../../type/vm/bvm";
import { ChainVersion } from "../../type/service/version-service";
import ProposalContentOperation from "../porposal-content-operation";

export default class SystemUpgradeOperation extends ProposalContentOperation {
  public static Builder: typeof Builder;
}

class Builder {
  private opt: SystemUpgradeOperation;
  constructor() {
    this.opt = new SystemUpgradeOperation(ProposalType.System);
  }

  public systemUpgrade(chainVersion: ChainVersion): Builder {
    this.opt.setMethod(ContractMethod.SystemUpgrade);
    this.opt.setArgs(JSON.stringify(chainVersion));
    return this;
  }

  public build(): SystemUpgradeOperation {
    return this.opt;
  }
}

SystemUpgradeOperation.Builder = Builder;
