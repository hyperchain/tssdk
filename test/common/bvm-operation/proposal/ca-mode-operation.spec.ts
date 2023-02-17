import {
  BvmOperation,
  HttpProvider,
  ProviderManager,
  ServiceManager,
  BvmType,
} from "../../../../src";
import { genesisAccountJsons } from "../..";
import { completeProposal, setContractVoteEnable } from "./util";

describe("CAModeOperation", () => {
  jest.setTimeout(15000);
  const httpProvider1 = new HttpProvider(1, "localhost:8081");
  test("getCAMode", async () => {
    // await setContractVoteEnable();

    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });
    const accountService = ServiceManager.getAccountService(providerManager);
    const result = await completeProposal(
      new BvmOperation.Proposal.Builder()
        .createForCAMode(new BvmOperation.CAMode.Builder().getCAMode().build())
        .build(),
      BvmType.ContractMethod.CAGetCAMode,
      accountService.fromAccountJson(genesisAccountJsons[0]),
      providerManager
    );
  });

  test("setCAMode", async () => {
    await setContractVoteEnable();

    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });
    const accountService = ServiceManager.getAccountService(providerManager);
    const result = await completeProposal(
      new BvmOperation.Proposal.Builder()
        .createForCAMode(new BvmOperation.CAMode.Builder().setCAMode(1).build())
        .build(),
      BvmType.ContractMethod.CASetCAMode,
      accountService.fromAccountJson(genesisAccountJsons[0]),
      providerManager
    );
  });
});
