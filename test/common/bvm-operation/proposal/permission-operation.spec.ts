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

describe("PermissionOperation", () => {
  jest.setTimeout(15000);
  const httpProvider1 = new HttpProvider(1, "localhost:8081");
  test("createRole", async () => {
    await setContractVoteEnable();

    const providerManager = await ProviderManager.createManager({
      httpProviders: [httpProvider1],
    });
    const accountService = ServiceManager.getAccountService(providerManager);
    await completeProposal(
      new BvmOperation.Proposal.Builder()
        .createForPermission(
          new BvmOperation.Permission.Builder().createRole("super admin x").build()
        )
        .build(),
      BvmType.ContractMethod.PermissionCreateRole,
      accountService.fromAccountJson(genesisAccountJsons[0]),
      providerManager
    );
  });
});
