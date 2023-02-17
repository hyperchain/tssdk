import {
  BvmOperation,
  BvmType,
  DecodeUtil,
  HttpProvider,
  logger,
  ProviderManager,
  ServiceManager,
} from "../../../../src";
import { genesisAccountJsons } from "../..";
import { completeProposal, setContractVoteEnable } from "./util";

describe("CNSOperation", () => {
  jest.setTimeout(15000);
  const httpProvider1 = new HttpProvider(1, "localhost:8081");
  test("setCName", async () => {
    await setContractVoteEnable();
    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });
    const accountService = ServiceManager.getAccountService(providerManager);
    await completeProposal(
      new BvmOperation.Proposal.Builder()
        .createForCAMode(
          new BvmOperation.CNS.Builder()
            .setCName(
              "0x0000000000000000000000000000000000ffff0d",
              `contract${new Date().valueOf()}`
            )
            .build()
        )
        .build(),
      BvmType.ContractMethod.CNSSetCName,
      accountService.fromAccountJson(genesisAccountJsons[0]),
      providerManager
    );
  });
});
