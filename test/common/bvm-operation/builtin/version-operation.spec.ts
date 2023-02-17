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

describe("VersionOperation", () => {
  const httpProvider1 = new HttpProvider(1, "localhost:8081");
  test("getLatestVersions", async () => {
    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });

    const accountService = ServiceManager.getAccountService(providerManager);
    const contractService = ServiceManager.getContractService(providerManager);

    const genesisAccount = accountService.fromAccountJson(genesisAccountJsons[0]);

    const transaction = new Transaction.BVMBuilder(genesisAccount.getAddress(), providerManager)
      .invoke(new BvmOperation.Version.Builder().getLatestVersions().build())
      .build();
    transaction.sign(genesisAccount);

    const response = await (await contractService.invoke(transaction).send()).poll();

    const decodedRet = DecodeUtil.decodeBvmResultRet(response.result.ret);
    const decodedRetRet = DecodeUtil.decodeBvmResultRetRet(decodedRet.Ret);

    expect(decodedRet.Success).toBeTruthy();
  });

  test("getSupportedVersionByHostname", async () => {
    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });

    const accountService = ServiceManager.getAccountService(providerManager);
    const contractService = ServiceManager.getContractService(providerManager);

    const genesisAccount = accountService.fromAccountJson(genesisAccountJsons[0]);

    const transaction = new Transaction.BVMBuilder(genesisAccount.getAddress(), providerManager)
      .invoke(new BvmOperation.Version.Builder().getSupportedVersionByHostname("node1").build())
      .build();
    transaction.sign(genesisAccount);

    const response = await (await contractService.invoke(transaction).send()).poll();

    const decodedRet = DecodeUtil.decodeBvmResultRet(response.result.ret);
    const decodedRetRet = DecodeUtil.decodeBvmResultRetRet(decodedRet.Ret);

    logger.info(decodedRet);
    logger.info(decodedRetRet);

    expect(decodedRet.Success).toBeTruthy();
  });
});
