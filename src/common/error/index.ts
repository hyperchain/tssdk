export { default as RequestErrorCode } from "./request-error-code";
export { default as RequestError } from "./request-error";
export * from "./account-error";
export * from "./arg-error";
export * from "./property-error";

export class RuntimeError extends Error {
  constructor(funcName: string, msg?: string) {
    super(`RuntimeError(${funcName})${msg ? `: ${msg}` : ""}`);
  }
}
