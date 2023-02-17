import { PropertyEmptyError, PropertyError, RequestError } from "../common";
import { logger, JSONBigintUtil } from "../common";
import { PollingResponse, Request, Response } from "../request";
import { ServiceManager } from "../service";
import { TxVersion } from "../transaction";
// import GrpcProvider from "./grpc-provider";
import HttpProvider from "./http-provider";
import Provider from "./provider";
interface ProviderManagerOptions {
  namespace?: string;
  // enableGrpc?: boolean;
  httpProviders?: HttpProvider[];
  // grpcProviders?: GrpcProvider[];
}
export default class ProviderManager {
  private httpProviders: HttpProvider[];
  private namespace: string;
  private gasPrice?: bigint;
  private txVersion?: TxVersion;
  private chainId?: string;
  // private grpcProviders: GrpcProvider[];
  // private enableGrpc: boolean;
  //// attr tCertPool

  private constructor(options?: ProviderManagerOptions) {
    this.namespace = options?.namespace ?? "global";
    this.httpProviders = options?.httpProviders || [];
    // this.grpcProviders = options?.grpcProviders || [];
  }

  public static emptyManager(): ProviderManager {
    return new ProviderManager();
  }

  public static async createManager(options?: ProviderManagerOptions): Promise<ProviderManager> {
    const providerManager = new ProviderManager(options);
    return providerManager.init();
  }

  public async init(): Promise<ProviderManager> {
    if (this.getHttpProviders().length === 0) {
      throw new PropertyError(
        "can't initialize a ProviderManager instance with empty HttpProviders"
      );
    }
    const [gasPrice, txVersion] = await Promise.all([
      this.getGasPriceFromChain(),
      this.getTxVersionFromChain(),
    ]);
    this.setGasPrice(gasPrice);
    this.setTxVersion(txVersion);

    const chainId = await this.getLocalChainIdFromChain();
    if (chainId != null) {
      this.setChainId(chainId);
    }
    logger.info(`gasPrice: ${gasPrice}; txVersion: ${txVersion.getVersion()}; chainId: ${chainId}`);
    return this;
  }

  public send<T, R extends Response<T> = Response<T>>(
    request: Request<T>,
    ...nodeIds: number[]
  ): Promise<R> {
    let providers: Provider[];
    let usedProviders: boolean[] = [];
    async function providerSend(provider: Provider): Promise<R> {
      logger.debug(
        `[REQUEST]${
          provider instanceof HttpProvider ? ` ${provider.getUrl()}` : ""
        } ${JSONBigintUtil.stringify(request.body())}`
      );
      return provider
        .send<T, R>(request)
        .then((data) => {
          if (data instanceof PollingResponse) {
            logger.debug(
              `[RESPONSE] [CAN USE "poll"] ${JSON.stringify({
                jsonrpc: data.jsonrpc,
                id: data.id,
                code: data.code,
                message: data.message,
                namespace: data.namespace,
                result: data.result,
              })}`
            );
          } else {
            logger.debug(`[RESPONSE] ${JSONBigintUtil.stringify(data)}`);
          }
          return data;
        })
        .catch((e: Error) => {
          logger.debug(
            `[RESPONSE] ${provider instanceof HttpProvider ? ` ${provider.getUrl()}` : ""} ${
              e.message
            }`
          );
          // 尝试重连
          if (
            e.message.includes("connect ECONNREFUSED") ||
            e.message.includes("Failed to fetch")
            // e.message.includes("aborted a request") ||
            // e.message.includes("socket hang up")
          ) {
            const providerIndex = usedProviders.findIndex((isUsed) => !isUsed);
            if (providerIndex === -1) {
              throw e;
            }
            const provider = providers[providerIndex];
            usedProviders[providerIndex] = true;
            logger.debug(`try to use another node ${provider.getId()}`);
            return providerSend(provider);
          }
          throw e;
        });
    }
    if (request.useGrpc()) {
      providers = [];
      // providers = this.filterProviders(this.grpcProviders, nodeIds);
    } else {
      providers = this.filterProviders(this.httpProviders, nodeIds);
      usedProviders = new Array(providers.length).fill(false);
    }
    if (providers.length === 0) {
      throw new PropertyError("can't send request with empty providers");
    }
    // 随机分配一个节点发送
    const randomIndex = Math.floor(providers.length * Math.random());
    const provider = providers[randomIndex];
    usedProviders[randomIndex] = true;
    return providerSend(provider);
  }

  private async getGasPriceFromChain(): Promise<bigint> {
    const txService = ServiceManager.getTxService(this);
    const request = txService.getGasPrice();
    return request
      .send()
      .then((data) => data.result)
      .catch((error: Error) => {
        if (error instanceof RequestError) {
          logger.warn(error.getResponse()?.message);
          return BigInt(0);
        }
        throw error;
      });
  }

  private async getTxVersionFromChain(): Promise<TxVersion> {
    const txService = ServiceManager.getTxService(this);

    return Promise.all(
      this.httpProviders.map(async (provider: HttpProvider) => {
        const request = txService.getTxVersion(provider.getId());
        return request.send().then((response) => response.result);
      })
    )
      .then((txVersions: string[]) => {
        const txVersion0 = txVersions[0];
        const count = txVersions.reduce((count: number, curTxVersion: string) => {
          if (curTxVersion === txVersion0) {
            return count + 1;
          }
          return count;
        }, 0);
        // 所有节点的 txVersion 都相同
        if (count === txVersions.length) {
          return TxVersion.convertTxVersion(txVersion0);
        } else {
          logger.warn(
            "the TxVersion of nodes is different, the platform's TxVersion is " +
              TxVersion.GLOBAL_TX_VERSION.getVersion()
          );
          return TxVersion.GLOBAL_TX_VERSION;
        }
      })
      .catch((err) => {
        // if (!(err instanceof RequestError)) {
        //   throw err;
        // }
        // logger.error(JSON.stringify(err.getResponse()));
        logger.warn(
          "getting TxVersion failed, the platform's TxVersion is " +
            TxVersion.GLOBAL_TX_VERSION.getVersion()
        );
        return TxVersion.GLOBAL_TX_VERSION;
      });
  }

  private async getLocalChainIdFromChain(): Promise<string | undefined> {
    const didService = ServiceManager.getDidService(this);
    if (this.getTxVersion().isGreaterOrEqual(TxVersion.TxVersion26)) {
      const request = didService.getChainID();
      return request
        .send()
        .then((data) => data.result)
        .catch((error: Error) => {
          if (error instanceof RequestError) {
            logger.warn(error.getResponse()?.message);
            return undefined;
          }
          throw error;
        });
    }
  }

  private filterProviders(providers: Provider[], nodeIds: number[]): Provider[] {
    if (nodeIds.length === 0) {
      return providers;
    }
    return providers.filter((item) => nodeIds.includes(item.getId()));
  }

  public getGasPrice(): bigint {
    if (this.gasPrice == null) {
      throw new PropertyEmptyError("gasPrice");
    }
    return this.gasPrice;
  }

  public setGasPrice(gasPrice: bigint): void {
    this.gasPrice = gasPrice;
  }

  public getTxVersion(): TxVersion {
    if (this.txVersion == null) {
      throw new PropertyEmptyError("txVersion");
    }
    return this.txVersion;
  }

  public setTxVersion(txVersion: TxVersion): void {
    this.txVersion = txVersion;
  }

  public getChainId(): string | undefined {
    return this.chainId;
  }

  public setChainId(chainId: string): void {
    this.chainId = chainId;
  }

  private getHttpProviders(): HttpProvider[] {
    return this.httpProviders;
  }

  private setHttpProviders(httpProviders: HttpProvider[]): void {
    this.httpProviders = httpProviders;
  }

  public getNamespace(): string {
    return this.namespace;
  }

  public setNamespace(namespace: string): void {
    this.namespace = namespace;
  }
}
