export function encode(data: string | Uint8Array): string {
  return Buffer.from(data).toString("base64"); // 结果 Base64 字符串
}

export function decode(encodedStr?: string): ArrayBuffer {
  if (encodedStr == null) {
    return Buffer.from([]);
  }
  return Buffer.from(encodedStr, "base64"); // 解码后的结果，可能有多种含义（不能直接转化为字符串）
}

export function decodeToUint8Array(encodedStr?: string): Uint8Array {
  return new Uint8Array(decode(encodedStr));
}

export function decodeToString(encodedStr?: string): string {
  return new TextDecoder("utf-8").decode(decode(encodedStr));
}
