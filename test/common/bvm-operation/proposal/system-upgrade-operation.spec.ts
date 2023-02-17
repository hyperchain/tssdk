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
import { completeProposal, setContractVoteEnable } from "./util";

describe("SystemUpgradeOperation", () => {
  jest.setTimeout(15000);
  const httpProvider1 = new HttpProvider(1, "localhost:8081");
  test("systemUpgrade", async () => {
    await setContractVoteEnable();
    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });
    const versionService = ServiceManager.getVersionService(providerManager);
    const accountService = ServiceManager.getAccountService(providerManager);

    {
      const request = versionService.getVersions();
      const response = await request.send();
      if (Object.keys(response.result.availableHyperchainVersions).length === 0) {
        logger.info("availableHyperchainVersions is null");
        return;
      }
    }
    const target = "2.12.0";
    const response = await versionService.getHyperchainVersionFromBin(target).send();

    await completeProposal(
      new BvmOperation.Proposal.Builder()
        .createForSystemUpgrade(
          new BvmOperation.SystemUpgrade.Builder().systemUpgrade(response.result).build()
        )
        .build(),
      BvmType.ContractMethod.SystemUpgrade,
      accountService.fromAccountJson(genesisAccountJsons[0]),
      providerManager
    );
  });
});
