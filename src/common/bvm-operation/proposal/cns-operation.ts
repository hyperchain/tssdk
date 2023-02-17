import { ContractMethod, ProposalType } from "../../type/vm/bvm";
import ProposalContentOperation from "../porposal-content-operation";

export default class CNSOperation extends ProposalContentOperation {
  public static Builder: typeof Builder;
}

class Builder {
  private opt: CNSOperation;
  constructor() {
    this.opt = new CNSOperation(ProposalType.CNS);
  }

  public setCName(address: string, name: string): Builder {
    this.opt.setMethod(ContractMethod.CNSSetCName);
    this.opt.setArgs(address, name);
    return this;
  }

  public build(): CNSOperation {
    return this.opt;
  }
}

CNSOperation.Builder = Builder;
