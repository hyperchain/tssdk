import { ContractMethod, ProposalType } from "../../type/vm/bvm";
import * as ByteUtil from "../../util/byte";
import ProposalContentOperation from "../porposal-content-operation";

export default class NodeOperation extends ProposalContentOperation {
  public static Builder: typeof Builder;
}

class Builder {
  private opt: NodeOperation;
  constructor() {
    this.opt = new NodeOperation(ProposalType.Node);
  }

  public addNode(pub: Uint8Array, hostname: string, role: string, namespace: string): Builder {
    this.opt.setMethod(ContractMethod.NodeAddNode);
    this.opt.setArgs(ByteUtil.toString(pub), hostname, role, namespace);
    return this;
  }

  public addVP(hostname: string, namespace: string): Builder {
    this.opt.setMethod(ContractMethod.NodeAddVP);
    this.opt.setArgs(hostname, namespace);
    return this;
  }

  public removeVP(hostname: string, namespace: string): Builder {
    this.opt.setMethod(ContractMethod.NodeRemoveVP);
    this.opt.setArgs(hostname, namespace);
    return this;
  }

  public build(): NodeOperation {
    return this.opt;
  }
}

NodeOperation.Builder = Builder;
