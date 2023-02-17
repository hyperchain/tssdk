import { Algo, Transaction } from "../../src";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { init, registerDidAccount } from "../common";
import fs from "fs";
import path from "path";

describe("didAccount verify and sign", () => {
  test("sm2", async () => {
    const { accountService } = await init();
    const didAccount = accountService.genDidAccount(Algo.SMRAW, "t1");
    const msg = "helloworld";
    const signature = didAccount.sign(msg);
    const verifiedResult = didAccount.verify(msg, signature);
    expect(verifiedResult).toBeTruthy();
  });

  test("ec", async () => {
    const { accountService } = await init();
    const didAccount = accountService.genDidAccount(Algo.ECRAW, "t2");
    const msg = "helloworld";
    const signature = didAccount.sign(msg);
    const verifiedResult = didAccount.verify(msg, signature);
    expect(verifiedResult).toBeTruthy();
  });
});

describe("didAccount send transaction", () => {
  test("normal transfer", async () => {
    const { providerManager, txService } = await init();
    const account = await registerDidAccount([]);
    const account1 = await registerDidAccount([]);

    const transaction = new Transaction.Builder(account.getAddress(), providerManager)
      .transfer(account1.getAddress(), 0)
      .build();
    transaction.sign(account);
    const response = await txService.sendTx(transaction).send();
    const result = await response.poll();
    expect(result.code).toBe(0);
  });
  test("hvm deploy", async () => {
    const { providerManager, contractService } = await init();
    const account = await registerDidAccount([], Algo.ECRAW);
    const file: Buffer = fs.readFileSync(
      path.resolve(__dirname, "../resource/hvm-jar/credential-1.0-credential.jar")
    );
    const transaction = await new Transaction.HVMBuilder(account.getAddress(), providerManager)
      .deploy(file)
      .then((builder) => builder.build());
    transaction.sign(account);
    const response = await contractService.deploy(transaction).send();
    const result = await response.poll();
    expect(result.code).toBe(0);
  });
});
