import { ContractMethod, MPCCurveType } from "../../type/vm/bvm";
import * as ByteUtil from "../../util/byte";
import BuiltinOperation from "../builtin-operation";
import BuiltinOperationBuilder from "../builtin-operation-builder";

export default class MPCOperation extends BuiltinOperation {
  public static Builder: typeof Builder;
}

class Builder extends BuiltinOperationBuilder {
  constructor() {
    super(new MPCOperation());
    this.opt.setAddress("0x0000000000000000000000000000000000ffff09");
  }

  public getInfo(tag: string, ct: string | MPCCurveType): Builder {
    this.opt.setMethod(ContractMethod.SRSInfo);
    this.opt.setArgs(tag, ct);
    return this;
  }

  public beacon(ptau: Uint8Array): Builder {
    this.opt.setMethod(ContractMethod.SRSBeacon);
    this.opt.setArgs(ByteUtil.toHex(ptau));
    return this;
  }

  public getHis(ct: string | MPCCurveType): Builder {
    this.opt.setMethod(ContractMethod.SRSHistory);
    this.opt.setArgs(ct);
    return this;
  }
}

MPCOperation.Builder = Builder;
