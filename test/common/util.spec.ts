import fs from "fs";
import path from "path";
import { TextEncoder } from "util";
import {
  ByteUtil,
  DecodeUtil,
  EncodeUtil,
  JSONBigintUtil,
  NumUtil,
  logger,
  CertUtil,
} from "../../src/common";
import { TxVersion } from "../../src/transaction";

global.TextEncoder = TextEncoder;

describe("NumUtil", () => {
  test("NumUtil.toByte(positive number)", () => {
    const num = 32767; // short，2 字节，16 位，最大值 0111 1111 1111 1111
    const bytes: Uint8Array = NumUtil.toByte(num, 2);
    expect(ByteUtil.toHex(bytes)).toBe("7fff");
  });
  test("NumUtil.toByte(negative number)", () => {
    const num = -32768; // short，2 字节，16 位，最小值 1000 0000 0000 0000
    const bytes: Uint8Array = NumUtil.toByte(num, 2);
    expect(ByteUtil.toHex(bytes)).toBe("8000");
  });
});

describe("JSONBigintUtil", () => {
  test("parse bigint", () => {
    const json = '{ "value" : 9223372036854775807, "v2": 123 }';
    const obj = JSONBigintUtil.parse(json) as any;
    expect(obj.value).toBe(9223372036854775807n);
  });
  test("parse number", () => {
    const json = '{ "value" : 110, "v2": -1 }';
    const obj = JSONBigintUtil.parse(json) as any;
    expect(obj.value).toBe(110);
    expect(obj.v2).toBe(-1);
  });
  test("stringify", () => {
    const json = `{"from":"6275b09dbb9d49252150e52647101665f8f60ca4","nonce":6009341217650722816,"extra":"{{==BIGINT==123412341234==BIGINT==}}","timestamp":1661157399353999872,"type":"HVM","expirationTimestamp":1661157699353999872,"gasLimit":1000000000,"array":[1661157399353999872,2661157399353999872,"2661157399353999872"],"obj":{"nonce":6009341217650722816,"timestamp":1661157399353999872,"expirationTimestamp":1661157699353999872,"array":[1661157399353999872,2661157399353999872,"2661157399353999872"]}}`;
    const obj = {
      from: "6275b09dbb9d49252150e52647101665f8f60ca4",
      nonce: 6009341217650722816n,
      extra: "{{==BIGINT==123412341234==BIGINT==}}",
      timestamp: 1661157399353999872n,
      type: "HVM",
      expirationTimestamp: 1661157699353999872n,
      gasLimit: 1000000000,
      array: [1661157399353999872n, 2661157399353999872n, "2661157399353999872"],
      obj: {
        nonce: 6009341217650722816n,
        timestamp: 1661157399353999872n,
        expirationTimestamp: 1661157699353999872n,
        array: [1661157399353999872n, 2661157399353999872n, "2661157399353999872"],
      },
    };
    const stringifiedRes = JSONBigintUtil.stringify(obj);
    expect(stringifiedRes).toBe(json);
  });
});

describe("EncodeUtil", () => {
  test("encodeDeployJar", async () => {
    const liteSdkResult =
      "fefffbcd00106c6f6769632e43726564656e7469616c000000d80011cafebabe00000034000b07000807000907000a010014636865636b43726564656e7469616c56616c6964010015284c6a6176612f6c616e672f537472696e673b295a01000a536f7572636546696c650100104943726564656e7469616c2e6a6176610100116c6f6769632f4943726564656e7469616c0100106a6176612f6c616e672f4f626a65637401002c636e2f6879706572636861696e2f636f6e74726163742f42617365436f6e7472616374496e7465726661636506010001000200010003000000010401000400050000000100060000000200076c6f6769632f4943726564656e7469616c0000020d0010cafebabe00000034001b0a000400130a001400150700160700170700180100063c696e69743e010003282956010004436f646501000f4c696e654e756d6265725461626c650100124c6f63616c5661726961626c655461626c65010004746869730100124c6c6f6769632f43726564656e7469616c3b010014636865636b43726564656e7469616c56616c6964010015284c6a6176612f6c616e672f537472696e673b295a01000269640100124c6a6176612f6c616e672f537472696e673b01000a536f7572636546696c6501000f43726564656e7469616c2e6a6176610c000600070700190c001a000e0100106c6f6769632f43726564656e7469616c010023636e2f6879706572636861696e2f636f6e74726163742f42617365436f6e74726163740100116c6f6769632f4943726564656e7469616c010022636e2f6879706572636861696e2f636f6d6d6f6e2f7574696c732f4449445574696c01001163726564656e7469616c497356616c69640021000300040001000500000002000100060007000100080000002f00010001000000052ab70001b100000002000900000006000100000007000a0000000c000100000005000b000c00000001000d000e000100080000003900010002000000052bb80002ac0000000200090000000600010000000b000a00000016000200000005000b000c000000000005000f00100001000100110000000200126c6f6769632f43726564656e7469616c";
    const file: Buffer = fs.readFileSync(
      path.resolve(__dirname, "../resource/hvm-jar/credential-1.0-credential.jar")
    );
    const result = await EncodeUtil.encodeDeployJar(file, TxVersion.TxVersion30);
    expect(result).toBe(liteSdkResult);
  });
});

describe("PemUtil", () => {
  test("pemDecode", async () => {
    const certStr =
      "-----BEGIN CERTIFICATE-----\n" +
      "MIICODCCAeSgAwIBAgIBATAKBggqhkjOPQQDAjB0MQkwBwYDVQQIEwAxCTAHBgNV\n" +
      "BAcTADEJMAcGA1UECRMAMQkwBwYDVQQREwAxDjAMBgNVBAoTBWZsYXRvMQkwBwYD\n" +
      "VQQLEwAxDjAMBgNVBAMTBW5vZGUxMQswCQYDVQQGEwJaSDEOMAwGA1UEKhMFZWNl\n" +
      "cnQwIBcNMjAwNTIxMDQyNTQ0WhgPMjEyMDA0MjcwNTI1NDRaMHQxCTAHBgNVBAgT\n" +
      "ADEJMAcGA1UEBxMAMQkwBwYDVQQJEwAxCTAHBgNVBBETADEOMAwGA1UEChMFZmxh\n" +
      "dG8xCTAHBgNVBAsTADEOMAwGA1UEAxMFbm9kZTExCzAJBgNVBAYTAlpIMQ4wDAYD\n" +
      "VQQqEwVlY2VydDBWMBAGByqGSM49AgEGBSuBBAAKA0IABDoBjgQsvY4xhyIy3aWh\n" +
      "4HLOTTY6te1VbmZaH5EZnKzqjU1f436bVsfi9HLE3/MCeZD6ISe1U5giM5NuwF6T\n" +
      "ZEOjaDBmMA4GA1UdDwEB/wQEAwIChDAmBgNVHSUEHzAdBggrBgEFBQcDAgYIKwYB\n" +
      "BQUHAwEGAioDBgOBCwEwDwYDVR0TAQH/BAUwAwEB/zANBgNVHQ4EBgQEAQIDBDAM\n" +
      "BgMqVgEEBWVjZXJ0MAoGCCqGSM49BAMCA0IAuVuDqguvjPPveimWruESBYqMJ1qq\n" +
      "ryhXiMhlYwzH1FgUz0TcayuY+4KebRhFhb14ZDXBBPXcn9CYdtbbSxXTogE=\n" +
      "-----END CERTIFICATE-----";
    const certBuffer: Buffer = Buffer.from(certStr, "utf-8");
    const pemStr =
      "-----BEGIN EC PRIVATE KEY-----\n" +
      "MHQCAQEEIFO8E/zYebPTI++gmHNYZEUetgn3DychVadgTUMIJX3VoAcGBSuBBAAK\n" +
      "oUQDQgAEOgGOBCy9jjGHIjLdpaHgcs5NNjq17VVuZlofkRmcrOqNTV/jfptWx+L0\n" +
      "csTf8wJ5kPohJ7VTmCIzk27AXpNkQw==\n" +
      "-----END EC PRIVATE KEY-----";
    const file: Buffer = Buffer.from(pemStr, "utf-8");
    const res = CertUtil.newCertKeyPair(certBuffer, file);
  });
  test("pemDecode2", async () => {
    const pemStr =
      "-----BEGIN CERTIFICATE-----\n" +
      "MIICODCCAeSgAwIBAgIBATAKBggqhkjOPQQDAjB0MQkwBwYDVQQIEwAxCTAHBgNV\n" +
      "BAcTADEJMAcGA1UECRMAMQkwBwYDVQQREwAxDjAMBgNVBAoTBWZsYXRvMQkwBwYD\n" +
      "VQQLEwAxDjAMBgNVBAMTBW5vZGUxMQswCQYDVQQGEwJaSDEOMAwGA1UEKhMFZWNl\n" +
      "cnQwIBcNMjAwNTIxMDQyNTQ0WhgPMjEyMDA0MjcwNTI1NDRaMHQxCTAHBgNVBAgT\n" +
      "ADEJMAcGA1UEBxMAMQkwBwYDVQQJEwAxCTAHBgNVBBETADEOMAwGA1UEChMFZmxh\n" +
      "dG8xCTAHBgNVBAsTADEOMAwGA1UEAxMFbm9kZTExCzAJBgNVBAYTAlpIMQ4wDAYD\n" +
      "VQQqEwVlY2VydDBWMBAGByqGSM49AgEGBSuBBAAKA0IABDoBjgQsvY4xhyIy3aWh\n" +
      "4HLOTTY6te1VbmZaH5EZnKzqjU1f436bVsfi9HLE3/MCeZD6ISe1U5giM5NuwF6T\n" +
      "ZEOjaDBmMA4GA1UdDwEB/wQEAwIChDAmBgNVHSUEHzAdBggrBgEFBQcDAgYIKwYB\n" +
      "BQUHAwEGAioDBgOBCwEwDwYDVR0TAQH/BAUwAwEB/zANBgNVHQ4EBgQEAQIDBDAM\n" +
      "BgMqVgEEBWVjZXJ0MAoGCCqGSM49BAMCA0IAuVuDqguvjPPveimWruESBYqMJ1qq\n" +
      "ryhXiMhlYwzH1FgUz0TcayuY+4KebRhFhb14ZDXBBPXcn9CYdtbbSxXTogE=\n" +
      "-----END CERTIFICATE-----";
    const file: Buffer = Buffer.from(pemStr, "utf-8");
    const publicKey = ByteUtil.toHex(file);
  });
});

describe("logger", () => {
  test("printf", () => {
    logger.info({ a: 1, b: 2, c: BigInt(3) });
    logger.info(JSONBigintUtil.stringify({ a: 1, b: 2, c: BigInt(3) }));
    logger.info({ a: 1, b: 2, c: BigInt(3), level: "perfect" });
  });
});

describe("DecodeUtil", () => {
  test("decodeBvmResultRetRet", () => {
    const decodedResult = DecodeUtil.decodeBvmResultRetRet(
      "W3siY29kZSI6MjAwfSx7ImNvZGUiOjIwMH0seyJjb2RlIjoyMDB9LHsiY29kZSI6MjAwfV0"
    );
    expect(JSON.stringify(decodedResult)).toBe(
      `[{"code":200},{"code":200},{"code":200},{"code":200}]`
    );
  });

  test("decodeBvmResultRet and decodeBvmResultRetRet", async () => {
    const ret =
      "0x7b2253756363657373223a747275652c22526574223a22573373695932396b5a5349364d6a417766537837496d4e765a4755694f6a49774d48307365794a6a6232526c496a6f794d4442394c4873695932396b5a5349364d6a41776656303d222c22457272223a22227d";
    const decodedRet = DecodeUtil.decodeBvmResultRet(ret);
    const operationResults = DecodeUtil.decodeBvmResultRetRet(decodedRet.Ret);
    expect(operationResults.length).toBe(4);
    expect(JSON.stringify(operationResults)).toBe(
      '[{"code":200},{"code":200},{"code":200},{"code":200}]'
    );
  });

  test("decodeEvmResult", () => {
    const response = {
      jsonrpc: "2.0",
      namespace: "global",
      id: 1,
      code: 0,
      message: "SUCCESS",
      result: {
        version: "4.2",
        txHash: "0x174043a23f9f6c001ac2924a476ea1f31f65a4031f0a6fec52c9ba79f94e6e00",
        vmType: "EVM",
        contractAddress: "0x23eab43db199b8fb69a596c622afcc35c3a4f800",
        gasUsed: 84977,
        ret: "0x000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b",
        log: [],
        valid: true,
        errorMsg: "",
      },
    } as any;

    const abiStr =
      '[{"constant":true,"inputs":[{"name":"a","type":"int256"},\n' +
      '{"name":"b","type":"uint256"},{"name":"c","type":"uint256"},\n' +
      '{"name":"d","type":"int256[2]"}],"name":"testIntAndUint",\n' +
      '"outputs":[{"name":"","type":"int256"},{"name":"","type":"uint256"},\n' +
      '{"name":"","type":"uint256"},{"name":"","type":"int256[2]"}],\n' +
      '"payable":false,"stateMutability":"pure","type":"function"}]';

    const invokeMethod = "testIntAndUint(int256,uint256,uint256,int256[2])";

    {
      const decodedResult = DecodeUtil.decodeEvmResult(response, abiStr, invokeMethod);
      expect(JSON.stringify(decodedResult)).toBe(`["123","123","123",["123","123"]]`);
    }

    {
      response.result.ret = "0x0";
      const decodedResult = DecodeUtil.decodeEvmResult(response, abiStr, invokeMethod);
      expect(JSON.stringify(decodedResult)).toBe(`[]`);
    }
  });
});
