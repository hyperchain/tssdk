import { DidAccount } from "../../../account";
import { ContractMethod, ProposalType } from "../../type/vm/bvm";
import ProposalContentOperation from "../porposal-content-operation";

export default class PermissionOperation extends ProposalContentOperation {
  public static Builder: typeof Builder;
}

class Builder {
  private opt: PermissionOperation;
  constructor() {
    this.opt = new PermissionOperation(ProposalType.Permission);
  }

  public createRole(role: string): Builder {
    this.opt.setMethod(ContractMethod.PermissionCreateRole);
    this.opt.setArgs(role);
    return this;
  }

  public deleteRole(role: string): Builder {
    this.opt.setMethod(ContractMethod.PermissionDeleteRole);
    this.opt.setArgs(role);
    return this;
  }

  public grant(role: string, address: string): Builder {
    this.opt.setMethod(ContractMethod.PermissionGrant);
    this.opt.setArgs(role, DidAccount.convertDIDAddrToHex(address));
    return this;
  }

  public revoke(role: string, address: string): Builder {
    this.opt.setMethod(ContractMethod.PermissionRevoke);
    this.opt.setArgs(role, DidAccount.convertDIDAddrToHex(address));
    return this;
  }

  public build(): PermissionOperation {
    return this.opt;
  }
}

PermissionOperation.Builder = Builder;
