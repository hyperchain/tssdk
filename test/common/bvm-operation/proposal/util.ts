import {
  Account,
  BvmOperation,
  DecodeUtil,
  ProviderManager,
  ServiceManager,
  Transaction,
  logger,
  JSONBigintUtil,
  HttpProvider,
  BvmType,
} from "../../../../src";

import { genesisAccountJsons } from "../..";

let contractVoteEnable = false;

export async function setContractVoteEnable() {
  if (contractVoteEnable) {
    return;
  }

  const httpProvider1 = new HttpProvider(1, "localhost:8081");

  const providerManager = await ProviderManager.createManager({
    httpProviders: [httpProvider1],
  });

  const accountService = ServiceManager.getAccountService(providerManager);
  const result = await completeProposal(
    new BvmOperation.Proposal.Builder()
      .createForConfig(new BvmOperation.Config.Builder().setContractVoteEnable(true).build())
      .build(),
    BvmType.ContractMethod.ConfigSetContractVoteEnable,
    accountService.fromAccountJson(genesisAccountJsons[0]),
    providerManager
  );

  if (result.length > 0 && result[0].code === 200) {
    contractVoteEnable = true;
  }
  if (
    result.length > 0 &&
    result[0].code === -30004 &&
    (result[0].msg as string).includes(
      "call SetContractVoteEnable err:key:proposal.contract.vote.enable 's new value is the same to old value"
    )
  ) {
    contractVoteEnable = true;
  }
}

export async function completeProposal(
  opt: BvmOperation.Builtin,
  proposalMethod: BvmType.ContractMethod,
  account: Account,
  providerManager: ProviderManager
) {
  logger.info("==========> proposal start <===========");
  await invokeBvmContract(opt, account, providerManager);
  const result = await voteAndExecute(account, proposalMethod, providerManager);
  logger.info("==========> proposal end <===========");
  return result;
}

async function voteAndExecute(
  account: Account,
  proposalMethod: BvmType.ContractMethod,
  providerManager: ProviderManager
): Promise<any> {
  const configService = ServiceManager.getConfigService(providerManager);
  const accountService = ServiceManager.getAccountService(providerManager);
  const response = await configService.getProposal().send();

  const proposal = response.result;
  const proposalCode = JSONBigintUtil.parse(proposal.code) as any[];
  // 如果当前链上的 proposal 不是当前 invokeBvmContract 的 proposal，则说明当前 invokeBvmContract 的 proposal 不需要 vote，直接返回。
  if (proposalCode[0].MethodName !== proposalMethod) {
    logger.info(
      `current proposal in hyperchain is ${proposalCode[0].MethodName}. ${proposalMethod} don't need to be voted. end.`
    );
    return;
  }
  logger.info(
    `proposal info: { id: ${proposal.id};  MethodName: ${proposalCode[0].MethodName}; status: ${proposal.status}; }`
  );
  logger.info(`0. ${account.getAddress()} voted.`);
  // vote
  for (let i = 1; i < genesisAccountJsons.length; i += 1) {
    const iAccount = accountService.fromAccountJson(genesisAccountJsons[i]);
    const decodedRet = await invokeBvmContract(
      new BvmOperation.Proposal.Builder().vote(proposal.id, true).build(),
      iAccount,
      providerManager
    );
    logger.info(
      `${i}. ${iAccount.getAddress()} voted. result: ${decodedRet.Success ? "Success" : "Error"}`
    );
  }

  const decodedRet = await invokeBvmContract(
    new BvmOperation.Proposal.Builder().execute(proposal.id).build(),
    account,
    providerManager
  );
  const decodedRetRet = DecodeUtil.decodeBvmResultRetRet(decodedRet.Ret);
  logger.info(
    `execute proposal ${proposal.id}. result: ${JSONBigintUtil.stringify(decodedRetRet)}`
  );
  return decodedRetRet;
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
  return decodedRet;
}
