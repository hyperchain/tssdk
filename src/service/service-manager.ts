import { ProviderManager } from "../provider";
import AccountService from "./account-service";
import BlockService from "./block-service";
import ContractService from "./contract-service";
import DidService from "./did-service";
import NodeService from "./node-service";
import TxService from "./tx-service";
import SqlService from "./sql-service";
import ConfigService from "./config-service";
import VersionService from "./version-service";

export default class ServiceManager {
  public static getTxService(providerManager: ProviderManager): TxService {
    return new TxService(providerManager);
  }

  public static getAccountService(providerManager: ProviderManager): AccountService {
    return new AccountService(providerManager);
  }

  public static getContractService(providerManager: ProviderManager): ContractService {
    return new ContractService(providerManager);
  }

  public static getBlockService(providerManager: ProviderManager): BlockService {
    return new BlockService(providerManager);
  }

  public static getNodeService(providerManager: ProviderManager): NodeService {
    return new NodeService(providerManager);
  }

  public static getDidService(providerManager: ProviderManager): DidService {
    return new DidService(providerManager);
  }

  public static getSqlService(providerManager: ProviderManager): SqlService {
    return new SqlService(providerManager);
  }

  public static getConfigService(providerManager: ProviderManager): ConfigService {
    return new ConfigService(providerManager);
  }

  public static getVersionService(providerManager: ProviderManager): VersionService {
    return new VersionService(providerManager);
  }

  // public static getArchiveService(providerManager: ProviderManager): ArchiveService {
  //   return new ArchiveService(providerManager);
  // }
}
