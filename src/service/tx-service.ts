import { DidAccount } from "../account";
import { TxServiceType, PageResult, PlainObject, Receipt } from "../common";
import { ProviderManager } from "../provider";
import { PollingResponse, Request } from "../request";
import { Transaction } from "../transaction";

export default class TxService {
  private static readonly TX_PREFIX = "tx_";
  private providerManager: ProviderManager;

  constructor(providerManager: ProviderManager) {
    this.providerManager = providerManager;
  }

  public sendTx(
    transaction: Transaction,
    ...nodeIds: number[]
  ): Request<string | Receipt, PollingResponse> {
    const reqeust = new Request<string | Receipt, PollingResponse>(
      `${TxService.TX_PREFIX}sendTransaction`,
      this.providerManager,
      ...nodeIds
    ).enablePolling();
    reqeust.addParam(transaction.commonParam());
    return reqeust;
  }

  public grpcSendTxReturnReceipt(transaction: Transaction, ...nodeIds: number[]): Request<string> {
    const request = new Request<string>(
      `${TxService.TX_PREFIX}sendTransactionReturnReceipt`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(transaction.commonParam());
    return request;
  }

  public getGasPrice(...nodeIds: number[]): Request<bigint> {
    return new Request<bigint>(
      `${TxService.TX_PREFIX}getGasPrice`,
      this.providerManager,
      ...nodeIds
    );
  }

  public getTransactionReceipt(txHash: string, ...nodeIds: number[]): Request<Receipt> {
    const request = new Request<Receipt>(
      `${TxService.TX_PREFIX}getTransactionReceipt`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(txHash);
    return request;
  }

  public getTxsWithLimit(
    from: string,
    to: string,
    metaData?: TxServiceType.MetaData,
    ...nodeIds: number[]
  ): Request<PageResult<TxServiceType.Transaction>> {
    const request = new Request<PageResult<TxServiceType.Transaction>>(
      `${TxService.TX_PREFIX}getTransactionsWithLimit`,
      this.providerManager,
      ...nodeIds
    );
    let param: PlainObject = {
      from,
      to,
    };
    if (metaData != null) {
      param = {
        ...param,
        metadata: metaData,
      };
    }
    request.addParam(param);
    return request;
  }

  public getInvalidTxsWithLimit(
    from: bigint | string,
    to: bigint | string,
    metaData?: TxServiceType.MetaData,
    ...nodeIds: number[]
  ): Request<PageResult<TxServiceType.Transaction>> {
    const request = new Request<PageResult<TxServiceType.Transaction>>(
      `${TxService.TX_PREFIX}getInvalidTransactionsWithLimit`,
      this.providerManager,
      ...nodeIds
    );
    let param: PlainObject = {
      from: from.toString(),
      to: to.toString(),
    };
    if (metaData != null) {
      param = {
        ...param,
        metadata: metaData,
      };
    }
    request.addParam(param);
    return request;
  }

  public getTxByHash(txHash: string, ...nodeIds: number[]): Request<TxServiceType.Transaction> {
    const request = new Request<TxServiceType.Transaction>(
      `${TxService.TX_PREFIX}getTransactionByHash`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(txHash);
    return request;
  }

  public getTxByBlockHashAndIndex(
    blockHash: string,
    idx: number,
    ...nodeIds: number[]
  ): Request<TxServiceType.Transaction> {
    const request = new Request<TxServiceType.Transaction>(
      `${TxService.TX_PREFIX}getTransactionByBlockHashAndIndex`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(blockHash);
    request.addParam(idx);
    return request;
  }

  public getTxByBlockNumAndIndex(
    blockNumber: number | string,
    idx: number | string,
    ...nodeIds: number[]
  ): Request<TxServiceType.Transaction> {
    const request = new Request<TxServiceType.Transaction>(
      `${TxService.TX_PREFIX}getTransactionByBlockNumberAndIndex`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(blockNumber);
    request.addParam(idx);
    return request;
  }

  public getTxAvgTimeByBlockNumber(
    from: bigint | string,
    to: bigint | string,
    ...nodeIds: number[]
  ): Request<string> {
    const request = new Request<string>(
      `${TxService.TX_PREFIX}getTxAvgTimeByBlockNumber`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam({
      from: from.toString(),
      to: to.toString(),
    });
    return request;
  }

  public getTransactionsCount(...nodeIds: number[]): Request<{ count: string; timestamp: number }> {
    const request = new Request<{ count: string; timestamp: number }>(
      `${TxService.TX_PREFIX}getTransactionsCount`,
      this.providerManager,
      ...nodeIds
    );
    return request;
  }

  public getInvalidTransactionsCount(
    ...nodeIds: number[]
  ): Request<{ count: string; timestamp: number }> {
    const request = new Request<{ count: string; timestamp: number }>(
      `${TxService.TX_PREFIX}getInvalidTransactionsCount`,
      this.providerManager,
      ...nodeIds
    );
    return request;
  }

  public getConfirmedTransactionReceipt(txHash: string, ...nodeIds: number[]): Request<Receipt> {
    const request = new Request<Receipt>(
      `${TxService.TX_PREFIX}getConfirmedTransactionReceipt`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(txHash);
    return request;
  }

  public getTransactionReceiptWithGas(txHash: string, ...nodeIds: number[]): Request<Receipt> {
    const request = new Request<Receipt>(
      `${TxService.TX_PREFIX}getTransactionReceiptWithGas`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(txHash);
    return request;
  }

  public getBlockTxCountByHash(blockHash: string, ...nodeIds: number[]): Request<string> {
    const request = new Request<string>(
      `${TxService.TX_PREFIX}getBlockTransactionCountByHash`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(blockHash);
    return request;
  }

  public getBlockTxCountByNumber(blockNumber: string, ...nodeIds: number[]): Request<string> {
    const request = new Request<string>(
      `${TxService.TX_PREFIX}getBlockTransactionCountByNumber`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(blockNumber);
    return request;
  }

  public getInvalidTxsByBlockHash(
    blockHash: string,
    ...nodeIds: number[]
  ): Request<TxServiceType.Transaction[]> {
    const request = new Request<TxServiceType.Transaction[]>(
      `${TxService.TX_PREFIX}getInvalidTransactionsByBlockHash`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(blockHash);
    return request;
  }

  public getInvalidTxsByBlockNumber(
    blockNumber: string | bigint,
    ...nodeIds: number[]
  ): Request<TxServiceType.Transaction[]> {
    const request = new Request<TxServiceType.Transaction[]>(
      `${TxService.TX_PREFIX}getInvalidTransactionsByBlockNumber`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(blockNumber.toString());
    return request;
  }

  public getTxVersion(...nodeIds: number[]): Request<string> {
    return new Request<string>(
      `${TxService.TX_PREFIX}getTransactionsVersion`,
      this.providerManager,
      ...nodeIds
    );
  }

  public getTransactionsByTimeWithLimit(
    startTime: string | bigint,
    endTime: string | bigint,
    metaData?: TxServiceType.MetaData,
    ...nodeIds: number[]
  ): Request<PageResult<TxServiceType.Transaction>> {
    if (typeof startTime === "string") {
      startTime = BigInt(startTime);
    }
    if (typeof endTime === "string") {
      endTime = BigInt(endTime);
    }
    const request = new Request<PageResult<TxServiceType.Transaction>>(
      `${TxService.TX_PREFIX}getTransactionsByTimeWithLimit`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam({
      startTime,
      endTime,
      metaData,
    });
    return request;
  }

  public getTransactionsCountByContractAddr(
    from: string | bigint,
    to: string | bigint,
    contractAddress: string,
    txExtra: boolean,
    ...nodeIds: number[]
  ): Request<TxServiceType.TxCount> {
    const request = new Request<TxServiceType.TxCount>(
      `${TxService.TX_PREFIX}getTransactionsCountByContractAddr`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam({
      from: from.toString(),
      to: to.toString(),
      address: DidAccount.convertDIDAddrToHex(contractAddress),
      txExtra,
    });
    return request;
  }

  public getNextPageTransactions(
    blkNumber: string | bigint,
    txIndex: string | bigint,
    minBlkNumber: string | bigint,
    maxBlkNumber: string | bigint,
    separated: string | bigint,
    pageSize: string | bigint,
    containCurrent: boolean,
    address?: string,
    cName?: string,
    ...nodeIds: number[]
  ): Request<TxServiceType.Transaction[]> {
    const request = new Request<TxServiceType.Transaction[]>(
      `${TxService.TX_PREFIX}getNextPageTransactions`,
      this.providerManager,
      ...nodeIds
    );
    let param: any = {
      blkNumber: blkNumber.toString(),
      txIndex: txIndex.toString(),
      minBlkNumber: minBlkNumber.toString(),
      maxBlkNumber: maxBlkNumber.toString(),
      separated: separated.toString(),
      pageSize: pageSize.toString(),
      containCurrent,
    };
    if (address != null) {
      param = {
        ...param,
        address: DidAccount.convertDIDAddrToHex(address),
      };
    }
    if (cName != null) {
      param = {
        ...param,
        cName,
      };
    }
    request.addParam(param);
    return request;
  }

  public getNextPageInvalidTransactions(
    blkNumber: string | bigint,
    txIndex: string | bigint,
    minBlkNumber: string | bigint,
    maxBlkNumber: string | bigint,
    separated: string | bigint,
    pageSize: string | bigint,
    containCurrent: boolean,
    address?: string,
    cName?: string,
    ...nodeIds: number[]
  ): Request<TxServiceType.Transaction[]> {
    const request = new Request<TxServiceType.Transaction[]>(
      `${TxService.TX_PREFIX}getNextPageInvalidTransactions`,
      this.providerManager,
      ...nodeIds
    );
    let param: any = {
      blkNumber: blkNumber.toString(),
      txIndex: txIndex.toString(),
      minBlkNumber: minBlkNumber.toString(),
      maxBlkNumber: maxBlkNumber.toString(),
      separated: separated.toString(),
      pageSize: pageSize.toString(),
      containCurrent,
    };
    if (address != null) {
      param = {
        ...param,
        address: DidAccount.convertDIDAddrToHex(address),
      };
    }
    if (cName != null) {
      param = {
        ...param,
        cName,
      };
    }
    request.addParam(param);
    return request;
  }

  public getPrevPageTransactions(
    blkNumber: string,
    txIndex: string,
    minBlkNumber: string,
    maxBlkNumber: string,
    separated: string,
    pageSize: string,
    containCurrent: boolean,
    address?: string,
    cName?: string,
    ...nodeIds: number[]
  ): Request<TxServiceType.Transaction[]> {
    const request = new Request<TxServiceType.Transaction[]>(
      `${TxService.TX_PREFIX}getPrevPageTransactions`,
      this.providerManager,
      ...nodeIds
    );
    let param: any = {
      blkNumber,
      txIndex,
      minBlkNumber,
      maxBlkNumber,
      separated,
      pageSize,
      containCurrent,
    };
    if (address != null) {
      param = {
        ...param,
        address: DidAccount.convertDIDAddrToHex(address),
      };
    }
    if (cName != null) {
      param = {
        ...param,
        cName,
      };
    }
    request.addParam(param);
    return request;
  }

  public getTxsCountByTime(
    startTime: bigint,
    endTime: bigint,
    ...nodeIds: number[]
  ): Request<string> {
    const request = new Request<string>(
      `${TxService.TX_PREFIX}getTransactionsCountByTime`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam({
      startTime,
      endTime,
    });
    return request;
  }

  public getInvalidTxsCountByTime(
    startTime: bigint,
    endTime: bigint,
    ...nodeIds: number[]
  ): Request<string> {
    const request = new Request<string>(
      `${TxService.TX_PREFIX}getInvalidTransactionsCountByTime`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam({
      startTime,
      endTime,
    });
    return request;
  }

  public getTxsByExtraID(
    mode: number,
    detail: boolean,
    metaData: TxServiceType.MetaData,
    filter: TxServiceType.Filter,
    ...nodeIds: number[]
  ): Request<PageResult<TxServiceType.Transaction>> {
    const request = new Request<PageResult<TxServiceType.Transaction>>(
      `${TxService.TX_PREFIX}getTransactionsByExtraID`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam({
      mode,
      detail,
      metaData,
      filter,
    });
    return request;
  }

  public getTxsByFilter(
    mode: number,
    detail: boolean,
    metaData: TxServiceType.MetaData,
    filter: TxServiceType.Filter,
    ...nodeIds: number[]
  ): Request<PageResult<TxServiceType.Transaction>> {
    const request = new Request<PageResult<TxServiceType.Transaction>>(
      `${TxService.TX_PREFIX}getTransactionsByFilter`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam({
      mode,
      detail,
      metaData,
      filter,
    });
    return request;
  }

  public getTransactionReceiptWithSignature(
    txHash: string,
    ...nodeIds: number[]
  ): Request<{
    hostname: string;
    signature: string;
    result: Receipt;
  }> {
    const request = new Request<{
      hostname: string;
      signature: string;
      result: Receipt;
    }>(
      `${TxService.TX_PREFIX}getTransactionReceiptWithSignature`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(txHash);
    return request;
  }
}
