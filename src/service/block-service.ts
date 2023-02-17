import { BlockServiceType, PageResult } from "../common";
import { ProviderManager } from "../provider";
import { Request } from "../request";

export default class BlockService {
  private providerManager: ProviderManager;
  private static readonly BLOCK_PREFIX = "block_";

  constructor(providerManager: ProviderManager) {
    this.providerManager = providerManager;
  }

  public getLatestBlock(...nodeIds: number[]): Request<BlockServiceType.Block> {
    const request = new Request<BlockServiceType.Block>(
      `${BlockService.BLOCK_PREFIX}latestBlock`,
      this.providerManager,
      ...nodeIds
    );
    return request;
  }

  public getBlocksWithLimit(
    from: string,
    to: string,
    isPlain: boolean,
    ...nodeIds: number[]
  ): Request<PageResult<BlockServiceType.Block>> {
    const request = new Request<PageResult<BlockServiceType.Block>>(
      `${BlockService.BLOCK_PREFIX}getBlocksWithLimit`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam({
      from,
      to,
      isPlain,
    });
    return request;
  }

  public getBlockByHash(
    blockHash: string,
    isPlain = false,
    ...nodeIds: number[]
  ): Request<BlockServiceType.Block> {
    const request = new Request<BlockServiceType.Block>(
      `${BlockService.BLOCK_PREFIX}getBlockByHash`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(blockHash);
    request.addParam(isPlain);
    return request;
  }

  public getBlockByNum(
    blockNumber: bigint | string,
    isPlain = false,
    ...nodeIds: number[]
  ): Request<BlockServiceType.Block> {
    const request = new Request<BlockServiceType.Block>(
      `${BlockService.BLOCK_PREFIX}getBlockByNumber`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(blockNumber.toString());
    request.addParam(isPlain);
    return request;
  }

  public getAvgGenerateTimeByBlockNumber(
    from: bigint,
    to: bigint,
    ...nodeIds: number[]
  ): Request<string>;
  public getAvgGenerateTimeByBlockNumber(
    from: string,
    to: string,
    ...nodeIds: number[]
  ): Request<string>;
  public getAvgGenerateTimeByBlockNumber(
    from: bigint | string,
    to: bigint | string,
    ...nodeIds: number[]
  ): Request<string> {
    const request = new Request<string>(
      `${BlockService.BLOCK_PREFIX}getAvgGenerateTimeByBlockNumber`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam({
      from,
      to,
    });
    return request;
  }
  public getBlocksByTime(
    startTime: bigint,
    endTime: bigint,
    ...nodeIds: number[]
  ): Request<{ sumOfBlocks: string; startBlock: string; endBlock: string }>;
  public getBlocksByTime(
    startTime: string,
    endTime: string,
    ...nodeIds: number[]
  ): Request<{ sumOfBlocks: string; startBlock: string; endBlock: string }>;
  public getBlocksByTime(
    startTime: bigint | string,
    endTime: bigint | string,
    ...nodeIds: number[]
  ): Request<{ sumOfBlocks: string; startBlock: string; endBlock: string }> {
    const request = new Request<{
      sumOfBlocks: string;
      startBlock: string;
      endBlock: string;
    }>(`${BlockService.BLOCK_PREFIX}getBlocksByTime`, this.providerManager, ...nodeIds);
    request.addParam({
      startTime,
      endTime,
    });
    return request;
  }

  public getChainHeight(...nodeIds: number[]): Request<string> {
    const request = new Request<string>(
      `${BlockService.BLOCK_PREFIX}getChainHeight`,
      this.providerManager,
      ...nodeIds
    );
    return request;
  }

  public getGenesisBlock(...nodeIds: number[]): Request<string> {
    const request = new Request<string>(
      `${BlockService.BLOCK_PREFIX}getGenesisBlock`,
      this.providerManager,
      ...nodeIds
    );
    return request;
  }
}
