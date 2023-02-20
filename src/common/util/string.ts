import * as ByteUtil from "./byte";

export function toStartWith0x(
  str: string,
  options?: {
    toLowerCase?: boolean;
  }
) {
  const { toLowerCase = false } = options || {};
  if (toLowerCase) {
    str = str.toLowerCase();
  }
  return str.startsWith("0x") ? str : `0x${str}`;
}

export function toByte(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export function isBlank(str?: string): boolean {
  return str == null || str === "";
}

export function fromHex(str: string): string {
  if (str.startsWith("0x")) {
    str = str.slice(2);
  }
  return ByteUtil.toString(ByteUtil.fromHex(str));
}

export function toHex(
  str: string,
  options?: {
    startsWith0x?: boolean | undefined;
  }
): string {
  return ByteUtil.toHex(toByte(str), options);
}

export function toStartWithout0x(str: string) {
  return str.startsWith("0x") ? str.substring(2) : str;
}
