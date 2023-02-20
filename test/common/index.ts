import fs from "fs";
import path from "path";
import {
  Algo,
  DidDocument,
  HttpProvider,
  ProviderManager,
  ServiceManager,
  StringUtil,
  Transaction,
  DecodeUtil,
  DidService,
  AccountService,
  ContractService,
  TxService,
  SqlService,
  NodeService,
  BlockService,
  Receipt,
  Response,
  BvmOperation,
  DidAccount,
  logger,
  VersionService,
} from "../../src";

let providerManager: ProviderManager;
let didService: DidService;
let accountService: AccountService;
let contractService: ContractService;
let txService: TxService;
let sqlService: SqlService;
let nodeService: NodeService;
let blockService: BlockService;
let versionService: VersionService;
let chainId: string;

// 需要修改成与链对应的 genesisAccount 才可以跑通
export const genesisAccountJsons = [
  `{"address":"16318e532609d4b2e5345ff1cb0a9f0d5f5a5b52","publicKey":"048febfa1048c1d1bb33decf67a89efb2b90309e2e51e0f644f24bd9a6edc939854c7cbb3e3227659b085b3865f72db46a1991e92022043c0f33a18826793b4a19","privateKey":"8a1f2d6ecdab6be41e2ac8526836ddf8df311de2a4078cb7dd94c9cb968ab0b7","version":"4.0","algo":"0x13"}`,
  `{"address":"f5efc05b8a3b9fb13773c2d07b901ac4ff1cedb9","publicKey":"04cc7d42ef34586f9f1b8e85809dc0794e19a4ed3006342758bc215444c41d07a6ab839bdd14404008475da0f12b36a1c0631b371261f5007d17e1c5980680b6ad","privateKey":"b068e48beb1c21f690ddb29284ab5337863daa1c8bc78864574ed18442594c4f","version":"4.0","algo":"0x13"}`,
  `{"address":"c065e7fa0df7ffab76c3278d7b4b3835221cc8ea","publicKey":"04aa70f3459ac490bfae6ffe1553dee51d4ff5b754526ffd29f1dea3eb159b74307afe7e7637002d859b1e76c3fab484975caef34e492e276c7e32ff5eb9f8eec8","privateKey":"35cd4f77ccc388123c5a5c508d9b35432e33fe65aede21c8d264d363f047fc7c","version":"4.0","algo":"0x13"}`,
  `{"address":"b7f4b7350e5961a08e2280394862221bd9e87fb7","publicKey":"048be7a49b6487a1ead27a49cc0e5bbd19a368cc435c9870b6bbb21808330aa8def81322e6c2128db467c73c6f844ee87c91f38d3ac5511d51f675dd213e0ad6bf","privateKey":"ccfe617dcc6a604f9fe74dcefa07c4ec67a336911a44269d23e15a96f0cda7bf","version":"4.0","algo":"0x13"}`,
  `{"address":"3d8fc6d55a480c3f498b1bb6b546be832a986791","publicKey":"04eea9760919a0e107ad39171709a9c2ffe959bd5be310ce6c9998c1aa2ff772c4b309392618804a77eaa62fe197249968559c75cbc32dadabfc6c52b18aada6bc","privateKey":"8eb389539b973c16d1d6d8cd0a3b9eebbf3b1d7b307a903f125cbd59bfec50bb","version":"4.0","algo":"0x13"}`,
  `{"address":"2b01af8a84651455ede2208d94fbe64c4c7d4493","publicKey":"041ce095267e79624d9c5d8cffbdff1df662a2d467b404d63b3d0f93b0941441eab29a7a97509ca812279986e2e57230a669649e6864cf7b83d2c5739e44edeb3e","privateKey":"55b40d6b42beffc6431a43478aed96b7cc1bb2c161c5b29d9b22494efbfe7fa8","version":"4.0","algo":"0x13"}`,
];

export async function init() {
  const accountJson = genesisAccountJsons[0];
  if (providerManager == null) {
    const httpProvider1 = new HttpProvider(1, "localhost:8081");
    providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });
  }
  if (didService == null) {
    didService = ServiceManager.getDidService(providerManager);
  }
  if (accountService == null) {
    accountService = ServiceManager.getAccountService(providerManager);
  }
  if (contractService == null) {
    contractService = ServiceManager.getContractService(providerManager);
  }
  if (txService == null) {
    txService = ServiceManager.getTxService(providerManager);
  }
  if (sqlService == null) {
    sqlService = ServiceManager.getSqlService(providerManager);
  }
  if (nodeService == null) {
    nodeService = ServiceManager.getNodeService(providerManager);
  }
  if (blockService == null) {
    blockService = ServiceManager.getBlockService(providerManager);
  }
  if (versionService == null) {
    versionService = ServiceManager.getVersionService(providerManager);
  }

  const account = accountService.genAccount(Algo.ECRAW);

  if (chainId == null) {
    const httpProvider1 = new HttpProvider(1, "localhost:8081");
    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });

    const genesisAccount = accountService.fromAccountJson(accountJson);

    const transaction = new Transaction.BVMBuilder(genesisAccount.getAddress(), providerManager)
      .invoke(new BvmOperation.DID.Builder().setChainID("hhppcc").build())
      .build();
    transaction.sign(genesisAccount);

    const response = await (await contractService.invoke(transaction).send()).poll();

    logger.info(JSON.stringify(DecodeUtil.decodeBvmResultRet(response.result.ret)));

    chainId = "hhppcc";
  }

  return {
    account,
    accountService,
    providerManager,
    didService,
    txService,
    contractService,
    sqlService,
    nodeService,
    blockService,
    versionService,
  };
}

export async function registerDidAccount(
  admins: string[],
  algo: Algo = Algo.SMRAW
): Promise<DidAccount> {
  function getRandomString(length: number) {
    const str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
    let randomStr = "";
    for (let i = 0; i < length; i += 1) {
      const randomIndex = Math.floor(Math.random() * length);
      randomStr += str[randomIndex];
    }
    return randomStr;
  }
  const { accountService, providerManager, didService } = await init();
  const didAccount = accountService.genDidAccount(algo, getRandomString(10));
  const didDocument: DidDocument = new DidDocument(didAccount, admins);

  const transaction = new Transaction.DidBuilder(didAccount.getAddress(), providerManager)
    .create(didDocument)
    .build();
  transaction.sign(didAccount);
  const request = didService.register(transaction);
  const response = await request.send();
  const result = await response.poll();
  expect(result.code).toBe(0);
  const ret = StringUtil.fromHex(result.result.ret);
  expect(JSON.parse(ret)).toBeTruthy();
  return didAccount as DidAccount;
}

let contractAddress: string;
let deployResult: Response<Receipt>;
let invokeResult: Response<Receipt>;
let decodedInvokeResult: { [p: string]: any };
export async function invokeEvmContract() {
  if (
    contractAddress != null &&
    deployResult != null &&
    invokeResult != null &&
    decodedInvokeResult != null
  ) {
    return {
      contractAddress,
      deployResult,
      invokeResult,
      decodedInvokeResult,
    };
  }
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

  const httpProvider1 = new HttpProvider(1, "localhost:8081");
  const providerManager = await ProviderManager.createManager({
    httpProviders: [httpProvider1],
  });

  const accountService = ServiceManager.getAccountService(providerManager);
  // const account = accountService.genAccount(Algo.SMRAW);
  const account = accountService.genAccount(Algo.ECRAW);
  // const account = accountService.fromAccountJson(ecAccountJson);
  const contractService = ServiceManager.getContractService(providerManager);
  // -------------------------------------- deploy --------------------------------------
  const deployTransaction = new Transaction.EVMBuilder(account.getAddress(), providerManager)
    .deploy(bin)
    .build();

  deployTransaction.sign(account);

  const deployRequest = contractService.deploy(deployTransaction);
  const deployResponse = await deployRequest.send();
  deployResult = await deployResponse.poll();
  contractAddress = deployResult.result.contractAddress;
  // -------------------------------------- invoke --------------------------------------
  const invokeMethod = "testIntAndUint(int256,uint256,uint256,int256[2])";
  // int256 uint256 uint256 int256[2]
  const params = ["123", "123", "123", ["123", "123"]];
  const invokeTransaction = new Transaction.EVMBuilder(account.getAddress(), providerManager)
    .invoke(deployResult.result.contractAddress, invokeMethod, abiStr, params)
    .build();

  invokeTransaction.sign(account);

  const invokeRequest = contractService.invoke(invokeTransaction);
  const invokeResponse = await invokeRequest.send();
  invokeResult = await invokeResponse.poll();

  decodedInvokeResult = DecodeUtil.decodeEvmResult(invokeResult, abiStr, invokeMethod);

  return {
    contractAddress,
    deployResult,
    invokeResult,
    decodedInvokeResult,
  };
}

let deployHvmResult: Response<Receipt>;
let deployHvmBlockHash: string;
export async function invokeHvmContract() {
  if (deployHvmResult != null) {
    return {
      deployHvmResult,
      deployHvmBlockHash,
    };
  }

  const file: Buffer = fs.readFileSync(
    path.resolve(__dirname, "../resource/hvm-jar/credential-1.0-credential.jar")
  );

  const accountJson = JSON.stringify({
    publicKey:
      "045906bf3063dced2488e04cda8227321428b8ef22a07dbe026ed77cbd100594a2fcddd4fda5a98597dd61eb69fbd08ced97a4ef80159c900a5fb845478327aacf",
    privateKey: "2806197d247c5208c49528b46fdfa31c7e1457109f4e984f89e01bb6ed18dc4f",
    address: "6275b09dbb9d49252150e52647101665f8f60ca4",
    algo: "0x13",
    version: "4.0",
  });

  // 1. 新建 provider mananger
  const httpProvider1 = new HttpProvider(1, "localhost:8081");
  const providerManager = await ProviderManager.createManager({
    httpProviders: [httpProvider1],
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
  deployHvmResult = await response.poll();

  const txService = ServiceManager.getTxService(providerManager);
  const {
    result: { blockHash },
  } = await txService.getTxByHash(deployHvmResult.result.txHash).send();

  deployHvmBlockHash = blockHash;

  return {
    deployHvmResult,
    deployHvmBlockHash,
  };
}
