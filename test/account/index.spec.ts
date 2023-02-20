import { ECAccount, ProviderManager, ByteUtil, ServiceManager } from "../../src";

describe("SMAccount", () => {
  test("create SMAccount from JSON", () => {
    const accountJson = JSON.stringify({
      publicKey:
        "045906bf3063dced2488e04cda8227321428b8ef22a07dbe026ed77cbd100594a2fcddd4fda5a98597dd61eb69fbd08ced97a4ef80159c900a5fb845478327aacf",
      privateKey: "2806197d247c5208c49528b46fdfa31c7e1457109f4e984f89e01bb6ed18dc4f",
      address: "6275b09dbb9d49252150e52647101665f8f60ca4",
      algo: "0x13",
      version: "4.0",
    });
    const accountService = ServiceManager.getAccountService(ProviderManager.emptyManager());
    const account = accountService.fromAccountJson(accountJson);
    const signedStr = account.sign("hello world");
    const result = account.verify("hello world", signedStr);
    expect(result).toBe(true);
  });
});

describe("ECAccount", () => {
  test("ECAccount sign", () => {
    // 源数据
    const sourceData = Uint8Array.from([127, 127, 0, 0, 255, 255]);
    // 构建账户
    const accountJson =
      '{"address":"b336fe89769bcefc57e6f7f5bf059ee59bad96d3","publicKey":"048c7b77cef59439bfaa649db22a7bcf81112117923b6f0a223fd2416db64b698d0098a6621d32a673c224f4933f75981641f6e7131d9c30b1e972a875e821958a","privateKey":"53e161c6ac1bb0394a751049caab56d4dcc9c9c96fa64dcaa143b70bc35d5cf5","version":"4.0","algo":"0x03"}';
    const ecAccount = new ECAccount(JSON.parse(accountJson));
    // ECDSA 加密结果都是相同
    const signature = ecAccount.sign(sourceData);
    expect(signature).toBe(
      "00a50537222c58d5bc7c91ac82af15883b3960a631332c3744706b146324bdbd5f2bd427cb7522f93272385eeccd65d559e3b1236fe6bcefdc4ce44b8cecbcf47a00"
    );
  });

  test("ECAccount verify", () => {
    // 源数据
    const sourceData = Uint8Array.from([127, 127, 0, 0, 255, 255]);
    // 构建账户
    const accountJson =
      '{"address":"b336fe89769bcefc57e6f7f5bf059ee59bad96d3","publicKey":"048c7b77cef59439bfaa649db22a7bcf81112117923b6f0a223fd2416db64b698d0098a6621d32a673c224f4933f75981641f6e7131d9c30b1e972a875e821958a","privateKey":"53e161c6ac1bb0394a751049caab56d4dcc9c9c96fa64dcaa143b70bc35d5cf5","version":"4.0","algo":"0x03"}';
    const ecAccount = new ECAccount(JSON.parse(accountJson));

    const signature =
      "00a50537222c58d5bc7c91ac82af15883b3960a631332c3744706b146324bdbd5f2bd427cb7522f93272385eeccd65d559e3b1236fe6bcefdc4ce44b8cecbcf47a00";
    expect(ecAccount.verify(sourceData, signature)).toBe(true);
  });

  test("ECAccount signature equals litesdk signature", () => {
    // 源数据
    const sourceData =
      "from=0x3846be7c0c0d08b6c13d7b5081a20a03d0b32d27&to=0x80730e4172dc6f3ff5d1fc26bdb33b2a78b4d9b8&value=0x0&payload=0x0&timestamp=0x1712ce57f3545000&nonce=0xdb18cf5bed5e1&opcode=2&extra=&vmtype=KVSQL&version=3.7&extraid=&cname=&price=0x0&gasLimit=0x3b9aca00&expirationTimestamp=0x1712ce9dccb90800&initiator=&withholding=";
    // lite sdk 签名结果
    const litesdkSignature =
      "00f263c77bd005905270fb39c13e247217a619523e435fe8a5271776f73435ff810bf451ce6c0b7ddce25a88561518904fcd947480f945c08dfc2048e86652a24301";
    // 构建账户
    const accountJson =
      '{"address":"3846be7c0c0d08b6c13d7b5081a20a03d0b32d27","publicKey":"042a1024690164f813fc7a7a0d79555ef1eef284b6f8d24b327f8227dc9b3eadda7c479764e2d9c3b3e514f44d69def8f6f3351e336838bd9d983b00fb94c9f52f","privateKey":"fb0e75836e1f546e5a0efb14b375308acb4f5d5320dc501c3545e39c7b62467f","version":"4.0","algo":"0x03"}';
    const ecAccount = new ECAccount(JSON.parse(accountJson));

    const signature = ecAccount.sign(sourceData);
    // ECDSA 加密结果都是相同
    expect(signature).toBe(litesdkSignature);
  });
});
