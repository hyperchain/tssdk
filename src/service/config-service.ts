import { ConfigServiceType } from "../common";
import { ProviderManager } from "../provider";
import { Request } from "../request";

export default class ConfigService {
  private providerManager: ProviderManager;
  private static readonly CONF_PREFIX = "config_";

  constructor(providerManager: ProviderManager) {
    this.providerManager = providerManager;
  }

  public getProposal(...nodeIds: number[]): Request<ConfigServiceType.Proposal> {
    const request = new Request<ConfigServiceType.Proposal>(
      `${ConfigService.CONF_PREFIX}getProposal`,
      this.providerManager,
      ...nodeIds
    );
    return request;
  }

  public getConfig(...nodeIds: number[]): Request<string> {
    const request = new Request<string>(
      `${ConfigService.CONF_PREFIX}getConfig`,
      this.providerManager,
      ...nodeIds
    );
    return request;
  }

  public getGenesisInfo(...nodeIds: number[]): Request<string> {
    const request = new Request<string>(
      `${ConfigService.CONF_PREFIX}getGenesisInfo`,
      this.providerManager,
      ...nodeIds
    );
    return request;
  }

  public getHosts(role: string, ...nodeIds: number[]): Request<Record<string, string>> {
    const request = new Request<Record<string, string>>(
      `${ConfigService.CONF_PREFIX}getHosts`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(role);
    return request;
  }

  public getVSet(...nodeIds: number[]): Request<string> {
    const request = new Request<string>(
      `${ConfigService.CONF_PREFIX}getVSet`,
      this.providerManager,
      ...nodeIds
    );
    return request;
  }

  public getAllRoles(...nodeIds: number[]): Request<Record<string, number>> {
    const request = new Request<Record<string, number>>(
      `${ConfigService.CONF_PREFIX}getRoles`,
      this.providerManager,
      ...nodeIds
    );
    return request;
  }

  public isRoleExist(role: string, ...nodeIds: number[]): Request<boolean> {
    const request = new Request<boolean>(
      `${ConfigService.CONF_PREFIX}isRoleExist`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(role);
    return request;
  }

  public getNameByAddress(address: string, ...nodeIds: number[]): Request<string> {
    const request = new Request<string>(
      `${ConfigService.CONF_PREFIX}getCNameByAddress`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(address);
    return request;
  }

  public getAddressByName(name: string, ...nodeIds: number[]): Request<string> {
    const request = new Request<string>(
      `${ConfigService.CONF_PREFIX}getAddressByCName`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(name);
    return request;
  }

  public getAllCNS(...nodeIds: number[]): Request<Record<string, string>> {
    const request = new Request<Record<string, string>>(
      `${ConfigService.CONF_PREFIX}getAllCNS`,
      this.providerManager,
      ...nodeIds
    );
    return request;
  }
}
