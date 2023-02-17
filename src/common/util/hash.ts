import createKeccakHash from "keccak";

export function sha3(data: Uint8Array): Uint8Array {
  return createKeccakHash("keccak256").update(Buffer.from(data)).digest();
}

export function sha3omit12(data: Uint8Array): Uint8Array {
  const hash: Uint8Array = sha3(data);
  return hash.slice(12);
}
