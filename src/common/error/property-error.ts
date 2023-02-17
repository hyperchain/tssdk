/**
 * class 属性错误
 */
export class PropertyError extends Error {
  constructor(msg: string) {
    super(`PropertyError: ${msg}`);
  }
}

export class PropertyEmptyError extends PropertyError {
  constructor(property: string) {
    super(`${property} can't be empty!`);
  }
}
