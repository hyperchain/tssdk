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

describe("NodeOperation", () => {
  jest.setTimeout(15000);
  const httpProvider1 = new HttpProvider(1, "localhost:8081");
  test("addNode", async () => {
    await setContractVoteEnable();

    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });
    const accountService = ServiceManager.getAccountService(providerManager);
    await completeProposal(
      new BvmOperation.Proposal.Builder()
        .createForNode(
          new BvmOperation.Node.Builder()
            .addNode(Buffer.from([]), "hostname11", "role11", "namespace11")
            .build()
        )
        .build(),
      BvmType.ContractMethod.NodeAddNode,
      accountService.fromAccountJson(genesisAccountJsons[0]),
      providerManager
    );
  });
});
