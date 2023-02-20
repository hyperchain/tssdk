// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { genesisAccountJsons, init } from "../common";
import {
  Algo,
  HttpProvider,
  logger,
  ProviderManager,
  ServiceManager,
  Transaction,
} from "../../src";

// describe("AccountService.getBalance", () => {
//   test("normal test", async () => {
//     const { accountService } = await init();
//     const accountAddress = "000f1a7a08ccc48e5d30f80850cf1cf283aa3abd";
//     const request = accountService.getBalance(accountAddress);
//     const response = await request.send();
//     console.log(response.result);
//   });
// });

describe("didAccount generate", () => {
  test("result of accountService.genDidAccount equals result of accountService.fromAccountJson", async () => {
    const { accountService } = await init();
    const didAccount = accountService.genDidAccount(Algo.ECRAW, "hyperchain");
    const didAccount1 = accountService.fromAccountJson(didAccount.toJSONStr());
    expect(didAccount.toJSONStr()).toBe(didAccount1.toJSONStr());
  });
});

describe("AccountService.getRoles", () => {
  test("normal test", async () => {
    const { accountService } = await init();
    const account = accountService.fromAccountJson(genesisAccountJsons[0]);
    const request = accountService.getRoles(account.getAddress());
    const response = await request.send();
    logger.info(response.result);
  });
});

describe("AccountService.getAccountsByRole", () => {
  test("normal test", async () => {
    const { accountService } = await init();
    const role = "admin";
    const request = accountService.getAccountsByRole(role);
    const response = await request.send();
    console.log(response.result);
  });
});

describe("AccountService.getStatus", () => {
  test("normal test", async () => {
    const { accountService } = await init();
    const account = accountService.fromAccountJson(genesisAccountJsons[0]);
    const request = accountService.getStatus(account.getAddress());
    const response = await request.send();
    console.log(response.result);
  });
});

describe("AccountService.genDidAccountFromAccountJson", () => {
  test("normal test", async () => {
    const { accountService } = await init();
    const accountJson =
      '{"address":"fcfd166d7c78437913eb2807a0f20e53613dc06b","publicKey":"04cba3c337248366e4f8ab27d6f2987556c9f59e53f55765434fa3e2aea8601df77ed1636acc6f3d4d4502f4867d2cfdb765a43ab4a1a93072d911100735b93181","privateKey":"1c831170483c246e37860d63e738d69696a00dfa3ac67b8f189bb4c23a89905a","version":"4.0","algo":"0x03"}';
    const didAccountJson =
      '{"account":{"address":"fcfd166d7c78437913eb2807a0f20e53613dc06b","publicKey":"04cba3c337248366e4f8ab27d6f2987556c9f59e53f55765434fa3e2aea8601df77ed1636acc6f3d4d4502f4867d2cfdb765a43ab4a1a93072d911100735b93181","privateKey":"1c831170483c246e37860d63e738d69696a00dfa3ac67b8f189bb4c23a89905a","version":"4.0","algo":"0x03"},"didAddress":"did:hpc:hhppcc:hello"}';
    const didAccount = accountService.genDidAccountFromAccountJson(accountJson, "hello");
    expect(didAccount.toJSONStr()).toBe(didAccountJson);
  });
});

describe("AccountService.fromPrivateKey", () => {
  test("ECRAW", async () => {
    // const httpProvider1 = new HttpProvider(1, "localhost:8081");
    // const providerManager = await ProviderManager.createManager({
    //   httpProviders: [httpProvider1],
    // });
    const providerManager = ProviderManager.emptyManager();
    const accountService = ServiceManager.getAccountService(providerManager);

    const transactionJson = `{"to":"0xd77614848d82d8ec8874f046571a04ccba7cf0d9","timestamp":1674026731135000064,"nonce":1674026731135000064,"type":"EVM","opCode":0,"payload":"0x4ca90470000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b","simulate":false,"gasPrice":0,"gasLimit":1000000000,"version":"4.2"}`;

    // 通过私钥，生成 account
    const account1 = accountService.fromPrivateKey(
      "53e161c6ac1bb0394a751049caab56d4dcc9c9c96fa64dcaa143b70bc35d5cf5",
      Algo.ECRAW
    );
    // 通过 JSON，生成 transaction
    const transcation1 = Transaction.fromJson(transactionJson);
    // 交易签名
    transcation1.sign(account1);
    // 将签名后的 transaction 重新生成 JSON 字符串
    const transactionStr = transcation1.toJson(); // 或者 Transaction.toJson(transcation1);
    logger.info(transactionStr);

    // 通过 JSON，生成 account
    const ecAccountJson =
      '{"address":"b336fe89769bcefc57e6f7f5bf059ee59bad96d3","publicKey":"048c7b77cef59439bfaa649db22a7bcf81112117923b6f0a223fd2416db64b698d0098a6621d32a673c224f4933f75981641f6e7131d9c30b1e972a875e821958a","privateKey":"53e161c6ac1bb0394a751049caab56d4dcc9c9c96fa64dcaa143b70bc35d5cf5","version":"4.0","algo":"0x03"}';
    const account2 = accountService.fromAccountJson(ecAccountJson);
    // 通过 JSON，生成 transaction
    const transaction2 = Transaction.fromJson(transactionJson);
    // 交易签名
    transaction2.sign(account2);

    // 二者签名结果相同
    expect(transcation1.getSignature()).toBe(transaction2.getSignature());
  });

  test("SMRAW", async () => {
    const { accountService } = await init();
    const transactionJson = `{"to":"0xd77614848d82d8ec8874f046571a04ccba7cf0d9","timestamp":1674026731135000064,"nonce":1674026731135000064,"type":"EVM","opCode":0,"payload":"0x4ca90470000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b","simulate":false,"gasPrice":0,"gasLimit":1000000000,"version":"4.2"}`;

    // 通过私钥，生成 account
    const account1 = accountService.fromPrivateKey(
      "55b40d6b42beffc6431a43478aed96b7cc1bb2c161c5b29d9b22494efbfe7fa8",
      Algo.SMRAW
    );
    // 通过 JSON，生成 transaction
    const transcation1 = Transaction.fromJson(transactionJson);
    // 交易签名
    transcation1.sign(account1);

    // 通过 JSON，生成 account
    const smAccountJson =
      '{"address":"2b01af8a84651455ede2208d94fbe64c4c7d4493","publicKey":"041ce095267e79624d9c5d8cffbdff1df662a2d467b404d63b3d0f93b0941441eab29a7a97509ca812279986e2e57230a669649e6864cf7b83d2c5739e44edeb3e","privateKey":"55b40d6b42beffc6431a43478aed96b7cc1bb2c161c5b29d9b22494efbfe7fa8","version":"4.0","algo":"0x13"}';
    const account2 = accountService.fromAccountJson(smAccountJson);
    // 通过 JSON，生成 transaction
    const transaction2 = Transaction.fromJson(transactionJson);
    // 交易签名
    transaction2.sign(account2);
  });
});
