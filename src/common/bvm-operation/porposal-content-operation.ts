import { ProposalType } from "../type/vm/bvm";
import Operation from "./operation";

export default abstract class ProposalContentOperation extends Operation {
  private pty: ProposalType;

  constructor(pty: ProposalType) {
    super();
    this.pty = pty;
  }

  public setPty(pty: ProposalType) {
    this.pty = pty;
  }
}
