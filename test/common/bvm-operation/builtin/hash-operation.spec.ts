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

describe("HashOperation", () => {
  const httpProvider1 = new HttpProvider(1, "localhost:8081");
  test("setGenesisInfoForHpc", async () => {
    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });

    const accountService = ServiceManager.getAccountService(providerManager);
    const contractService = ServiceManager.getContractService(providerManager);

    const genesisAccount = accountService.fromAccountJson(genesisAccountJsons[0]);

    const transaction = new Transaction.BVMBuilder(genesisAccount.getAddress(), providerManager)
      .invoke(
        new BvmOperation.Hash.Builder()
          .setGenesisInfoForHpc({
            genesisAccount: {
              "0x000f1a7a08ccc48e5d30f80850cf1cf283aa3abd": "1000000000",
              e93b92f1da08f925bdee44e91e7768380ae83307: "1000000000",
            },
            genesisNodes: [{ genesisNode: "node1", certContent: "node1 cert content" }],
          })
          .build()
      )
      .build();
    transaction.sign(genesisAccount);

    const response = await (await contractService.invoke(transaction).send()).poll();

    const decodedRet = DecodeUtil.decodeBvmResultRet(response.result.ret);
    expect(decodedRet).not.toBeNull();
    expect(decodedRet.Success).toBeTruthy();
    logger.info(JSON.stringify(decodedRet));
    expect(decodedRet.Success).toBeTruthy();
  });

  test("getGenesisInfoForHpc", async () => {
    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });

    const accountService = ServiceManager.getAccountService(providerManager);
    const contractService = ServiceManager.getContractService(providerManager);

    const genesisAccount = accountService.fromAccountJson(genesisAccountJsons[0]);

    const transaction = new Transaction.BVMBuilder(genesisAccount.getAddress(), providerManager)
      .invoke(new BvmOperation.Hash.Builder().getGenesisInfoForHpc().build())
      .build();
    transaction.sign(genesisAccount);

    const response = await (await contractService.invoke(transaction).send()).poll();

    const decodedRet = DecodeUtil.decodeBvmResultRet(response.result.ret);
    expect(decodedRet).not.toBeNull();
    expect(decodedRet.Success).toBeTruthy();
    logger.info(JSON.stringify(decodedRet));
    const decodedRetRet = DecodeUtil.decodeBvmResultRetRet(decodedRet.Ret);
    expect(decodedRetRet.genesisAccount["0x000f1a7a08ccc48e5d30f80850cf1cf283aa3abd"]).toBe(
      "1000000000"
    );
  });
});
