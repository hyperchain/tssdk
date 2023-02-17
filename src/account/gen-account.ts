import { sm2 } from "sm-crypto";
import { ec as EC } from "elliptic";
import { AlgoUtil, ByteUtil, HashUtil } from "../common";
import { ArgError } from "../common";
import Account, { AccountJSON } from "./account";
import ECAccount from "./ec-account";
import SMAccount from "./sm-account";
import Algo from "./algo";
import { PrivateKeyEncoder } from "./crypto";
import Version from "./version";
import { DidAccount } from "./index";
import { getKeyPairfromPrivateKey } from "./crypto/sm2/utils";

/**
 * 生成新的账号
 * @param algo 算法
 * @param password 密码
 * @returns 新的账号
 */
export function genAccount(algo: Algo, password?: string): Account {
  if (AlgoUtil.isSM(algo)) {
    // SMAccount
    const keypair = sm2.generateKeyPairHex();
    const publicKey = keypair.publicKey;
    const privateKey = PrivateKeyEncoder.encode(keypair.privateKey, algo, password);
    const address = ByteUtil.toHex(HashUtil.sha3omit12(ByteUtil.fromHex(keypair.publicKey)));
    return new SMAccount(address, publicKey, privateKey, Version.V4, algo) as Account;
  } else if (AlgoUtil.isEC(algo)) {
    if (AlgoUtil.isR1(algo)) {
      throw new ArgError("illegal account type, you can only generate raw account type");
    } else {
      // ECAccount
      const ec = new EC("secp256k1");
      const keyPair = ec.genKeyPair();

      const privateKey = PrivateKeyEncoder.encode(keyPair.getPrivate("hex"), algo, password);
      const publicKey = keyPair.getPublic("hex");
      const address = ByteUtil.toHex(HashUtil.sha3omit12(ByteUtil.fromHex(publicKey).slice(1)));
      return new ECAccount(address, publicKey, privateKey, Version.V4, algo);
    }
  }
  throw new ArgError("illegal account type, you can only generate raw account type");
}

export function fromPrivateKey(privateKey: string, algo: Algo, password?: string): Account {
  // 当前只支持裸私钥
  if (AlgoUtil.isRAW(algo)) {
    if (AlgoUtil.isSM(algo)) {
      // SMAccount
      const keypair = getKeyPairfromPrivateKey(privateKey);
      const publicKey = keypair.publicKey;
      const _privateKey = PrivateKeyEncoder.encode(keypair.privateKey, algo, password);
      const address = ByteUtil.toHex(HashUtil.sha3omit12(ByteUtil.fromHex(keypair.publicKey)));
      return new SMAccount(address, publicKey, _privateKey, Version.V4, algo) as Account;
    } else if (AlgoUtil.isEC(algo)) {
      if (AlgoUtil.isR1(algo)) {
        throw new ArgError("illegal account type, you can only choose raw algo now");
      }
      // ECAccount
      const ec = new EC("secp256k1");
      const keyPair = ec.keyFromPrivate(privateKey);

      const _privateKey = PrivateKeyEncoder.encode(keyPair.getPrivate("hex"), algo, password);
      const publicKey = keyPair.getPublic("hex");
      const address = ByteUtil.toHex(HashUtil.sha3omit12(ByteUtil.fromHex(publicKey).slice(1)));
      return new ECAccount(address, publicKey, _privateKey, Version.V4, algo);
    }
  }
  throw new ArgError("illegal algo, you can only choose raw algo now");
}

export function fromAccountJson(accountJson: string, password?: string): Account {
  let parsedAccount = JSON.parse(accountJson);
  if (parsedAccount.didAddress != null && typeof parsedAccount.didAddress === "string") {
    const didAddress = parsedAccount.didAddress;
    const accountJson = parsedAccount.account as AccountJSON;
    const account = fromAccountJson(JSON.stringify(accountJson), password);
    return new DidAccount(account, didAddress);
  }
  const privateKey = PrivateKeyEncoder.decode(
    parsedAccount.privateKey,
    parsedAccount.algo,
    password
  );
  parsedAccount = {
    ...parsedAccount,
    privateKey,
  };
  if (AlgoUtil.isSM(parsedAccount.algo)) {
    return new SMAccount(parsedAccount);
  } else if (AlgoUtil.isEC(parsedAccount.algo)) {
    return new ECAccount(parsedAccount);
  }
  throw new ArgError("algo of account json is not supported!");
}
