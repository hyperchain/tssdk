import {
  HttpProvider,
  ServiceManager,
  ProviderManager,
  Transaction,
  DecodeUtil,
  logger,
  JSONBigintUtil,
  Algo,
} from "@hyperchain/jssdk";

const hosts = ["localhost:8081", "localhost:8082", "localhost:8083", "localhost:8084"];

export function deployBtnOnClickInit() {
  const evmBinFileElement = document.getElementById("evm-bin");
  const evmAbiFileElement = document.getElementById("evm-abi");
  const evmButtonElement = document.getElementById("evm-button");
  if (evmBinFileElement != null && evmAbiFileElement != null && evmButtonElement != null) {
    evmButtonElement.onclick = function () {
      const binFile: File | null | undefined = (evmBinFileElement as HTMLInputElement).files?.item(
        0
      );
      const abiFile: File | null | undefined = (evmAbiFileElement as HTMLInputElement).files?.item(
        0
      );
      if (binFile != null) {
        binFile.arrayBuffer().then((binBuff) => {
          if (abiFile != null) {
            return abiFile.arrayBuffer().then((abiBuff) => {
              deploy(binBuff, abiBuff);
            });
          } else {
            deploy(binBuff);
          }
        });
      }
    };
  }
}

async function deploy(binFile: ArrayBuffer, abiFile?: ArrayBuffer) {
  const accountJson = JSON.stringify({
    publicKey:
      "0440a790611d711c65c7d26d04ab0e7b36b120fbbcc905cc9dac86fce0a4e828e9874fe7d22d63ccd95b3e99285bb528639069bdc358649ac3e02fd2f88cb615c4",
    privateKey: "b15a43adb0bccef47fbe8d716a0b5c616c54f879242b101281ba82ab07ab0ddb",
    address: "136e36a9996da1794c7582cdeba4f4852c218f78",
    algo: "0x13",
    version: "4.0",
  });

  // 1. 新建 provider manager
  const httpProvider1 = new HttpProvider(0, hosts[0]);
  const httpProvider2 = new HttpProvider(1, hosts[1]);
  const httpProvider3 = new HttpProvider(2, hosts[3]);
  const providerManager = await ProviderManager.createManager({
    httpProviders: [httpProvider1, httpProvider2, httpProvider3],
  });
  // 2. 新建 account
  const accountService = ServiceManager.getAccountService(providerManager);
  const account = accountService.fromAccountJson(accountJson);
  // 3. 创建交易体
  const transaction = new Transaction.EVMBuilder(account.getAddress(), providerManager)
    .deploy(binFile, abiFile!, [
      "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003df32340000000000000000000000000000000000000000000000000000000000",
    ])
    .build();
  // 4. 签名
  transaction.sign(account);
  // 5. 通过 contract service 部署
  const contractService = ServiceManager.getContractService(providerManager);
  const deployRequest = contractService.deploy(transaction);
  const response = await deployRequest.send();
  const deployResult = await response.poll();
  console.log(deployResult);
}

export async function testIntAndUint() {
  // const accountJson = JSON.stringify({
  //   publicKey:
  //     "0440a790611d711c65c7d26d04ab0e7b36b120fbbcc905cc9dac86fce0a4e828e9874fe7d22d63ccd95b3e99285bb528639069bdc358649ac3e02fd2f88cb615c4",
  //   privateKey: "b15a43adb0bccef47fbe8d716a0b5c616c54f879242b101281ba82ab07ab0ddb",
  //   address: "136e36a9996da1794c7582cdeba4f4852c218f78",
  //   algo: "0x13",
  //   version: "4.0",
  // });

  const ecAccountJson =
    '{"address":"b336fe89769bcefc57e6f7f5bf059ee59bad96d3","publicKey":"048c7b77cef59439bfaa649db22a7bcf81112117923b6f0a223fd2416db64b698d0098a6621d32a673c224f4933f75981641f6e7131d9c30b1e972a875e821958a","privateKey":"53e161c6ac1bb0394a751049caab56d4dcc9c9c96fa64dcaa143b70bc35d5cf5","version":"4.0","algo":"0x03"}';

  const abiStr =
    '[{"constant":true,"inputs":[{"name":"a","type":"int256"},\n' +
    '{"name":"b","type":"uint256"},{"name":"c","type":"uint256"},\n' +
    '{"name":"d","type":"int256[2]"}],"name":"testIntAndUint",\n' +
    '"outputs":[{"name":"","type":"int256"},{"name":"","type":"uint256"},\n' +
    '{"name":"","type":"uint256"},{"name":"","type":"int256[2]"}],\n' +
    '"payable":false,"stateMutability":"pure","type":"function"}]';
  const bin =
    "608060405234801561001057600080fd5b50610179806100206000396000f300" +
    "608060405260043610610041576000357c010000000000000000000000000000" +
    "0000000000000000000000000000900463ffffffff1680634ca9047014610046" +
    "575b600080fd5b34801561005257600080fd5b506100b4600480360381019080" +
    "8035906020019092919080359060200190929190803590602001909291908060" +
    "4001906002806020026040519081016040528092919082600260200280828437" +
    "82019150505050509192919290505050610107565b6040518085815260200184" +
    "815260200183815260200182600260200280838360005b838110156100f15780" +
    "820151818401526020810190506100d6565b5050505090500194505050505060" +
    "405180910390f35b600080600061011461012b565b8787878793509350935093" +
    "50945094509450949050565b6040805190810160405280600290602082028038" +
    "8339808201915050905050905600a165627a7a72305820884fda175c3d5a239e" +
    "0f80fcb4ec36bba043ec7cbe1bc40076ae2b990c0a49540029";

  const httpProviders = hosts.map(
    (host, index) =>
      new HttpProvider(index, host, {
        timeout: 1000,
      })
  );
  const providerManager = await ProviderManager.createManager({
    httpProviders,
  });

  const accountService = ServiceManager.getAccountService(providerManager);
  // const account = accountService.genAccount(Algo.SMRAW);
  // const account = accountService.genAccount(Algo.ECRAW);
  const account = accountService.fromAccountJson(ecAccountJson);
  const contractService = ServiceManager.getContractService(providerManager);
  // -------------------------------------- deploy --------------------------------------
  const deployTransaction = new Transaction.EVMBuilder(account.getAddress(), providerManager)
    .deploy(bin)
    .build();

  deployTransaction.sign(account);

  const deployRequest = contractService.deploy(deployTransaction);
  const deployResponse = await deployRequest.send();
  const deployResult = await deployResponse.poll();
  console.log("------------------- deploy -------------------");
  logger.info(JSONBigintUtil.stringify(deployResult));
  // -------------------------------------- invoke --------------------------------------
  const invokeMethod = "testIntAndUint(int256,uint256,uint256,int256[2])";
  const params = ["123", "123", "123", ["123", "123"]];
  const invokeTransaction = new Transaction.EVMBuilder(account.getAddress(), providerManager)
    .invoke(deployResult.result.contractAddress, invokeMethod, abiStr, params)
    .build();

  invokeTransaction.sign(account);

  const invokeRequest = contractService.invoke(invokeTransaction);
  const invokeResponse = await invokeRequest.send();
  const invokeResult = await invokeResponse.poll();
  console.log("------------------- invoke -------------------");
  logger.info(JSONBigintUtil.stringify(invokeResult));

  const decodedResult = DecodeUtil.decodeEvmResult(invokeResult, abiStr, invokeMethod);
  logger.info(JSONBigintUtil.stringify(decodedResult));
}
