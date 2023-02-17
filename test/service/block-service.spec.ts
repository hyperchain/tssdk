// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { init, invokeEvmContract, invokeHvmContract } from "../common";
import { logger, JSONBigintUtil } from "../../src/common";

describe("BlockService.getLatestBlock", () => {
  test("normal test", async () => {
    const { blockService } = await init();
    const request = await blockService.getLatestBlock();
    const response = await request.send();
    logger.debug(JSONBigintUtil.stringify(response.result));
  });
});

// describe("ContractService.getBlocks", () => {
//   test("normal test", async () => {
//     const { blockService } = await init();
//     const request = await blockService.getBlocks(1n, 2n);
//     const response = await request.send();
//     console.log(response.result);
//   });
// });

describe("BlockService.getBlockByHash", () => {
  test("normal test", async () => {
    const { blockService } = await init();
    const { deployHvmBlockHash } = await invokeHvmContract();
    const request = await blockService.getBlockByHash(deployHvmBlockHash);
    const response = await request.send();
    console.log(response.result);
  });
});

describe("BlockService.getBlockByNum", () => {
  test("normal test", async () => {
    const { blockService } = await init();
    const request = await blockService.getBlockByNum(1n);
    const response = await request.send();
    console.log(response.result);
  });
});

describe("BlockService.getAvgGenerateTimeByBlockNumber", () => {
  test("normal test", async () => {
    const { blockService } = await init();
    const request = await blockService.getAvgGenerateTimeByBlockNumber(1n, 2n);
    const response = await request.send();
    console.log(response.result);
  });
});

// describe("ContractService.getBlocksByTime", () => {
//   test("normal test", async () => {
//     const { blockService } = await init();
//     const request = await blockService.getBlocksByTime(1559193987434588000n, 1559193987434588900n);
//     const response = await request.send();
//     console.log(response.result);
//   });
// });

describe("BlockService.getChainHeight", () => {
  test("normal test", async () => {
    const { blockService } = await init();
    const request = await blockService.getChainHeight();
    const response = await request.send();
    console.log(response.result);
  });
});

describe("BlockService.getGenesisBlock", () => {
  test("normal test", async () => {
    const { blockService } = await init();
    const request = await blockService.getGenesisBlock();
    const response = await request.send();
    console.log(response.result);
  });
});

describe("BlockService.getBlocksWithLimit", () => {
  test("normal test", async () => {
    const { blockService } = await init();
    const request = await blockService.getBlocksWithLimit("1", "2", true);
    const response = await request.send();
    console.log(response.result);
  });
});
