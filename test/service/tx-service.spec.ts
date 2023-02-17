// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Algo, logger, Transaction } from "../../src";
import { init, invokeEvmContract } from "../common";

describe("TxService.getTxByHash", () => {
  test("normal test", async () => {
    const { txService } = await init();
    const { deployResult } = await invokeEvmContract();
    const txHash = deployResult.result.txHash;
    const request = txService.getTxByHash(txHash);
    const response = await request.send();
    console.log(response.result);
  });

  test("is not private tx", async () => {
    const { txService } = await init();
    const { deployResult } = await invokeEvmContract();
    const txHash = deployResult.result.txHash;
    const request = txService.getTxByHash(txHash);
    const response = await request.send();
    console.log(response.result);
  });
});

describe("TxService.getTxByBlockHashAndIndex", () => {
  test("normal test", async () => {
    const { txService } = await init();
    const { deployResult } = await invokeEvmContract();
    const txHash = deployResult.result.txHash;
    const {
      result: { blockHash },
    } = await txService.getTxByHash(txHash).send();
    const index = 0;

    const request = txService.getTxByBlockHashAndIndex(blockHash, index);
    const response = await request.send();
    console.log(response.result);
  });
});

describe("TxService.getTxByBlockNumAndIndex", () => {
  test("normal test", async () => {
    const { txService } = await init();
    const blockHash = 1;
    const index = 0;

    const request = txService.getTxByBlockNumAndIndex(blockHash, index);
    const response = await request.send();
    console.log(response.result);
  });
});

describe("TxService.getTxAvgTimeByBlockNumber", () => {
  test("from and to are string", async () => {
    const { txService } = await init();
    const from = "1";
    const to = "2";
    const request = txService.getTxAvgTimeByBlockNumber(from, to);
    const response = await request.send();
    console.log(response.result);
  });
  test("from and to are bigint", async () => {
    const { txService } = await init();
    const from = 1n;
    const to = 2n;
    const request = txService.getTxAvgTimeByBlockNumber(from, to);
    const response = await request.send();
    console.log(response.result);
  });
});

describe("TxService.getTransactionsCount", () => {
  test("normal test", async () => {
    const { txService } = await init();
    const request = txService.getTransactionsCount();
    const response = await request.send();
    console.log(response.result);
  });
});

describe("TxService.getInvalidTransactionsCount", () => {
  test("normal test", async () => {
    const { txService } = await init();
    const request = txService.getInvalidTransactionsCount();
    const response = await request.send();
    console.log(response.result);
  });
});

// describe("TxService.getConfirmedTransactionReceipt", () => {
//   test("normal test", async () => {
//     const { txService } = await init();
//     const { deployResult } = await invokeEvmContract();
//     const request = txService.getConfirmedTransactionReceipt(deployResult.result.txHash);
//     const response = await request.send();
//     console.log(response.result);
//   });
// });

// describe("TxService.getTransactionReceiptWithGas", () => {
//   test("normal test", async () => {
//     const { txService } = await init();
//     const { deployResult } = await invokeEvmContract();
//     const request = txService.getTransactionReceiptWithGas(deployResult.result.txHash);
//     const response = await request.send();
//     console.log(response.result);
//   });
// });

describe("TxService.getBlockTxCountByHash", () => {
  test("normal test", async () => {
    const { txService } = await init();
    const { deployResult } = await invokeEvmContract();
    const txHash = deployResult.result.txHash;
    const {
      result: { blockHash },
    } = await txService.getTxByHash(txHash).send();

    const request = txService.getBlockTxCountByHash(blockHash);
    const response = await request.send();
    console.log(response.result);
  });
});

describe("TxService.getBlockTxCountByNumber", () => {
  test("normal test", async () => {
    const { txService } = await init();
    const request = txService.getBlockTxCountByNumber("1");
    const response = await request.send();
    console.log(response.result);
  });
});

describe("TxService.getInvalidTxsByBlockHash", () => {
  test("normal test", async () => {
    const { txService } = await init();
    const { deployResult } = await invokeEvmContract();
    const txHash = deployResult.result.txHash;
    const {
      result: { blockHash },
    } = await txService.getTxByHash(txHash).send();
    const request = txService.getInvalidTxsByBlockHash(blockHash);
    const response = await request.send();
    console.log(response.result);
  });
});

describe("TxService.getInvalidTxsByBlockNumber", () => {
  test("normal test", async () => {
    const { txService } = await init();
    const request = txService.getInvalidTxsByBlockNumber("1");
    const response = await request.send();
    console.log(response.result);
  });
});

describe("TxService.getTxVersion", () => {
  test("normal test", async () => {
    const { txService } = await init();
    const request = txService.getTxVersion();
    const response = await request.send();
    console.log(response.result);
  });
});

describe("TxService.getTransactionsByTimeWithLimit", () => {
  test("normal test", async () => {
    const { txService } = await init();
    const startTime = 1562073987434588840n;
    const endTime = "1581326082434588900";
    const meta = {
      pageSize: 100,
      bookmark: {
        blkNum: 1,
        txIndex: 0,
      },
      backward: true,
    };
    const request = txService.getTransactionsByTimeWithLimit(startTime, endTime, meta);
    const response = await request.send();
    console.log(response.result);
  });
});

describe("TxService.getNextPageInvalidTransactions", () => {
  test("normal test", async () => {
    const { txService } = await init();
    const request = txService.getNextPageInvalidTransactions("1", "1", "1", "5", "0", "10", true);
    const response = await request.send();
    console.log(response.result);
  });
});

describe("TxService.getTransactionReceiptWithSignature", () => {
  test("normal test", async () => {
    const { txService, accountService, providerManager } = await init();
    const account = accountService.genAccount(Algo.ECRAW);
    const transaction = new Transaction.Builder(account.getAddress(), providerManager)
      .transfer("794BF01AB3D37DF2D1EA1AA4E6F4A0E988F4DEA5", 0)
      .build();
    transaction.sign(account);
    const request = txService.sendTx(transaction);
    const response = await (await request.send()).poll();

    const request1 = txService.getTransactionReceiptWithSignature(response.result.txHash);
    const response1 = await request1.send();
    logger.info(response1.result);
  });
});

describe("TxService.getTransactionsCountByContractAddr", () => {
  test("normal test", async () => {
    const { txService, accountService, providerManager } = await init();
    const account = accountService.genAccount(Algo.ECRAW);
    const transaction = new Transaction.Builder(account.getAddress(), providerManager)
      .transfer("794BF01AB3D37DF2D1EA1AA4E6F4A0E988F4DEA5", 0)
      .build();
    transaction.sign(account);
    const request = txService.sendTx(transaction);
    const response = await (await request.send()).poll();

    const request1 = txService.getTransactionsCountByContractAddr(
      1n,
      2n,
      response.result.contractAddress,
      true
    );
    const response1 = await request1.send();
    logger.info(response1.result);
  });
});

describe("TxService.getTxsCountByTime", () => {
  test("normal test", async () => {
    const { txService } = await init();
    const request = txService.getTxsCountByTime(1559193987434588840n, 1676537396925000000n);
    const response = await request.send();
    logger.info(response.result);
  });
});

describe("TxService.getInvalidTxsCountByTime", () => {
  test("normal test", async () => {
    const { txService } = await init();
    const request = txService.getInvalidTxsCountByTime(1559193987434588840n, 1676537396925000000n);
    const response = await request.send();
    logger.info(response.result);
  });
});

describe("TxService.getPrevPageTransactions", () => {
  test("normal test", async () => {
    const { txService } = await init();
    // 最好 txIndex = 0，否则很容易越界，引起以下报错：
    // Error: RequestError: Internal server error: it has caught a run-time panic, please check node log
    const request = txService.getPrevPageTransactions("1", "0", "1", "5", "0", "10", true);
    const response = await request.send();
    logger.info(response.result);
  });
});

// describe("TxService.getTxsByExtraID", () => {
//   test("normal test", async () => {
//     const { txService, accountService, providerManager } = await init();
//     const account = accountService.genAccount(Algo.ECRAW);
//     const transaction = new Transaction.Builder(account.getAddress(), providerManager)
//       .transfer("794BF01AB3D37DF2D1EA1AA4E6F4A0E988F4DEA5", 0)
//       .build();
//     transaction.sign(account);
//     const request = txService.sendTx(transaction);
//     const response = await (await request.send()).poll();

//     const request1 = txService.getTxsByExtraID(
//       0,
//       false,
//       { backward: false, bookmark: { blkNum: 1, txIndex: 1 }, pageSize: 1 },
//       {
//         txHash: response.result.txHash,
//         blkNumber: 0n,
//         txIndex: 0n,
//         txFrom: account.getAddress(),
//         txTo: account.getAddress(),
//         txName: "",
//         extraId: [],
//       }
//     );
//     const response1 = await request1.send();
//     logger.info(response1.result);
//   });
// });
