import { DidAccount } from "../account";
import { ContractServiceType, Receipt } from "../common";
import { ProviderManager } from "../provider";
import { PollingResponse, Request } from "../request";
import { Transaction, TxVersion } from "../transaction";

export default class ContractService {
  private providerManager: ProviderManager;

  public static readonly CONTRACT_PREFIX = "contract_";
  public static readonly SIMULATE_PREFIX = "simulate_";

  constructor(providerManager: ProviderManager) {
    this.providerManager = providerManager;
  }

  private methodName(method: string, transaction: Transaction): string {
    const txVersion = transaction.getTxVersion();
    if (txVersion != null && transaction.isSimulate() && !txVersion.equal(TxVersion.TxVersion10)) {
      return `${ContractService.SIMULATE_PREFIX}${method}`;
    }
    return `${ContractService.CONTRACT_PREFIX}${method}`;
  }

  // 部署合约
  public deploy(
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

  // 调用合约
  public invoke(
    transaction: Transaction,
    ...nodeIds: number[]
  ): Request<string | Receipt, PollingResponse> {
    const request = new Request<string | Receipt, PollingResponse>(
      this.methodName("invokeContract", transaction),
      this.providerManager,
      ...nodeIds
    ).enablePolling();

    const param = transaction.commonParam();
    request.addParam(param);

    return request;
  }

  // 管理合约，包括升级、冻结、解冻
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

  // ---------------- 查询合约信息 ----------------

  public manageContractByVote(transaction: Transaction, ...nodeIds: number[]): Request<string> {
    const request = new Request<string>(
      this.methodName("manageContractByVote", transaction),
      this.providerManager,
      ...nodeIds
    );
    request.addParam(transaction.commonParam());
    return request;
  }

  public getDeployedList(address: string, ...nodeIds: number[]): Request<string[]> {
    const request = new Request<string[]>(
      `${ContractService.CONTRACT_PREFIX}getDeployedList`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(DidAccount.convertDIDAddrToHex(address));
    return request;
  }

  // 编译Solidity合约
  public compileContract(
    code: string,
    ...nodeIds: number[]
  ): Request<ContractServiceType.CompileCode> {
    const request = new Request<ContractServiceType.CompileCode>(
      `${ContractService.CONTRACT_PREFIX}compileContract`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(code);
    return request;
  }

  // 获取合约源码
  public getCode(address: string, ...nodeIds: number[]): Request<string> {
    const request = new Request<string>(
      `${ContractService.CONTRACT_PREFIX}getCode`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(address);
    return request;
  }

  // 获取账户部署的合约数量
  public getContractCountByAddr(address: string, ...nodeIds: number[]): Request<string> {
    const request = new Request<string>(
      `${ContractService.CONTRACT_PREFIX}getContractCountByAddr`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(DidAccount.convertDIDAddrToHex(address));
    return request;
  }

  public getStatus(address: string, ...nodeIds: number[]): Request<string> {
    const request = new Request<string>(
      `${ContractService.CONTRACT_PREFIX}getStatus`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(address);
    return request;
  }

  public getCreateTime(address: string, ...nodeIds: number[]): Request<string> {
    const request = new Request<string>(
      `${ContractService.CONTRACT_PREFIX}getCreateTime`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(address);
    return request;
  }

  public getCreator(address: string, ...nodeIds: number[]): Request<string> {
    const request = new Request<string>(
      `${ContractService.CONTRACT_PREFIX}getCreator`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(address);
    return request;
  }

  public getStatusByCName(cname: string, ...nodeIds: number[]): Request<string> {
    const request = new Request<string>(
      `${ContractService.CONTRACT_PREFIX}getStatusByCName`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(cname);
    return request;
  }

  public getCreatorByCName(cname: string, ...nodeIds: number[]): Request<string> {
    const request = new Request<string>(
      `${ContractService.CONTRACT_PREFIX}getCreatorByCName`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(cname);
    return request;
  }

  public getCreateTimeByCName(cname: string, ...nodeIds: number[]): Request<string> {
    const request = new Request<string>(
      `${ContractService.CONTRACT_PREFIX}getCreateTimeByCName`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(cname);
    return request;
  }

  // public grpcDeployReturnReceipt(transaction: Transaction, ...nodeIds: number[]): Request<Receipt> {
  //   const request = new Request<Receipt>(
  //     this.methodName("deployContractReturnReceipt", transaction),
  //     this.providerManager,
  //     ...nodeIds
  //   );
  //
  //   const param = transaction.commonParam();
  //   delete param.to;
  //   request.addParam(param);
  //
  //   return request;
  // }

  public getReceipt(txHash: string, ...nodeIds: number[]): Request<string | Receipt> {
    const request = new Request<string | Receipt, PollingResponse>(
      "tx_getTransactionReceipt",
      this.providerManager,
      ...nodeIds
    );

    request.addParam(txHash);

    return request;
  }
}
