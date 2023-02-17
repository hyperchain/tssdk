import { init, invokeEvmContract, invokeHvmContract } from "../common";
import { logger, JSONBigintUtil, DecodeUtil } from "../../src/common";

describe("VersionService.setSupportedVersion", () => {
  test("normal test", async () => {
    const { versionService } = await init();
    const request = versionService.setSupportedVersion();
    const response = await request.send();
    const polledResponse = await response.poll();
    const decodedRet = DecodeUtil.decodeBvmResultRet(polledResponse.result.ret);
    const decodedRetRet = DecodeUtil.decodeBvmResultRetRet(decodedRet.Ret);
    expect(decodedRetRet).toBe("success");
  });
});

describe("VersionService.getSupportedVersionByHostname", () => {
  test("normal test", async () => {
    const { versionService } = await init();
    const request = versionService.getSupportedVersionByHostname("node1");
    const response = await request.send();
    expect(response.result.tx_version.includes("3.6")).toBeTruthy();
  });
});

describe("VersionService.getVersions", () => {
  test("normal test", async () => {
    const { versionService } = await init();
    const request = versionService.getVersions();
    const response = await request.send();
    expect(
      "availableHyperchainVersions" in response.result &&
        "runningHyperchainVersions" in response.result
    ).toBeTruthy();
  });
});

describe("VersionService.getHyperchainVersionFromBin", () => {
  test("normal test", async () => {
    const hyperchain = "2.11.0";
    const { versionService } = await init();
    const request = versionService.getHyperchainVersionFromBin(hyperchain);
    const response = await request.send();
    expect(
      "block_version" in response.result &&
        "encode_version" in response.result &&
        "consensus_version" in response.result &&
        "rbft_version" in response.result &&
        "noxbft_version" in response.result
    ).toBeTruthy();
  });
});
