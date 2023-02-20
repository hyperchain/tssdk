import { CAMode, ContractMethod, ProposalType } from "../../type/vm/bvm";
import ProposalContentOperation from "../porposal-content-operation";

export default class CAModeOperation extends ProposalContentOperation {
  public static Builder: typeof Builder;
}

class Builder {
  private opt: CAModeOperation;

  constructor() {
    this.opt = new CAModeOperation(ProposalType.CA);
  }

  public setCAMode(mode: CAMode): Builder {
    this.opt.setMethod(ContractMethod.CASetCAMode);
    this.opt.setArgs(mode.toString());
    return this;
  }

  public getCAMode() {
    this.opt.setMethod(ContractMethod.CAGetCAMode);
    return this;
  }

  public build(): CAModeOperation {
    return this.opt;
  }
}

CAModeOperation.Builder = Builder;
