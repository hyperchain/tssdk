import { ArgError } from "../error";

/**
 * 转化为十六进制
 * @param n 数字
 * @param options 可选项
 * @returns 十六进制字符串
 */
export function toHex(
  n: bigint | number,
  options?: {
    startsWith0x?: boolean;
  }
): string {
  const { startsWith0x = false } = options || {};
  let result;
  if (n == null) {
    result = "0";
  } else {
    result = n.toString(16);
  }

  if (startsWith0x) {
    result = `0x${result}`;
  }
  return result;
}

/**
 * 计算 binary 的补码
 * @param binary 二进制数
 * @returns 补码
 */
function toTwoComplement(binary: string) {
  if (!/^(0|1)+$/.test(binary)) {
    throw new ArgError(`"${binary}" is not a binary!`);
  }
  const bitLength = binary.length;
  binary = binary.replace(/1|0/g, (x) => (x === "0" ? "1" : "0")); // 反码 1's complement
  let complement = "";
  let carry = 1;
  for (let i = bitLength - 1; i >= 0; i -= 1) {
    let res = parseInt(binary[i]) + carry;
    if (res == 2) {
      carry = 1;
      res = 0;
    } else {
      carry = 0;
    }
    complement = res + complement;
  }
  return complement;
}

/**
 * 转化为二进制
 * @param n
 * @param bitLength
 * @returns
 */
function toBinary(n: number, bitLength: number): string {
  if (!isInteger(n)) {
    throw new ArgError("unsupport float number");
  }
  // 1. 绝对值的原码表示
  let binary = Math.abs(n).toString(2);
  if (binary.length > bitLength) {
    throw new ArgError(`can‘t represent ${n} with ${bitLength} bit${bitLength > 1 ? "s" : ""}`);
  }
  binary = binary.padStart(bitLength, "0");
  // 如果是负数，需要计算其补码，需要按位取反，最后 + 1
  if (n < 0) {
    binary = toTwoComplement(binary);
  }
  return binary;
}

/**
 * 转换为字节数组
 * @param x 数字
 * @param byteLength 字节数组长度（不够前补零，超出报错）
 * @returns 字节数组
 */
export function toByte(x: number, byteLength: number): Uint8Array {
  const binary = toBinary(x, byteLength * 8);
  const regExp = /(0|1){8}/g;
  const bytes = binary.match(regExp)?.map((bits) => {
    let byte = 0;
    for (let i = bits.length - 1; i >= 0; i -= 1) {
      byte += parseInt(bits[i]) * Math.pow(2, bits.length - 1 - i);
    }
    return byte;
  });
  if (bytes == null) {
    throw new ArgError(`error when convert ${x} to bytes!`);
  }
  return new Uint8Array(bytes);
}

export function isInteger(x: number) {
  return Number.isInteger(x);
}

export function isFloat(x: number) {
  return typeof x === "number";
}

export function fromHex(hexStr: string): bigint {
  if (!hexStr.startsWith("0x")) {
    return BigInt(`0x${hexStr}`);
  }
  return BigInt(hexStr);
}
