import BuiltinOperation from "./builtin-operation";

export default abstract class BuiltinOperationBuilder {
  protected opt: BuiltinOperation;

  protected constructor(opt: BuiltinOperation) {
    this.opt = opt;
  }

  /**
   * return build BuiltinOperation.
   */
  public build(): BuiltinOperation {
    return this.opt;
  }
}
