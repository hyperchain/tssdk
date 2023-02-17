import { Transaction } from "../../src";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { init } from "../common";
import { RequestError } from "../../src";

describe("SqlService.maintain", () => {
  test("normal test", async () => {
    const { providerManager, sqlService, account } = await init();

    let databaseAddr: string;
    // create
    {
      const transaction = new Transaction.SqlBuilder(account.getAddress(), providerManager)
        .create()
        .build();
      transaction.sign(account);
      const response = await sqlService.create(transaction).send();
      const result = await response.poll();
      expect(result.code).toBe(0);
      databaseAddr = result.result.contractAddress;
    }

    // freeze
    {
      const transaction = new Transaction.SqlBuilder(account.getAddress(), providerManager)
        .freeze(databaseAddr)
        .build();
      transaction.sign(account);
      const response = await sqlService.maintain(transaction).send();
      const result = await response.poll();
      expect(result.code).toBe(0);
    }

    {
      const transaction = new Transaction.SqlBuilder(account.getAddress(), providerManager)
        .invoke(databaseAddr, "test")
        .build();
      transaction.sign(account);

      try {
        const response = await sqlService.invoke(transaction).send();
      } catch (e) {
        if (e instanceof RequestError) {
          expect(e.getCode()).toBe(-32022);
          return;
        }
        throw e;
      }
    }

    {
      const transaction = new Transaction.SqlBuilder(account.getAddress(), providerManager)
        .unfreeze(databaseAddr)
        .build();
      transaction.sign(account);

      const response = await sqlService.maintain(transaction).send();
      const result = await response.poll();
      expect(result.code).toBe(0);
    }

    {
      const transaction = new Transaction.SqlBuilder(account.getAddress(), providerManager)
        .destroy(databaseAddr)
        .build();
      transaction.sign(account);

      const response = await sqlService.maintain(transaction).send();
      const result = await response.poll();
      expect(result.code).toBe(0);
    }
  });
});

describe("SqlService.invoke", () => {
  test("normal test", async () => {
    const { providerManager, sqlService, account } = await init();

    let databaseAddr: string;
    // create
    {
      const transaction = new Transaction.SqlBuilder(account.getAddress(), providerManager)
        .create()
        .build();
      transaction.sign(account);
      const response = await sqlService.create(transaction).send();
      const result = await response.poll();
      expect(result.code).toBe(0);
      databaseAddr = result.result.contractAddress;
    }

    {
      const sql =
        "CREATE TABLE IF NOT EXISTS testTable (id bigint(20) NOT NULL, name varchar(32) NOT NULL, exp bigint(20), money double(16,2) NOT NULL DEFAULT '99', primary key (id), unique key name (name));";
      const transaction = new Transaction.SqlBuilder(account.getAddress(), providerManager)
        .invoke(databaseAddr, sql)
        .build();
      transaction.sign(account);
      const response = await sqlService.invoke(transaction).send();
      const result = await response.poll();
      expect(result.code).toBe(0);
    }
  });

  test("simulate invoke", async () => {
    const { providerManager, sqlService, account } = await init();

    let databaseAddr: string;
    // create
    {
      const transaction = new Transaction.SqlBuilder(account.getAddress(), providerManager)
        .create()
        .build();
      transaction.sign(account);
      const response = await sqlService.create(transaction).send();
      const result = await response.poll();
      expect(result.code).toBe(0);
      databaseAddr = result.result.contractAddress;
    }

    {
      const sql =
        "CREATE TABLE IF NOT EXISTS testTable (id bigint(20) NOT NULL, name varchar(32) NOT NULL, exp bigint(20), money double(16,2) NOT NULL DEFAULT '99', primary key (id), unique key name (name));";
      const transaction = new Transaction.SqlBuilder(account.getAddress(), providerManager)
        .invoke(databaseAddr, sql)
        .build();
      transaction.setSimulate(true);
      transaction.sign(account);
      const response = await sqlService.invoke(transaction).send();
      const result = await response.poll();
      expect(result.code).toBe(0);
    }
  });
});
