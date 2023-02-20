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

describe("HashChangeOperation", () => {
  const httpProvider1 = new HttpProvider(1, "localhost:8081");
  test("changeHashAlgo", async () => {
    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });

    const accountService = ServiceManager.getAccountService(providerManager);
    const contractService = ServiceManager.getContractService(providerManager);

    const genesisAccount = accountService.fromAccountJson(genesisAccountJsons[0]);

    const transaction = new Transaction.BVMBuilder(genesisAccount.getAddress(), providerManager)
      .invoke(
        new BvmOperation.HashChange.Builder()
          .changeHashAlgo({
            hash_algo: BvmType.HashAlgo.KECCAK_224,
            encrypt_algo: BvmType.EncryptAlgo.DES3_CBC,
          })
          .build()
      )
      .build();
    transaction.sign(genesisAccount);

    const response = await (await contractService.invoke(transaction).send()).poll();

    const decodedRet = DecodeUtil.decodeBvmResultRet(response.result.ret);
    expect(decodedRet).not.toBeNull();
    expect(decodedRet.Success).toBeTruthy();
  });

  test("getSupportHashAlgo", async () => {
    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });

    const accountService = ServiceManager.getAccountService(providerManager);
    const contractService = ServiceManager.getContractService(providerManager);

    const genesisAccount = accountService.fromAccountJson(genesisAccountJsons[0]);

    const transaction = new Transaction.BVMBuilder(genesisAccount.getAddress(), providerManager)
      .invoke(new BvmOperation.HashChange.Builder().getSupportHashAlgo().build())
      .build();
    transaction.sign(genesisAccount);

    const response = await (await contractService.invoke(transaction).send()).poll();

    const decodedRet = DecodeUtil.decodeBvmResultRet(response.result.ret);
    expect(decodedRet).not.toBeNull();
    expect(decodedRet.Success).toBeTruthy();
    const decodedRetRet = DecodeUtil.decodeBvmResultRetRet(decodedRet.Ret);
    expect(decodedRetRet).not.toBeNull();
  });
});
