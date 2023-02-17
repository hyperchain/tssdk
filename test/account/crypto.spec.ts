import { sm2 } from "sm-crypto";
import { HashUtil } from "../../src/account/crypto";
import * as ByteUtil from "../../src/common/util/byte";
import { ec as EC } from "elliptic";
import { generateKeyPairHex, getKeyPairfromPrivateKey } from "../../src/account/crypto/sm2/utils";

const ec = new EC("secp256k1");

describe("SM2", () => {
  // lite sdk 生成的 public private key
  // const address = "6275b09dbb9d49252150e52647101665f8f60ca4";
  const liteSdkKeypair = {
    publicKey:
      "045906bf3063dced2488e04cda8227321428b8ef22a07dbe026ed77cbd100594a2fcddd4fda5a98597dd61eb69fbd08ced97a4ef80159c900a5fb845478327aacf",
    privateKey: "2806197d247c5208c49528b46fdfa31c7e1457109f4e984f89e01bb6ed18dc4f",
  };

  test("the result of each signature is different", () => {
    const message = "hello world~~~";

    const signature1 = sm2.doSignature(message, liteSdkKeypair.privateKey);
    const signature2 = sm2.doSignature(message, liteSdkKeypair.privateKey);
    const signature3 = sm2.doSignature(message, liteSdkKeypair.privateKey);
    expect(
      signature1 === signature2 || signature1 === signature3 || signature2 === signature3
    ).toBe(false);

    const verifyResult1 = sm2.doVerifySignature(message, signature1, liteSdkKeypair.publicKey);
    const verifyResult2 = sm2.doVerifySignature(message, signature2, liteSdkKeypair.publicKey);
    const verifyResult3 = sm2.doVerifySignature(message, signature3, liteSdkKeypair.publicKey);
    expect(verifyResult1).toBe(true);
    expect(verifyResult2).toBe(true);
    expect(verifyResult3).toBe(true);
  });

  test("signature of litesdk can be verified by sm2 js", () => {
    const litesdkSignature =
      "3044022008557202f35afa16cb081e06f2796a8e6d4bdd952e523a29baf2a1b2917486b7022006e1a6c443b7958caf40473c08f0057d1b44b5f3e9532fea376aca36766043fd";

    const verifyResult = sm2.doVerifySignature(
      "hello world",
      litesdkSignature,
      liteSdkKeypair.publicKey,
      {
        hash: true,
        der: true,
      }
    );

    expect(verifyResult).toBe(true);
  });
});

describe("EC", () => {
  test("elliptic", () => {
    const accountJson =
      '{"address":"b336fe89769bcefc57e6f7f5bf059ee59bad96d3","publicKey":"048c7b77cef59439bfaa649db22a7bcf81112117923b6f0a223fd2416db64b698d0098a6621d32a673c224f4933f75981641f6e7131d9c30b1e972a875e821958a","privateKey":"53e161c6ac1bb0394a751049caab56d4dcc9c9c96fa64dcaa143b70bc35d5cf5","version":"4.0","algo":"0x03"}';
    const account = JSON.parse(accountJson);

    const sourceData = Uint8Array.from([127, 127, 0, 0, 255, 255]);
    const hash = HashUtil.sha3(sourceData);
    expect(ByteUtil.toHex(hash)).toBe(
      "b5e2be7b9f2126ea351ae451dd3ff27b00fbd084198862298b1b58a908818ed3"
    );
    const keypair = ec.keyFromPrivate(account.privateKey, "hex");
    const signature = ec.sign(hash, keypair);
    const r = ByteUtil.fromHex(signature.r.toString("hex"), 32);
    const s = ByteUtil.fromHex(signature.s.toString("hex"), 32);
    const fixedV = Uint8Array.from([signature.recoveryParam || 0]);
    // ECDSA 加密结果都是相同
    expect(ByteUtil.toHex(ByteUtil.concat(r, s, fixedV))).toBe(
      "a50537222c58d5bc7c91ac82af15883b3960a631332c3744706b146324bdbd5f2bd427cb7522f93272385eeccd65d559e3b1236fe6bcefdc4ce44b8cecbcf47a00"
    );
  });
});

describe("HashUtil", () => {
  test("sha3", () => {
    const publicKey =
      "044317993c0ae1bc2a72169fa321dcc17b51d68237ba1e5c86009d01830ae539f3b23611f52ccdbd16e430dd009090bf7556dc42f68b37d6cd96c98344df4562a8";
    const publicKeyHash: Uint8Array = HashUtil.sha3(ByteUtil.fromHex(publicKey));
    const publicKeyHashHex = ByteUtil.toHex(publicKeyHash);
    expect(publicKeyHashHex).toBe(
      "37ff719e2a79c6b78e7ae531d11c925fdf750ae764cbea5aceb318f0bb3def07"
    );
  });

  test("sha3omit12", () => {
    const publicKey =
      "044317993c0ae1bc2a72169fa321dcc17b51d68237ba1e5c86009d01830ae539f3b23611f52ccdbd16e430dd009090bf7556dc42f68b37d6cd96c98344df4562a8";
    const publicKeyHash: Uint8Array = HashUtil.sha3omit12(ByteUtil.fromHex(publicKey));
    const address = ByteUtil.toHex(publicKeyHash); // publicKeyHashHex = address
    expect(address).toBe("d11c925fdf750ae764cbea5aceb318f0bb3def07");
  });
});

describe("KeyPairGenerate", () => {
  test("keyPairGen", () => {
    const keyPair1 = generateKeyPairHex();
    const keyPair2 = getKeyPairfromPrivateKey(keyPair1.privateKey);
    expect(keyPair1.publicKey).toBe(keyPair2.publicKey);
    expect(keyPair1.privateKey).toBe(keyPair2.privateKey);
  });
});
