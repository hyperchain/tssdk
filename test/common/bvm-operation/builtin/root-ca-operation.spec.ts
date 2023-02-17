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

describe("RootCAOperation", () => {
  const httpProvider1 = new HttpProvider(1, "localhost:8081");
  test("addRootCA", async () => {
    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });

    const accountService = ServiceManager.getAccountService(providerManager);
    const contractService = ServiceManager.getContractService(providerManager);

    const genesisAccount = accountService.fromAccountJson(genesisAccountJsons[0]);

    const transaction = new Transaction.BVMBuilder(genesisAccount.getAddress(), providerManager)
      .invoke(new BvmOperation.RootCA.Builder().addRootCA("rootca").build())
      .build();
    transaction.sign(genesisAccount);

    const response = await (await contractService.invoke(transaction).send()).poll();

    const decodedRet = DecodeUtil.decodeBvmResultRet(response.result.ret);
    logger.info(JSON.stringify(decodedRet));
    expect(decodedRet).not.toBeNull();
  });

  test("getRootCAs", async () => {
    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });

    const accountService = ServiceManager.getAccountService(providerManager);
    const contractService = ServiceManager.getContractService(providerManager);

    const genesisAccount = accountService.fromAccountJson(genesisAccountJsons[0]);

    const transaction = new Transaction.BVMBuilder(genesisAccount.getAddress(), providerManager)
      .invoke(new BvmOperation.RootCA.Builder().getRootCAs().build())
      .build();
    transaction.sign(genesisAccount);

    const response = await (await contractService.invoke(transaction).send()).poll();

    const decodedRet = DecodeUtil.decodeBvmResultRet(response.result.ret);
    logger.info(JSON.stringify(decodedRet));
    expect(decodedRet).not.toBeNull();
    const decodedRetRet = DecodeUtil.decodeBvmResultRetRet(decodedRet.Ret);
    logger.info(JSON.stringify(decodedRetRet));
  });
});
