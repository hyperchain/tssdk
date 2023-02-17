import { HttpProvider, Provider } from "../../provider";

/**
 * 判断类型
 */
export function is<T>(v: any, keys: string[]): v is T {
  if (v == null) {
    return false;
  }
  return keys.every((key) => key in v);
}

// export function isNodeJSReadableStream(v: any): v is NodeJS.ReadableStream {
//   return is<NodeJS.ReadableStream>(v, ["readable"]);
// }

// export function isReadableStream(v: any): v is ReadableStream {
//   return is<ReadableStream>(v, ["getReader"]);
// }

// export function isArrayBuffer(v: any): v is ArrayBuffer {
//   return is<ArrayBuffer>(v, ["byteLength"]);
// }

// export function isGrpcProvider(provider: Provider): provider is GrpcProvider {
//   return provider instanceof GrpcProvider;
// }

export function isHttpProvider(provider: Provider): provider is HttpProvider {
  return provider instanceof HttpProvider;
}
