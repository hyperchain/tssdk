import * as Base64Util from "../../util/base64";
import * as EncodeUtil from "../../util/encode";
import { ContractMethod, ProposalType } from "../../type/vm/bvm";
import BuiltinOperation from "../builtin-operation";
import BuiltinOperationBuilder from "../builtin-operation-builder";
import NodeOperation from "../proposal/node-operation";
import CNSOperation from "../proposal/cns-operation";
import CAModeOperation from "../proposal/ca-mode-operation";
import PermissionOperation from "../proposal/permission-operation";
import ContractOperation from "../proposal/contract-operaion";
import ConfigOperation from "../proposal/config-operation";
import SystemUpgradeOperation from "../proposal/system-upgrade-operation";

export default class ProposalOperation extends BuiltinOperation {
  public static Builder: typeof Builder;
}

class Builder extends BuiltinOperationBuilder {
  constructor() {
    super(new ProposalOperation());
    this.opt.setAddress("0x0000000000000000000000000000000000ffff02");
  }

  public createForNode(...opts: NodeOperation[]): Builder {
    this.opt.setMethod(ContractMethod.ProposalCreate);
    this.opt.setArgs(Base64Util.encode(EncodeUtil.encodeProposalContents(opts)), ProposalType.Node);
    this.opt.setBase64Index(0);
    return this;
  }

  public createForCNS(...opts: CNSOperation[]): Builder {
    this.opt.setMethod(ContractMethod.ProposalCreate);
    this.opt.setArgs(Base64Util.encode(EncodeUtil.encodeProposalContents(opts)), ProposalType.CNS);
    this.opt.setBase64Index(0);
    return this;
  }

  public createForCAMode(...opts: CAModeOperation[]): Builder {
    this.opt.setMethod(ContractMethod.ProposalCreate);
    this.opt.setArgs(Base64Util.encode(EncodeUtil.encodeProposalContents(opts)), ProposalType.CA);
    this.opt.setBase64Index(0);
    return this;
  }

  public directForCAMode(...opts: CAModeOperation[]): Builder {
    this.opt.setMethod(ContractMethod.ProposalDirect);
    this.opt.setArgs(Base64Util.encode(EncodeUtil.encodeProposalContents(opts)), ProposalType.CA);
    this.opt.setBase64Index(0);
    return this;
  }

  public directForNode(...opts: NodeOperation[]): Builder {
    this.opt.setMethod(ContractMethod.ProposalDirect);
    this.opt.setArgs(Base64Util.encode(EncodeUtil.encodeProposalContents(opts)), ProposalType.Node);
    this.opt.setBase64Index(0);
    return this;
  }

  public createForPermission(...opts: PermissionOperation[]): Builder {
    this.opt.setMethod(ContractMethod.ProposalCreate);
    this.opt.setArgs(
      Base64Util.encode(EncodeUtil.encodeProposalContents(opts)),
      ProposalType.Permission
    );
    this.opt.setBase64Index(0);
    return this;
  }

  public createForContract(...opts: ContractOperation[]): Builder {
    this.opt.setMethod(ContractMethod.ProposalCreate);
    this.opt.setArgs(
      Base64Util.encode(EncodeUtil.encodeProposalContents(opts)),
      ProposalType.Contract
    );
    this.opt.setBase64Index(0);
    return this;
  }

  public createForConfig(...opts: ConfigOperation[]): Builder {
    this.opt.setMethod(ContractMethod.ProposalCreate);
    this.opt.setArgs(
      Base64Util.encode(EncodeUtil.encodeProposalContents(opts)),
      ProposalType.Config
    );
    this.opt.setBase64Index(0);
    return this;
  }

  public createForSystemUpgrade(...opts: SystemUpgradeOperation[]): Builder {
    this.opt.setMethod(ContractMethod.ProposalCreate);
    this.opt.setArgs(
      Base64Util.encode(EncodeUtil.encodeProposalContents(opts)),
      ProposalType.System
    );
    this.opt.setBase64Index(0);
    return this;
  }

  public vote(proposalId: number, vote: boolean): Builder {
    this.opt.setMethod(ContractMethod.ProposalVote);
    this.opt.setArgs(JSON.stringify(proposalId), JSON.stringify(vote));
    return this;
  }

  public cancel(proposalId: number): Builder {
    this.opt.setMethod(ContractMethod.ProposalCancel);
    this.opt.setArgs(JSON.stringify(proposalId));
    return this;
  }

  public execute(proposalId: number): Builder {
    this.opt.setMethod(ContractMethod.ProposalExecute);
    this.opt.setArgs(JSON.stringify(proposalId));
    return this;
  }
}

ProposalOperation.Builder = Builder;
