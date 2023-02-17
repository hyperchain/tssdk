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

describe("CertOperation", () => {
  const httpProvider1 = new HttpProvider(1, "localhost:8081");

  test("revoke", async () => {
    const ecert =
      "-----BEGIN CERTIFICATE-----\n" +
      "MIICODCCAeSgAwIBAgIBATAKBggqhkjOPQQDAjB0MQkwBwYDVQQIEwAxCTAHBgNV\n" +
      "BAcTADEJMAcGA1UECRMAMQkwBwYDVQQREwAxDjAMBgNVBAoTBWZsYXRvMQkwBwYD\n" +
      "VQQLEwAxDjAMBgNVBAMTBW5vZGUxMQswCQYDVQQGEwJaSDEOMAwGA1UEKhMFZWNl\n" +
      "cnQwIBcNMjAwNTIxMDQyNTQ0WhgPMjEyMDA0MjcwNTI1NDRaMHQxCTAHBgNVBAgT\n" +
      "ADEJMAcGA1UEBxMAMQkwBwYDVQQJEwAxCTAHBgNVBBETADEOMAwGA1UEChMFZmxh\n" +
      "dG8xCTAHBgNVBAsTADEOMAwGA1UEAxMFbm9kZTExCzAJBgNVBAYTAlpIMQ4wDAYD\n" +
      "VQQqEwVlY2VydDBWMBAGByqGSM49AgEGBSuBBAAKA0IABDoBjgQsvY4xhyIy3aWh\n" +
      "4HLOTTY6te1VbmZaH5EZnKzqjU1f436bVsfi9HLE3/MCeZD6ISe1U5giM5NuwF6T\n" +
      "ZEOjaDBmMA4GA1UdDwEB/wQEAwIChDAmBgNVHSUEHzAdBggrBgEFBQcDAgYIKwYB\n" +
      "BQUHAwEGAioDBgOBCwEwDwYDVR0TAQH/BAUwAwEB/zANBgNVHQ4EBgQEAQIDBDAM\n" +
      "BgMqVgEEBWVjZXJ0MAoGCCqGSM49BAMCA0IAuVuDqguvjPPveimWruESBYqMJ1qq\n" +
      "ryhXiMhlYwzH1FgUz0TcayuY+4KebRhFhb14ZDXBBPXcn9CYdtbbSxXTogE=\n" +
      "-----END CERTIFICATE-----";
    const priv =
      "-----BEGIN EC PRIVATE KEY-----\n" +
      "MHQCAQEEIFO8E/zYebPTI++gmHNYZEUetgn3DychVadgTUMIJX3VoAcGBSuBBAAK\n" +
      "oUQDQgAEOgGOBCy9jjGHIjLdpaHgcs5NNjq17VVuZlofkRmcrOqNTV/jfptWx+L0\n" +
      "csTf8wJ5kPohJ7VTmCIzk27AXpNkQw==\n" +
      "-----END EC PRIVATE KEY-----";

    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });

    const accountService = ServiceManager.getAccountService(providerManager);
    const contractService = ServiceManager.getContractService(providerManager);

    const genesisAccount = accountService.fromAccountJson(genesisAccountJsons[0]);

    const transaction = new Transaction.BVMBuilder(genesisAccount.getAddress(), providerManager)
      .invoke(new BvmOperation.Cert.Builder().revoke(ecert, priv).build())
      .build();
    transaction.sign(genesisAccount);

    const response = await (await contractService.invoke(transaction).send()).poll();

    const decodedRet = DecodeUtil.decodeBvmResultRet(response.result.ret);
    logger.info(decodedRet);
  });

  test("check", async () => {
    const ecert =
      "-----BEGIN CERTIFICATE-----\n" +
      "MIICSTCCAfWgAwIBAgIBATAKBggqhkjOPQQDAjB0MQkwBwYDVQQIEwAxCTAHBgNV\n" +
      "BAcTADEJMAcGA1UECRMAMQkwBwYDVQQREwAxDjAMBgNVBAoTBWZsYXRvMQkwBwYD\n" +
      "VQQLEwAxDjAMBgNVBAMTBW5vZGUyMQswCQYDVQQGEwJaSDEOMAwGA1UEKhMFZWNl\n" +
      "cnQwIBcNMjAwNTIxMDU1MTE0WhgPMjEyMDA0MjcwNjUxMTRaMHQxCTAHBgNVBAgT\n" +
      "ADEJMAcGA1UEBxMAMQkwBwYDVQQJEwAxCTAHBgNVBBETADEOMAwGA1UEChMFZmxh\n" +
      "dG8xCTAHBgNVBAsTADEOMAwGA1UEAxMFbm9kZTExCzAJBgNVBAYTAlpIMQ4wDAYD\n" +
      "VQQqEwVlY2VydDBWMBAGByqGSM49AgEGBSuBBAAKA0IABBI3ewNK21vHNOPG6U3X\n" +
      "mKJohSNNz72QKDxUpRt0fCJHwaGYfSvY4cnqkbliclfckUTpCkFSRr4cqN6PURCF\n" +
      "zkWjeTB3MA4GA1UdDwEB/wQEAwIChDAmBgNVHSUEHzAdBggrBgEFBQcDAgYIKwYB\n" +
      "BQUHAwEGAioDBgOBCwEwDwYDVR0TAQH/BAUwAwEB/zANBgNVHQ4EBgQEAQIDBDAP\n" +
      "BgNVHSMECDAGgAQBAgMEMAwGAypWAQQFZWNlcnQwCgYIKoZIzj0EAwIDQgB3Cfo8\n" +
      "/Vdzzlz+MW+MIVuYQkcNkACY/yU/IXD1sHDGZQWcGKr4NR7FHJgsbjGpbUiCofw4\n" +
      "4rK6biAEEAOcv1BQAA==\n" +
      "-----END CERTIFICATE-----";

    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });

    const accountService = ServiceManager.getAccountService(providerManager);
    const contractService = ServiceManager.getContractService(providerManager);

    const genesisAccount = accountService.fromAccountJson(genesisAccountJsons[0]);

    const transaction = new Transaction.BVMBuilder(genesisAccount.getAddress(), providerManager)
      .invoke(new BvmOperation.Cert.Builder().check(ecert).build())
      .build();
    transaction.sign(genesisAccount);

    const response = await (await contractService.invoke(transaction).send()).poll();

    const decodedRet = DecodeUtil.decodeBvmResultRet(response.result.ret);
    logger.info(decodedRet);
  });

  test("freeze", async () => {
    const ecert =
      "-----BEGIN CERTIFICATE-----\n" +
      "MIICFDCCAbqgAwIBAgIIbGmp7HEb95UwCgYIKoEcz1UBg3UwPTELMAkGA1UEBhMC\n" +
      "Q04xEzARBgNVBAoTCkh5cGVyY2hhaW4xDjAMBgNVBAMTBW5vZGUxMQkwBwYDVQQq\n" +
      "EwAwHhcNMjEwMzEwMDAwMDAwWhcNMjUwMzEwMDAwMDAwWjA/MQswCQYDVQQGEwJD\n" +
      "TjEOMAwGA1UEChMFZmxhdG8xDjAMBgNVBAMTBW5vZGUxMRAwDgYDVQQqEwdzZGtj\n" +
      "ZXJ0MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAE1hoClj022lTxWSUCw0Ht4PT+dr8/\n" +
      "n0BQLeuQVBCnZWKNntBg6cMyVSbMVtcyhAyB8s4+tvzS5bIOqYjLqdO18KOBpDCB\n" +
      "oTAOBgNVHQ8BAf8EBAMCAe4wMQYDVR0lBCowKAYIKwYBBQUHAwIGCCsGAQUFBwMB\n" +
      "BggrBgEFBQcDAwYIKwYBBQUHAwQwDAYDVR0TAQH/BAIwADAdBgNVHQ4EFgQUEo46\n" +
      "euyltTBBzeqlUhbr7DhPVvowHwYDVR0jBBgwFoAUmrWTObRDvo/F/zj5lGV+tYEr\n" +
      "LbswDgYDKlYBBAdzZGtjZXJ0MAoGCCqBHM9VAYN1A0gAMEUCIHnScuepuomkq2OT\n" +
      "prJL44lxsSkc4Zhpq6c+IpX5cbmZAiEA6l2BMWHuDrVudJ2COYWo8E42mvn7lLPD\n" +
      "mpMkfrWt5ek=\n" +
      "-----END CERTIFICATE-----\n";
    const priv =
      "-----BEGIN EC PRIVATE KEY-----\n" +
      "MHQCAQEEICKWeh1X4x1cZI+nfsAw5VXDgLPspN9vixkTlOTSllknoAcGBSuBBAAK\n" +
      "oUQDQgAE1hoClj022lTxWSUCw0Ht4PT+dr8/n0BQLeuQVBCnZWKNntBg6cMyVSbM\n" +
      "VtcyhAyB8s4+tvzS5bIOqYjLqdO18A==\n" +
      "-----END EC PRIVATE KEY-----\n";

    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });

    const accountService = ServiceManager.getAccountService(providerManager);
    const contractService = ServiceManager.getContractService(providerManager);

    const genesisAccount = accountService.fromAccountJson(genesisAccountJsons[0]);

    const transaction = new Transaction.BVMBuilder(genesisAccount.getAddress(), providerManager)
      .invoke(new BvmOperation.Cert.Builder().freeze(ecert, priv).build())
      .build();
    transaction.sign(genesisAccount);

    const response = await (await contractService.invoke(transaction).send()).poll();

    const decodedRet = DecodeUtil.decodeBvmResultRet(response.result.ret);
    logger.info(decodedRet);
  });

  test("unfreeze", async () => {
    const ecert =
      "-----BEGIN CERTIFICATE-----\n" +
      "MIICFDCCAbqgAwIBAgIIbGmp7HEb95UwCgYIKoEcz1UBg3UwPTELMAkGA1UEBhMC\n" +
      "Q04xEzARBgNVBAoTCkh5cGVyY2hhaW4xDjAMBgNVBAMTBW5vZGUxMQkwBwYDVQQq\n" +
      "EwAwHhcNMjEwMzEwMDAwMDAwWhcNMjUwMzEwMDAwMDAwWjA/MQswCQYDVQQGEwJD\n" +
      "TjEOMAwGA1UEChMFZmxhdG8xDjAMBgNVBAMTBW5vZGUxMRAwDgYDVQQqEwdzZGtj\n" +
      "ZXJ0MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAE1hoClj022lTxWSUCw0Ht4PT+dr8/\n" +
      "n0BQLeuQVBCnZWKNntBg6cMyVSbMVtcyhAyB8s4+tvzS5bIOqYjLqdO18KOBpDCB\n" +
      "oTAOBgNVHQ8BAf8EBAMCAe4wMQYDVR0lBCowKAYIKwYBBQUHAwIGCCsGAQUFBwMB\n" +
      "BggrBgEFBQcDAwYIKwYBBQUHAwQwDAYDVR0TAQH/BAIwADAdBgNVHQ4EFgQUEo46\n" +
      "euyltTBBzeqlUhbr7DhPVvowHwYDVR0jBBgwFoAUmrWTObRDvo/F/zj5lGV+tYEr\n" +
      "LbswDgYDKlYBBAdzZGtjZXJ0MAoGCCqBHM9VAYN1A0gAMEUCIHnScuepuomkq2OT\n" +
      "prJL44lxsSkc4Zhpq6c+IpX5cbmZAiEA6l2BMWHuDrVudJ2COYWo8E42mvn7lLPD\n" +
      "mpMkfrWt5ek=\n" +
      "-----END CERTIFICATE-----\n";
    const priv =
      "-----BEGIN EC PRIVATE KEY-----\n" +
      "MHQCAQEEICKWeh1X4x1cZI+nfsAw5VXDgLPspN9vixkTlOTSllknoAcGBSuBBAAK\n" +
      "oUQDQgAE1hoClj022lTxWSUCw0Ht4PT+dr8/n0BQLeuQVBCnZWKNntBg6cMyVSbM\n" +
      "VtcyhAyB8s4+tvzS5bIOqYjLqdO18A==\n" +
      "-----END EC PRIVATE KEY-----\n";

    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });

    const accountService = ServiceManager.getAccountService(providerManager);
    const contractService = ServiceManager.getContractService(providerManager);

    const genesisAccount = accountService.fromAccountJson(genesisAccountJsons[0]);

    const transaction = new Transaction.BVMBuilder(genesisAccount.getAddress(), providerManager)
      .invoke(new BvmOperation.Cert.Builder().unfreeze(ecert, priv).build())
      .build();
    transaction.sign(genesisAccount);

    const response = await (await contractService.invoke(transaction).send()).poll();

    const decodedRet = DecodeUtil.decodeBvmResultRet(response.result.ret);
    logger.info(decodedRet);
  });
});
