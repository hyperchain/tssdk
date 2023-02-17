import {
  Algo,
  HttpProvider,
  logger,
  ProviderManager,
  ServiceManager,
  Transaction,
} from "../../src";

const hosts = ["localhost:8081", "localhost:8082", "localhost:8083", "localhost:8084"];

describe("Transaction", () => {
  test("fromJson", async () => {
    const httpProvider1 = new HttpProvider(1, hosts[0]);
    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });
    const accountService = ServiceManager.getAccountService(providerManager);
    // const contractService = ServiceManager.getContractService(providerManager);

    const ecAccountJson =
      '{"address":"b336fe89769bcefc57e6f7f5bf059ee59bad96d3","publicKey":"048c7b77cef59439bfaa649db22a7bcf81112117923b6f0a223fd2416db64b698d0098a6621d32a673c224f4933f75981641f6e7131d9c30b1e972a875e821958a","privateKey":"53e161c6ac1bb0394a751049caab56d4dcc9c9c96fa64dcaa143b70bc35d5cf5","version":"4.0","algo":"0x03"}';
    const account = accountService.fromAccountJson(ecAccountJson);

    const transactionJson = `{"to":"0xd77614848d82d8ec8874f046571a04ccba7cf0d9","timestamp":1675219768574000000,"nonce":1870973331884563,"type":"EVM","opCode":0,"payload":"0x4ca90470000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b","simulate":false,"gasPrice":0,"gasLimit":1000000000,"version":"4.2"}`;
    const transaction: Transaction = Transaction.fromJson(transactionJson);
    transaction.sign(account);
    expect(transaction.getSignature()).toBe(
      "00013f2cc0de5863e72c5e23302811b1b39a1bfcd5ee9ef6870a8461960b7faf94ac84c3ad64e0524c2d8845600db6c9507a548e46800beaded16d7c0f802285d900"
    );
  });

  test("toJson", async () => {
    const httpProvider1 = new HttpProvider(1, hosts[0]);
    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });
    const accountService = ServiceManager.getAccountService(providerManager);

    // const ecAccountJson =
    //   '{"address":"b336fe89769bcefc57e6f7f5bf059ee59bad96d3","publicKey":"048c7b77cef59439bfaa649db22a7bcf81112117923b6f0a223fd2416db64b698d0098a6621d32a673c224f4933f75981641f6e7131d9c30b1e972a875e821958a","privateKey":"53e161c6ac1bb0394a751049caab56d4dcc9c9c96fa64dcaa143b70bc35d5cf5","version":"4.0","algo":"0x03"}';
    // const account = accountService.fromAccountJson(ecAccountJson);
    const account = accountService.fromPrivateKey(
      "53e161c6ac1bb0394a751049caab56d4dcc9c9c96fa64dcaa143b70bc35d5cf5",
      Algo.ECRAW
    );

    const transactionJson = `{"to":"0xd77614848d82d8ec8874f046571a04ccba7cf0d9","timestamp":1674026731135000064,"nonce":1870973331884563,"type":"EVM","opCode":0,"payload":"0x4ca90470000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b","simulate":false,"gasPrice":0,"gasLimit":1000000000,"version":"4.2"}`;
    const transaction: Transaction = Transaction.fromJson(transactionJson);
    transaction.sign(account);

    expect(transaction.toJson()).toBe(
      `{"from":"0xb336fe89769bcefc57e6f7f5bf059ee59bad96d3","to":"0xd77614848d82d8ec8874f046571a04ccba7cf0d9","timestamp":1674026731135000064,"nonce":1870973331884563,"type":"EVM","opCode":0,"payload":"0x4ca90470000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b","simulate":false,"signature":"003a7c648903868310c619ae2d78c433067c33db5c2c3fe3a497a873a47c22c4eeaaee9e2b31d7a627cca99e34087eee356e8a1dddf6b4da9ff803e00523a4036600","gasPrice":0,"gasLimit":1000000000,"expirationTimestamp":1674027031135000064,"version":"4.2"}`
    );
  });
});
