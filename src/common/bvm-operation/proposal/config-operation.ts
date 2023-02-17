import * as JSONBigintUtil from "../../util/json-bigint";
import { ContractMethod, NsFilterRule, ProposalType } from "../../type/vm/bvm";
import ProposalContentOperation from "../porposal-content-operation";

export default class ConfigOperation extends ProposalContentOperation {
  public static Builder: typeof Builder;
}

class Builder {
  private opt: ConfigOperation;

  constructor() {
    this.opt = new ConfigOperation(ProposalType.Config);
  }

  public setFilterEnable(enable: boolean): Builder {
    this.opt.setMethod(ContractMethod.ConfigSetFilterEnable);
    this.opt.setArgs(JSON.stringify(enable));
    return this;
  }

  public setFilterRules(rules: NsFilterRule[]): Builder {
    this.opt.setMethod(ContractMethod.ConfigSetFilterRules);
    this.opt.setArgs(JSON.stringify(rules));
    return this;
  }

  public setConsensusAlgo(algo: string): Builder {
    this.opt.setMethod(ContractMethod.ConfigSetConsensusAlgo);
    this.opt.setArgs(algo);
    return this;
  }

  public updateConsensusAlgo(algo: string): Builder {
    this.opt.setMethod(ContractMethod.ConfigUpdateConsensusAlgo);
    this.opt.setArgs(algo);
    return this;
  }

  public setConsensusSetSize(size: number): Builder {
    this.opt.setMethod(ContractMethod.ConfigSetConsensusSetSize);
    this.opt.setArgs(JSON.stringify(size));
    return this;
  }

  public setConsensusBatchSize(size: number): Builder {
    this.opt.setMethod(ContractMethod.ConfigSetConsensusBatchSize);
    this.opt.setArgs(JSON.stringify(size));
    return this;
  }

  public setConsensusPoolSize(size: number): Builder {
    this.opt.setMethod(ContractMethod.ConfigSetConsensusPoolSize);
    this.opt.setArgs(JSON.stringify(size));
    return this;
  }

  public setProposalTimeout(timeout: bigint): Builder {
    this.opt.setMethod(ContractMethod.ConfigSetProposalTimeout);
    this.opt.setArgs(JSONBigintUtil.stringify(timeout));
    return this;
  }

  public setProposalThreshold(threshold: number): Builder {
    this.opt.setMethod(ContractMethod.ConfigSetProposalThreshold);
    this.opt.setArgs(JSON.stringify(threshold));
    return this;
  }

  public setContractVoteEnable(enable: boolean): Builder {
    this.opt.setMethod(ContractMethod.ConfigSetContractVoteEnable);
    this.opt.setArgs(JSON.stringify(enable));
    return this;
  }

  public setContractVoteThreshold(threshold: number): Builder {
    this.opt.setMethod(ContractMethod.ConfigSetContractVoteThreshold);
    this.opt.setArgs(JSON.stringify(threshold));
    return this;
  }

  public setGasPrice(gasPrice: bigint): Builder {
    this.opt.setMethod(ContractMethod.ConfigSetGasPrice);
    this.opt.setArgs(JSONBigintUtil.stringify(gasPrice));
    return this;
  }

  public build(): ConfigOperation {
    return this.opt;
  }
}

ConfigOperation.Builder = Builder;
