import { Receipt, VersionServiceType } from "../common";
import { ProviderManager } from "../provider";
import { PollingResponse, Request } from "../request";

export default class VersionService {
  private providerManager: ProviderManager;
  private static readonly VERSION_PREFIX = "version_";

  constructor(providerManager: ProviderManager) {
    this.providerManager = providerManager;
  }

  public setSupportedVersion(...nodeIds: number[]): Request<string | Receipt, PollingResponse> {
    const request = new Request<string | Receipt, PollingResponse>(
      `${VersionService.VERSION_PREFIX}setSupportedVersion`,
      this.providerManager,
      ...nodeIds
    ).enablePolling();
    return request;
  }

  public getVersions(...nodeIds: number[]): Request<VersionServiceType.VersionResult> {
    const request = new Request<VersionServiceType.VersionResult>(
      `${VersionService.VERSION_PREFIX}getVersions`,
      this.providerManager,
      ...nodeIds
    );
    return request;
  }

  public getSupportedVersionByHostname(
    hostname: string,
    ...nodeIds: number[]
  ): Request<VersionServiceType.SupportedVersion> {
    const request = new Request<VersionServiceType.SupportedVersion>(
      `${VersionService.VERSION_PREFIX}getSupportedVersionByHostname`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(hostname);
    return request;
  }

  public getHyperchainVersionFromBin(
    hyperchainVersion: string,
    ...nodeIds: number[]
  ): Request<VersionServiceType.ChainVersion> {
    const request = new Request<VersionServiceType.ChainVersion>(
      `${VersionService.VERSION_PREFIX}getHyperchainVersionFromBin`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(hyperchainVersion);
    return request;
  }
}
