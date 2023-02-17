import {
  BvmOperation,
  DecodeUtil,
  HttpProvider,
  logger,
  ProviderManager,
  ServiceManager,
  Transaction,
  BvmType,
} from "../../../../src";
import { genesisAccountJsons } from "../..";

import { completeProposal, setContractVoteEnable } from "./util";

describe("ConfigOperation", () => {
  jest.setTimeout(15000);

  const httpProvider1 = new HttpProvider(1, "localhost:8081");
  test("setContractVoteEnable false", async () => {
    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });
    const accountService = ServiceManager.getAccountService(providerManager);
    await completeProposal(
      new BvmOperation.Proposal.Builder()
        .createForConfig(new BvmOperation.Config.Builder().setContractVoteEnable(false).build())
        .build(),
      BvmType.ContractMethod.ConfigSetContractVoteEnable,
      accountService.fromAccountJson(genesisAccountJsons[0]),
      providerManager
    );
  });

  test("setFilterEnable", async () => {
    await setContractVoteEnable();

    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });
    const accountService = ServiceManager.getAccountService(providerManager);
    await completeProposal(
      new BvmOperation.Proposal.Builder()
        .createForConfig(new BvmOperation.Config.Builder().setFilterEnable(true).build())
        .build(),
      BvmType.ContractMethod.ConfigSetFilterEnable,
      accountService.fromAccountJson(genesisAccountJsons[0]),
      providerManager
    );
  });

  test("setFilterRules", async () => {
    await setContractVoteEnable();

    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });
    const accountService = ServiceManager.getAccountService(providerManager);
    await completeProposal(
      new BvmOperation.Proposal.Builder()
        .createForConfig(
          new BvmOperation.Config.Builder()
            .setFilterRules([
              {
                allow_anyone: true,
                authorized_roles: [],
                forbidden_roles: [],
                id: 1112,
                name: "hello",
                to: [],
                vm: [],
              },
            ])
            .build()
        )
        .build(),
      BvmType.ContractMethod.ConfigSetFilterRules,
      accountService.fromAccountJson(genesisAccountJsons[0]),
      providerManager
    );
  });
});
