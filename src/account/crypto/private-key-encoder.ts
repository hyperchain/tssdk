import { ArgError } from "../../common";
import Algo from "../algo";

/**
 * 私钥加密
 * @param privateKey 私钥编码（hex）
 * @param algo 算法
 * @param password 密码
 * @returns 私钥加密后的结果（hex）
 */
export function encode(privateKey: string, algo: Algo, password?: string): string {
  const encodedPrivateKey = privateKey;
  switch (algo) {
    case Algo.PKI:
    case Algo.ECRAW:
    case Algo.SMRAW:
    case Algo.ED25519RAW:
    case Algo.ECRAWR1:
      break;
    case Algo.ECDES:
    case Algo.SMDES:
    case Algo.ED25519DES:
    case Algo.ECDESR1:
      // encodedPrivateKey = CipherUtil.encryptDES(privateKey, password);
      throw new ArgError("illegal account type");
    case Algo.ECAES:
    case Algo.SMAES:
    case Algo.ED25519AES:
    case Algo.ECAESR1:
      // encodedPrivateKey = CipherUtil.encryptAES(privateKey, password);
      throw new ArgError("illegal account type");
    case Algo.EC3DES:
    case Algo.SM3DES:
    case Algo.ED255193DES:
    case Algo.EC3DESR1:
      // encodedPrivateKey = CipherUtil.encrypt3DES(privateKey, password);
      throw new ArgError("illegal account type");
    case Algo.SMSM4:
      // encodedPrivateKey = SM4Util.encryptCbcPadding(privateKey, password);
      throw new ArgError("illegal account type");
    default:
      throw new ArgError("illegal account type");
  }
  return encodedPrivateKey;
}

export function decode(privateKey: string, algo: Algo, password?: string): string {
  const decodedPrivateKey = privateKey;
  switch (algo) {
    case Algo.PKI:
    case Algo.ECRAW:
    case Algo.SMRAW:
    case Algo.ED25519RAW:
    case Algo.ECRAWR1:
      break;
    case Algo.ECDES:
    case Algo.SMDES:
    case Algo.ED25519DES:
    case Algo.ECDESR1:
      // decodedPrivateKey = CipherUtil.decryptDES(privateKey, password);
      throw new ArgError("illegal account type");
    case Algo.ECAES:
    case Algo.SMAES:
    case Algo.ED25519AES:
    case Algo.ECAESR1:
      // decodedPrivateKey = CipherUtil.decryptAES(privateKey, password);
      throw new ArgError("illegal account type");
    case Algo.EC3DES:
    case Algo.SM3DES:
    case Algo.ED255193DES:
    case Algo.EC3DESR1:
      // decodedPrivateKey = CipherUtil.decrypt3DES(privateKey, password);
      throw new ArgError("illegal account type");
    case Algo.SMSM4:
      // decodedPrivateKey = SM4Util.decryptCbcPadding(privateKey, password);
      throw new ArgError("illegal account type");
    default:
      throw new ArgError("illegal account type");
  }
  return decodedPrivateKey;
}
