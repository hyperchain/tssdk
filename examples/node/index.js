const fs = require("fs");
const path = require("path");

const {
  Transaction,
  HttpProvider,
  ProviderManager,
  ServiceManager,
  logger,
} = require("@hyperchain/jssdk");

logger.level = "debug";

const hosts = ["localhost:8081", "localhost:8082", "localhost:8083", "localhost:8084"];

logger.info("hello world");

const hvmContractFile = fs.readFileSync(
  path.resolve(__dirname, "../../test/resource/hvm-jar/credential-1.0-credential.jar")
);
hvmDeploy(hvmContractFile);

async function hvmDeploy(file) {
  const accountJson = JSON.stringify({
    publicKey:
      "045906bf3063dced2488e04cda8227321428b8ef22a07dbe026ed77cbd100594a2fcddd4fda5a98597dd61eb69fbd08ced97a4ef80159c900a5fb845478327aacf",
    privateKey: "2806197d247c5208c49528b46fdfa31c7e1457109f4e984f89e01bb6ed18dc4f",
    address: "6275b09dbb9d49252150e52647101665f8f60ca4",
    algo: "0x13",
    version: "4.0",
  });

  // const httpProvider1 = new HttpProvider(1, hosts[0], {
  //   timeout: 1000,
  //   security: true,
  //   nodeHttps: {
  //     ca: fs.readFileSync(path.resolve(__dirname, "../../test/resource/cert/tls/tlsca.ca")),
  //     cert: fs.readFileSync(path.resolve(__dirname, "../../test/resource/cert/tls/tls_peer.cert")),
  //     key: fs.readFileSync(path.resolve(__dirname, "../../test/resource/cert/tls/tls_peer.priv")),
  //   },
  // });

  // 1. 新建 provider manager
  const providerManager = await ProviderManager.createManager({
    httpProviders: hosts.map(
      (host, index) =>
        new HttpProvider(index, host, {
          timeout: 1000,
        })
    ),
  });
  // 2. 新建 account
  const accountService = ServiceManager.getAccountService(providerManager);
  const account = accountService.fromAccountJson(accountJson);
  // 3. 创建交易体
  const transaction = await new Transaction.HVMBuilder(account.getAddress(), providerManager)
    .deploy(file)
    .then((builder) => builder.build());
  // 4. 签名
  transaction.sign(account);
  // 5. 通过 contract service 部署
  const contractService = ServiceManager.getContractService(providerManager);
  const deployRequest = contractService.deploy(transaction);
  const response = await deployRequest.send();
  const deployResult = await response.poll();
  logger.info(JSON.stringify(deployResult));
}
