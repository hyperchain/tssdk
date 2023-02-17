import {
  HttpProvider,
  ProviderManager,
  ServiceManager,
  Transaction,
  BvmOperation,
  DecodeUtil,
  Account,
  Algo,
} from "@hyperchain/jssdk";

// 需要修改成与链对应的 genesisAccount 才可以跑通
export const genesisAccountJsons = [
  `{"address":"16318e532609d4b2e5345ff1cb0a9f0d5f5a5b52","publicKey":"048febfa1048c1d1bb33decf67a89efb2b90309e2e51e0f644f24bd9a6edc939854c7cbb3e3227659b085b3865f72db46a1991e92022043c0f33a18826793b4a19","privateKey":"8a1f2d6ecdab6be41e2ac8526836ddf8df311de2a4078cb7dd94c9cb968ab0b7","version":"4.0","algo":"0x13"}`,
  `{"address":"f5efc05b8a3b9fb13773c2d07b901ac4ff1cedb9","publicKey":"04cc7d42ef34586f9f1b8e85809dc0794e19a4ed3006342758bc215444c41d07a6ab839bdd14404008475da0f12b36a1c0631b371261f5007d17e1c5980680b6ad","privateKey":"b068e48beb1c21f690ddb29284ab5337863daa1c8bc78864574ed18442594c4f","version":"4.0","algo":"0x13"}`,
  `{"address":"c065e7fa0df7ffab76c3278d7b4b3835221cc8ea","publicKey":"04aa70f3459ac490bfae6ffe1553dee51d4ff5b754526ffd29f1dea3eb159b74307afe7e7637002d859b1e76c3fab484975caef34e492e276c7e32ff5eb9f8eec8","privateKey":"35cd4f77ccc388123c5a5c508d9b35432e33fe65aede21c8d264d363f047fc7c","version":"4.0","algo":"0x13"}`,
  `{"address":"b7f4b7350e5961a08e2280394862221bd9e87fb7","publicKey":"048be7a49b6487a1ead27a49cc0e5bbd19a368cc435c9870b6bbb21808330aa8def81322e6c2128db467c73c6f844ee87c91f38d3ac5511d51f675dd213e0ad6bf","privateKey":"ccfe617dcc6a604f9fe74dcefa07c4ec67a336911a44269d23e15a96f0cda7bf","version":"4.0","algo":"0x13"}`,
  `{"address":"3d8fc6d55a480c3f498b1bb6b546be832a986791","publicKey":"04eea9760919a0e107ad39171709a9c2ffe959bd5be310ce6c9998c1aa2ff772c4b309392618804a77eaa62fe197249968559c75cbc32dadabfc6c52b18aada6bc","privateKey":"8eb389539b973c16d1d6d8cd0a3b9eebbf3b1d7b307a903f125cbd59bfec50bb","version":"4.0","algo":"0x13"}`,
  `{"address":"2b01af8a84651455ede2208d94fbe64c4c7d4493","publicKey":"041ce095267e79624d9c5d8cffbdff1df662a2d467b404d63b3d0f93b0941441eab29a7a97509ca812279986e2e57230a669649e6864cf7b83d2c5739e44edeb3e","privateKey":"55b40d6b42beffc6431a43478aed96b7cc1bb2c161c5b29d9b22494efbfe7fa8","version":"4.0","algo":"0x13"}`,
];

export async function testDidOperation() {
  const httpProvider1 = new HttpProvider(1, "localhost:8081");
  const providerManager = await ProviderManager.createManager({
    httpProviders: [httpProvider1],
  });

  const accountService = ServiceManager.getAccountService(providerManager);
  const contractService = ServiceManager.getContractService(providerManager);

  const genesisAccount = accountService.fromAccountJson(genesisAccountJsons[0]);

  const transaction = new Transaction.BVMBuilder(genesisAccount.getAddress(), providerManager)
    .invoke(new BvmOperation.DID.Builder().setChainID("hhppcc").build())
    .build();
  transaction.sign(genesisAccount);

  const response = await (await contractService.invoke(transaction).send()).poll();

  const decodedRet = DecodeUtil.decodeBvmResultRet(response.result.ret);
  console.log("DIDOperation decoded BVM result ret: ", decodedRet);
}

export async function testProposalOperation() {
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
  const contractService = ServiceManager.getContractService(providerManager);

  const genesisAccount = accountService.fromAccountJson(genesisAccountJsons[0]);

  // 先部署合约
  const deployTransaction = new Transaction.EVMBuilder(genesisAccount.getAddress(), providerManager)
    .deploy(bin)
    .build();

  deployTransaction.sign(genesisAccount);

  const deployRequest = contractService.deploy(deployTransaction);
  const deployResponse = await deployRequest.send();
  const deployResult = await deployResponse.poll();

  const contractNameAfter = new Date().valueOf().toString();

  await completeProposal(
    new BvmOperation.Proposal.Builder()
      .createForCNS(
        new BvmOperation.CNS.Builder()
          .setCName(deployResult.result.contractAddress, contractNameAfter)
          .build()
      )
      .build(),
    genesisAccount,
    providerManager
  );

  const invokeMethod = "testIntAndUint(int256,uint256,uint256,int256[2])";
  const params = ["123", "123", "123", ["123", "123"]];
  const invokeTransaction = new Transaction.EVMBuilder(genesisAccount.getAddress(), providerManager)
    .invoke("", invokeMethod, abiStr, params)
    .contractName(contractNameAfter)
    .build();

  invokeTransaction.sign(genesisAccount);

  const invokeRequest = contractService.invoke(invokeTransaction);
  const invokeResponse = await invokeRequest.send();
  const invokeResult = await invokeResponse.poll();
  console.log("------------------- invoke -------------------");
  console.log(invokeResult);
}

async function completeProposal(
  opt: BvmOperation.Builtin,
  account: Account,
  providerManager: ProviderManager
) {
  await invokeBvmContract(opt, account, providerManager);
  return await voteAndExecute(account, providerManager);
}

async function voteAndExecute(
  account: Account,
  providerManager: ProviderManager
): Promise<string | undefined> {
  const configService = ServiceManager.getConfigService(providerManager);
  const accountService = ServiceManager.getAccountService(providerManager);
  const response = await configService.getProposal().send();
  const proposal = response.result;

  // vote
  for (let i = 1; i < 6; i += 1) {
    await invokeBvmContract(
      new BvmOperation.Proposal.Builder().vote(proposal.id, true).build(),
      accountService.fromAccountJson(genesisAccountJsons[i]),
      providerManager
    );
  }

  const decodedRet = await invokeBvmContract(
    new BvmOperation.Proposal.Builder().execute(proposal.id).build(),
    account,
    providerManager
  );
  const operationResults = DecodeUtil.decodeBvmResultRetRet(decodedRet.Ret);
  console.log("operationResults: ", operationResults);
  if (operationResults?.length > 0) {
    return operationResults[0].msg;
  }
  return undefined;
}

async function invokeBvmContract(
  opt: BvmOperation.Builtin,
  account: Account,
  providerManager: ProviderManager
) {
  const contractService = ServiceManager.getContractService(providerManager);

  const transaction = new Transaction.BVMBuilder(account.getAddress(), providerManager)
    .invoke(opt)
    .build();
  transaction.sign(account);

  const response = await (await contractService.invoke(transaction).send()).poll();
  const decodedRet = DecodeUtil.decodeBvmResultRet(response.result.ret);
  console.log("decodedRet: ", decodedRet);
  return decodedRet;
}
