import { PollingResponse, Request } from "../request";
import { ProviderManager } from "../provider";
import { Transaction, TxVersion } from "../transaction";
import { Receipt } from "../common";

export default class SqlService {
  private readonly providerManager: ProviderManager;

  private static readonly CONTRACT_PREFIX = "contract_";
  private static readonly SIMULATE_PREFIX = "simulate_";

  constructor(providerManager: ProviderManager) {
    this.providerManager = providerManager;
  }

  public invoke(
    transaction: Transaction,
    ...nodeIds: number[]
  ): Request<string | Receipt, PollingResponse> {
    const request = new Request<string | Receipt, PollingResponse>(
      this.methodName("invokeContract", transaction),
      this.providerManager,
      ...nodeIds
    ).enablePolling();
    request.addParam(transaction.commonParam());
    return request;
  }

  public maintain(
    transaction: Transaction,
    ...nodeIds: number[]
  ): Request<string | Receipt, PollingResponse> {
    const request = new Request<string | Receipt, PollingResponse>(
      this.methodName("maintainContract", transaction),
      this.providerManager,
      ...nodeIds
    ).enablePolling();
    request.addParam(transaction.commonParam());
    return request;
  }

  public create(
    transaction: Transaction,
    ...nodeIds: number[]
  ): Request<string | Receipt, PollingResponse> {
    const request = new Request<string | Receipt, PollingResponse>(
      this.methodName("deployContract", transaction),
      this.providerManager,
      ...nodeIds
    ).enablePolling();
    const param = transaction.commonParam();
    delete param.to;
    request.addParam(param);
    return request;
  }

  private methodName(method: string, transaction: Transaction): string {
    const txVersion = transaction.getTxVersion();
    if (txVersion != null && transaction.isSimulate() && !txVersion.equal(TxVersion.TxVersion10)) {
      return `${SqlService.SIMULATE_PREFIX}${method}`;
    }
    return `${SqlService.CONTRACT_PREFIX}${method}`;
  }
}
