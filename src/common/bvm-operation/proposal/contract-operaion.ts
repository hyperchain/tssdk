import VmType from "../../type/vm/vm-type";
import ProposalContentOperation from "../porposal-content-operation";
import * as Base64Util from "../../util/base64";
import * as ByteUtil from "../../util/byte";
import { ContractManageOption, ContractMethod, ProposalType } from "../../type/vm/bvm";

export default class ContractOperation extends ProposalContentOperation {
  public static Builder: typeof Builder;
}

class Builder {
  private opt: ContractOperation;

  constructor() {
    this.opt = new ContractOperation(ProposalType.Contract);
  }

  public deploy(
    source: string,
    bin: string,
    vmType: VmType,
    compileOpt: Record<string, string> | null
  ): Builder {
    this.opt.setMethod(ContractMethod.ContractDeployContract);

    const option: ContractManageOption = {
      vmType,
      source: Base64Util.encode(source),
      bin: Base64Util.encode(ByteUtil.fromHex(bin)),
      compileOpt,
    };
    this.opt.setArgs(JSON.stringify(option));

    return this;
  }

  public upgrade(
    source: string,
    bin: string,
    vmType: VmType,
    addr: string,
    compileOpt: Record<string, string>
  ): Builder {
    this.opt.setMethod(ContractMethod.ContractUpgradeContract);

    const option: ContractManageOption = {
      vmType,
      source: Base64Util.encode(source),
      bin: Base64Util.encode(ByteUtil.fromHex(bin)),
      compileOpt,
      addr,
    };
    this.opt.setArgs(JSON.stringify(option));

    return this;
  }

  public upgradeByName(
    source: string,
    bin: string,
    vmType: VmType,
    name: string,
    compileOpt: Record<string, string>
  ): Builder {
    this.opt.setMethod(ContractMethod.ContractUpgradeContract);

    const option: ContractManageOption = {
      vmType,
      source: Base64Util.encode(source),
      bin: Base64Util.encode(ByteUtil.fromHex(bin)),
      compileOpt,
      name,
    };
    this.opt.setArgs(JSON.stringify(option));

    return this;
  }

  public maintain(vmType: VmType, addr: string, opCode: number): Builder {
    this.opt.setMethod(ContractMethod.ContractMaintainContract);

    const option: ContractManageOption = {
      vmType,
      addr,
      opCode,
    };
    this.opt.setArgs(JSON.stringify(option));

    return this;
  }

  public maintainByName(vmType: VmType, name: string, opCode: number): Builder {
    this.opt.setMethod(ContractMethod.ContractMaintainContract);

    const option: ContractManageOption = {
      vmType,
      name,
      opCode,
    };
    this.opt.setArgs(JSON.stringify(option));

    return this;
  }

  public build(): ContractOperation {
    return this.opt;
  }
}

ContractOperation.Builder = Builder;
