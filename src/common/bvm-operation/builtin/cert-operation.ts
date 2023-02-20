import { ContractMethod } from "../../type/vm/bvm";
import * as CertUtil from "../../util/cert";
import BuiltinOperation from "../builtin-operation";
import BuiltinOperationBuilder from "../builtin-operation-builder";

export default class CertOperation extends BuiltinOperation {
  public static Builder: typeof Builder;
}

class Builder extends BuiltinOperationBuilder {
  constructor() {
    super(new CertOperation());
    this.opt.setAddress("0x0000000000000000000000000000000000ffff05");
  }

  public revoke(cert: string, priv: string | null): Builder;
  public revoke(cert: string): Builder;
  public revoke(cert: string, priv?: string | null): Builder {
    if (priv === undefined) {
      this.opt.setMethod(ContractMethod.CertRevoke);
      this.opt.setArgs(cert, "", "");
      return this;
    }
    const msg = "revoke";
    let sign = "sign";
    if (priv !== null) {
      try {
        const certKeyPair = CertUtil.newCertKeyPair(
          Buffer.from(cert, "utf-8"),
          Buffer.from(priv, "utf-8")
        );
        sign = CertUtil.signData(msg, certKeyPair);
      } catch (e) {
        sign = "sign";
      }
    }
    this.opt.setMethod(ContractMethod.CertRevoke);
    this.opt.setArgs(cert, msg, sign);
    return this;
  }

  public check(cert: string): Builder {
    this.opt.setMethod(ContractMethod.CertCheck);
    this.opt.setArgs(cert);
    return this;
  }

  public freeze(cert: string, priv: string): Builder {
    const msg = "freeze";
    let sign = "sign";
    if (priv != null) {
      try {
        const certKeyPair = CertUtil.newCertKeyPair(
          Buffer.from(cert, "utf-8"),
          Buffer.from(priv, "utf-8")
        );
        sign = CertUtil.signData(msg, certKeyPair);
      } catch (e) {
        sign = "sign";
      }
    }

    this.opt.setMethod(ContractMethod.CertFreeze);
    this.opt.setArgs(cert, msg, sign);
    return this;
  }

  public unfreeze(cert: string, priv: string): Builder {
    const msg = "unfreeze";
    let sign = "sign";
    if (priv != null) {
      try {
        const certKeyPair = CertUtil.newCertKeyPair(
          Buffer.from(cert, "utf-8"),
          Buffer.from(priv, "utf-8")
        );
        sign = CertUtil.signData(msg, certKeyPair);
      } catch (e) {
        sign = "sign";
      }
    }

    this.opt.setMethod(ContractMethod.CertUnfreeze);
    this.opt.setArgs(cert, msg, sign);
    return this;
  }
}

CertOperation.Builder = Builder;
