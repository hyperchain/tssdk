import {
  BvmOperation,
  DecodeUtil,
  HttpProvider,
  logger,
  ProviderManager,
  ServiceManager,
  Transaction,
} from "../../../../src";
import { genesisAccountJsons } from "../..";

describe("AccountOperation", () => {
  const httpProvider1 = new HttpProvider(1, "localhost:8081");

  test("register", async () => {
    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });

    const accountService = ServiceManager.getAccountService(providerManager);
    const contractService = ServiceManager.getContractService(providerManager);

    const account = accountService.fromAccountJson(genesisAccountJsons[0]);

    const address = "0xffffffffffbf7e0de2f5a0dc1917f0552aa43d87";
    const cert = `-----BEGIN CERTIFICATE-----
      MIICJjCCAcugAwIBAgIIb35o86b0jHswCgYIKoZIzj0EAwIwQDELMAkGA1UEBhMC
      Q04xDjAMBgNVBAoTBWZsYXRvMRYwFAYDVQQDEw1oeXBlcmNoYWluLmNuMQkwBwYD
      VQQqEwAwHhcNMjEwMTA2MDAwMDAwWhcNMzEwMTA2MDAwMDAwWjBAMQswCQYDVQQG
      EwJDTjEOMAwGA1UEChMFZmxhdG8xFjAUBgNVBAMTDWh5cGVyY2hhaW4uY24xCTAH
      BgNVBCoTADBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABMaD+GC4fnVo2LBI0ik/
      yIL2SPqGmcH3GB1CXA+uKcjwVg8d0JadD0QOqFqExTQf/wbiIfgp3JMPCUYI5Mjw
      eHqjga4wgaswDgYDVR0PAQH/BAQDAgHuMDEGA1UdJQQqMCgGCCsGAQUFBwMCBggr
      BgEFBQcDAQYIKwYBBQUHAwMGCCsGAQUFBwMEMAwGA1UdEwEB/wQCMAAwHQYDVR0O
      BBYEFC7IoDwelpBDcZPHnL7srwD2HTOcMB8GA1UdIwQYMBaAFBINltuEwNPH/Iid
      pWlSHy2R6JMLMBgGA1UdEQQRMA+CDWh5cGVyY2hhaW4uY24wCgYIKoZIzj0EAwID
      SQAwRgIhAOtNu4SB2nRhOQLzHQZOF1bjFewmnwMIlFq0+SN5yCmVAiEAr0cI8Ay1
      OmgE8REZIa7ybtGy1iFhrv5XQiqwzEgD+N4=
      -----END CERTIFICATE-----
      `;

    const transaction = new Transaction.BVMBuilder(account.getAddress(), providerManager)
      .invoke(new BvmOperation.Account.Builder().register(address, cert).build())
      .build();
    transaction.sign(account);
    const response = await (await contractService.invoke(transaction).send()).poll();
    const decodedRet = DecodeUtil.decodeBvmResultRet(response.result.ret);
    logger.info(decodedRet);
    expect(decodedRet).not.toBeNull();
  });

  test("abandon", async () => {
    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });

    const accountService = ServiceManager.getAccountService(providerManager);
    const contractService = ServiceManager.getContractService(providerManager);

    const account = accountService.fromAccountJson(genesisAccountJsons[0]);

    const address = "0xffffffffffbf7e0de2f5a0dc1917f0552aa43d87";
    const sdkCert =
      "-----BEGIN CERTIFICATE-----\n" +
      "MIICVjCCAgKgAwIBAgIIQjE4PWfTGPAwCgYIKoZIzj0EAwIwdDEJMAcGA1UECBMA\n" +
      "MQkwBwYDVQQHEwAxCTAHBgNVBAkTADEJMAcGA1UEERMAMQ4wDAYDVQQKEwVmbGF0\n" +
      "bzEJMAcGA1UECxMAMQ4wDAYDVQQDEwVub2RlMTELMAkGA1UEBhMCWkgxDjAMBgNV\n" +
      "BCoTBWVjZXJ0MB4XDTIwMTAxNjAwMDAwMFoXDTIwMTAxNjAwMDAwMFowYjELMAkG\n" +
      "A1UEBhMCQ04xDjAMBgNVBAoTBWZsYXRvMTMwMQYDVQQDEyoweDk2MzkxNTIxNTBk\n" +
      "ZjkxMDVjMTRhZTM1M2M3YzdlNGQ1ZTU2YTAxYTMxDjAMBgNVBCoTBWVjZXJ0MFYw\n" +
      "EAYHKoZIzj0CAQYFK4EEAAoDQgAEial3WRUmVgLeB+Oi8R/FQDtpp4egSGnQ007x\n" +
      "M4uDHTIqlQmz6VAe4d2caMIXREecbYTkAK4HNR6y7A54ISc9pqOBkjCBjzAOBgNV\n" +
      "HQ8BAf8EBAMCAe4wMQYDVR0lBCowKAYIKwYBBQUHAwIGCCsGAQUFBwMBBggrBgEF\n" +
      "BQcDAwYIKwYBBQUHAwQwDAYDVR0TAQH/BAIwADAdBgNVHQ4EFgQU+7HuCW+CEqcP\n" +
      "UbcUJ2Ad5evjrIswDwYDVR0jBAgwBoAEAQIDBDAMBgMqVgEEBWVjZXJ0MAoGCCqG\n" +
      "SM49BAMCA0IA7aV3A20YOObn+H72ksXcUHx8PdC0z/rULhes2uFiINsqEPkGkaH9\n" +
      "HjBiP8uYn4YLtYVZ5pdmfoTHa7/CjVyOUwA=\n" +
      "-----END CERTIFICATE-----";

    const transaction = new Transaction.BVMBuilder(account.getAddress(), providerManager)
      .invoke(new BvmOperation.Account.Builder().abandon(address, sdkCert).build())
      .build();
    transaction.sign(account);
    const response = await (await contractService.invoke(transaction).send()).poll();
    const decodedRet = DecodeUtil.decodeBvmResultRet(response.result.ret);
    logger.info(decodedRet);
    expect(decodedRet).not.toBeNull();
  });
});
