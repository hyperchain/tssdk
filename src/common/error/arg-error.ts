/**
 * 函数参数错误
 */
export class ArgError extends Error {
  constructor(msg: string) {
    super(`ArgError: ${msg}`);
  }
}

export class ArgEmptyError extends ArgError {
  constructor(arg: string) {
    super(`${arg} can't be empty!`);
  }
}
