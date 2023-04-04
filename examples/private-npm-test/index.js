const fs = require("fs");
const path = require("path");

const {
  Transaction,
  HttpProvider,
  ProviderManager,
  ServiceManager,
  logger,
  InvokeParams,
  HvmType,
  StringUtil,
} = require("@hyperchain/jssdk");

(async function () {
  const jarBuffer = fs.readFileSync(
    path.resolve(
      __dirname,
      "../../test/resource/hvm-jar/Basic-crossContractB/Basic-0.0.1-SNAPSHOT-crossContractB.jar"
    )
  );
  const abiBuffer = fs.readFileSync(
    path.resolve(__dirname, "../../test/resource/hvm-jar/Basic-crossContractB/hvm.abi")
  );

  const accountJson = JSON.stringify({
    publicKey:
      "045906bf3063dced2488e04cda8227321428b8ef22a07dbe026ed77cbd100594a2fcddd4fda5a98597dd61eb69fbd08ced97a4ef80159c900a5fb845478327aacf",
    privateKey: "2806197d247c5208c49528b46fdfa31c7e1457109f4e984f89e01bb6ed18dc4f",
    address: "6275b09dbb9d49252150e52647101665f8f60ca4",
    algo: "0x13",
    version: "4.0",
  });

  // 1. 新建 provider manager
  const httpProvider1 = new HttpProvider(1, "localhost:8081");
  const providerManager = await ProviderManager.createManager({
    httpProviders: [httpProvider1],
  });
  const accountService = ServiceManager.getAccountService(providerManager);
  const contractService = ServiceManager.getContractService(providerManager);
  // 2. 新建 account
  const account = accountService.fromAccountJson(accountJson);

  let contractAddress;
  {
    // 3. 创建交易体
    const transaction = await new Transaction.HVMBuilder(account.getAddress(), providerManager)
      .deploy(jarBuffer)
      .then((builder) => builder.build());
    // 4. 签名
    transaction.sign(account);
    // 5. 通过 contract service 部署
    const contractService = ServiceManager.getContractService(providerManager);
    const deployRequest = contractService.deploy(transaction);
    const response = await deployRequest.send();
    const deployResult = await response.poll();
    contractAddress = deployResult.result.contractAddress;
  }

  {
    // 3. 创建交易体
    const params = new InvokeParams.HvmAbiBuilder(
      abiBuffer,
      HvmType.BeanType.MethodBean,
      "setMyMap"
    );
    params.addParam("keyy");
    params.addParam("valuee");

    const transaction = new Transaction.HVMBuilder(account.getAddress(), providerManager)
      .invoke(contractAddress, params.build())
      .build();

    // 4. 签名
    transaction.sign(account);
    // 5. 通过 contract service 部署
    const invokeRequest = contractService.invoke(transaction);
    const response = await invokeRequest.send();
    const invokeResult = await response.poll();
    logger.info(StringUtil.fromHex(invokeResult.result.ret));
  }
})();
