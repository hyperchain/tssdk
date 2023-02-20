import { ArgError } from "../error";

export function toHex(
  data: Uint8Array | ArrayBuffer,
  options?: {
    startsWith0x?: boolean;
  }
) {
  return `${options?.startsWith0x ? "0x" : ""}${[...new Uint8Array(data)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function toString(data: Uint8Array | ArrayBuffer): string {
  return new TextDecoder().decode(data);
}

// 返回正数
export function toBigInt(data: Uint8Array | ArrayBuffer): bigint {
  return BigInt(toHex(data, { startsWith0x: true }));
}

// 返回正数
export function toNumber(data: Uint8Array | ArrayBuffer): number {
  return Number(toBigInt(data));
}

export function fromHex(hexString?: string, byteLength?: number) {
  if (hexString == null) {
    return Uint8Array.from([0]);
  }
  if (hexString.startsWith("0x")) {
    hexString = hexString.substring(2);
  }
  if (hexString.length % 2 !== 0) {
    hexString = "0" + hexString;
  }
  const matchArr = hexString.match(/.{2}/g);
  if (matchArr == null) {
    throw new ArgError(`can't convert ${hexString} to Uint8Array`);
  }
  let bytes = Uint8Array.from(matchArr.map((byte) => parseInt(byte, 16)));
  if (byteLength != null) {
    if (bytes.byteLength > byteLength) {
      throw new ArgError(
        `can‘t represent ${hexString} with ${byteLength} byte${byteLength > 1 ? "s" : ""}`
      );
    }
    // 前补零
    while (bytes.byteLength < byteLength) {
      bytes = concat(Uint8Array.from([0]), bytes);
    }
  }
  return bytes;
}

export function toBase64(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64");
}

export function concat(...bytes: Uint8Array[]): Uint8Array {
  const nums = bytes.reduce((prev, cur) => {
    return [...prev, ...cur];
  }, [] as number[]);
  return Uint8Array.from(nums);
}
