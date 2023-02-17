import {
  BvmOperation,
  BvmType,
  DecodeUtil,
  HttpProvider,
  logger,
  ProviderManager,
  ServiceManager,
  Transaction,
} from "../../../../src";
import { genesisAccountJsons } from "../..";

describe("BalanceOperation", () => {
  const httpProvider1 = new HttpProvider(1, "localhost:8081");
  test("issue", async () => {
    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });

    const accountService = ServiceManager.getAccountService(providerManager);
    const contractService = ServiceManager.getContractService(providerManager);

    const genesisAccount = accountService.fromAccountJson(genesisAccountJsons[0]);

    const transaction = new Transaction.BVMBuilder(genesisAccount.getAddress(), providerManager)
      .invoke(
        new BvmOperation.Balance.Builder()
          .issue("0xffffffffffbf7e0de2f5a0dc1917f0552aa43d87", BigInt(100000000))
          .build()
      )
      .build();
    transaction.sign(genesisAccount);

    const response = await (await contractService.invoke(transaction).send()).poll();

    const decodedRet = DecodeUtil.decodeBvmResultRet(response.result.ret);
    expect(decodedRet).not.toBeNull();
    expect(decodedRet.Success).toBeTruthy();
    logger.info(JSON.stringify(decodedRet));
    const decodedRetRet = DecodeUtil.decodeBvmResultRetRet(decodedRet.Ret);
    expect(decodedRet).not.toBeNull();
    expect(decodedRetRet).toBe("success");
    logger.info(JSON.stringify(decodedRetRet));
  });
});
