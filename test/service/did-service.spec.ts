import {
  Algo,
  DidCredential,
  DidDocument,
  DidPublicKey,
  InvokeParams,
  StringUtil,
  Transaction,
  JSONBigintUtil,
  logger,
} from "../../src";
import { RequestError } from "../../src";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { init, registerDidAccount } from "../common";
import fs from "fs";
import path from "path";

describe("DidService.freeze", () => {
  test("normal test", async () => {
    const { providerManager, didService } = await init();
    const didAdmin = await registerDidAccount([]);
    const account = await registerDidAccount([didAdmin.getAddress()]);
    const transaction = new Transaction.DidBuilder(didAdmin.getAddress(), providerManager)
      .freeze(account.getAddress())
      .build();
    transaction.sign(didAdmin);
    const response = await didService.freeze(transaction).send();
    const result = await response.poll();
    const ret = JSON.parse(StringUtil.fromHex(result.result.ret));
    expect(ret).toBeTruthy();
  });

  test("non-admin account can't freeze account", async () => {
    const { providerManager, didService } = await init();
    const didAdmin = await registerDidAccount([]);
    const account1 = await registerDidAccount([didAdmin.getAddress()]);
    const account2 = await registerDidAccount([didAdmin.getAddress()]);
    const transaction = new Transaction.DidBuilder(account1.getAddress(), providerManager)
      .freeze(account2.getAddress())
      .build();
    transaction.sign(account2);
    let result: any;
    try {
      const response = await didService.freeze(transaction).send();
      result = await response.poll(10, 20, 30);
    } catch (e) {
      if (e instanceof RequestError) {
        expect(e.getCode()).toBe(-32022);
        return;
      }
      throw e;
    }
  });
});

describe("DidService.unfreeze", () => {
  test("normal test", async () => {
    const { providerManager, didService } = await init();
    const didAdmin = await registerDidAccount([]);
    const account1 = await registerDidAccount([didAdmin.getAddress()]);
    // 冻结
    const freezeTransaction = new Transaction.DidBuilder(didAdmin.getAddress(), providerManager)
      .freeze(account1.getAddress())
      .build();
    freezeTransaction.sign(didAdmin);
    const freezeRequest = didService.freeze(freezeTransaction);
    const freezeResponse = await freezeRequest.send();
    const freezeResult = await freezeResponse.poll();
    expect(freezeResult.code).toBe(0);
    expect(JSON.parse(StringUtil.fromHex(freezeResult.result.ret))).toBeTruthy();
    // 查询 document，确认账户状态为冻结
    const getDidDocumentRequest = didService.getDIDDocument(account1.getAddress());
    const getDidDocumentResponse = await getDidDocumentRequest.send();
    const state = getDidDocumentResponse.result.state;
    expect(state).toBe(DidDocument.FREEZE);
    // 解冻
    const unfreezeTransaction = new Transaction.DidBuilder(didAdmin.getAddress(), providerManager)
      .unfreeze(account1.getAddress())
      .build();
    unfreezeTransaction.sign(didAdmin);
    const unfreezeRequest = didService.unFreeze(unfreezeTransaction);
    const unfreezeResponse = await unfreezeRequest.send();
    const unfreezeResult = await unfreezeResponse.poll();
    expect(unfreezeResult.code).toBe(0);
    expect(JSON.parse(StringUtil.fromHex(unfreezeResult.result.ret))).toBeTruthy();

    // 再次查询 document，确认账户状态为正常
    const getDidDocumentRequest1 = didService.getDIDDocument(account1.getAddress());
    const getDidDocumentResponse1 = await getDidDocumentRequest1.send();
    const state1 = getDidDocumentResponse1.result.state;
    expect(state1).toBe(DidDocument.NORMAL);
  });
});

describe("DidService.updatePublicKey", () => {
  test("normal test", async () => {
    const { providerManager, didService } = await init();
    const didAdmin = await registerDidAccount([]);
    const account1 = await registerDidAccount([didAdmin.getAddress()]);
    const account2 = await registerDidAccount([didAdmin.getAddress()]);
    const publicKey = DidPublicKey.getPublicKeyFromAccount(account2);

    const updatePublicKeyTransaction = new Transaction.DidBuilder(
      didAdmin.getAddress(),
      providerManager
    )
      .updatePublicKey(account1.getAddress(), publicKey)
      .build();
    updatePublicKeyTransaction.sign(didAdmin);

    const receiptResponse = await didService.updatePublicKey(updatePublicKeyTransaction).send();
    const result = await receiptResponse.poll();
    expect(JSON.parse(StringUtil.fromHex(result.result.ret))).toBeTruthy();

    const didDocumentResponse = await didService.getDIDDocument(account1.getAddress()).send();
    const doc = didDocumentResponse.result;
    expect(doc.publicKey.key).toBe(publicKey.getKey());
    expect(doc.state).toBe(DidDocument.FREEZE);
  });
});

describe("DidService.updateAdmins", () => {
  test("normal test", async () => {
    const { providerManager, didService } = await init();
    const didAdmin = await registerDidAccount([]);
    const account1 = await registerDidAccount([didAdmin.getAddress()]);

    const transaction = new Transaction.DidBuilder(didAdmin.getAddress(), providerManager)
      .updateAdmins(account1.getAddress(), [])
      .build();
    transaction.sign(didAdmin);
    const receiptResponse = await didService.updateAdmins(transaction).send();
    const result = await receiptResponse.poll();
    expect(JSON.parse(StringUtil.fromHex(result.result.ret))).toBeTruthy();
  });
});

describe("DidService.destroy", () => {
  test("normal test", async () => {
    const { providerManager, didService } = await init();
    const didAdmin = await registerDidAccount([]);
    const account1 = await registerDidAccount([didAdmin.getAddress()]);
    const transaction1 = new Transaction.DidBuilder(didAdmin.getAddress(), providerManager)
      .destroy(account1.getAddress())
      .build();
    transaction1.sign(didAdmin);
    const receiptResponse = await didService.destroy(transaction1).send();
    const result = await receiptResponse.poll();

    expect(JSON.parse(StringUtil.fromHex(result.result.ret))).toBeTruthy();
    const doc = await didService.getDIDDocument(account1.getAddress()).send();
    expect(doc.result.state).toBe(DidDocument.ABANDON);
  });
});

describe("DidService.uploadCredential", () => {
  test("check credential valid by hvm contract", async () => {
    const { providerManager, contractService, didService } = await init();
    const account = await registerDidAccount([]);

    console.log(account);

    const didCredential = new DidCredential(
      "emm",
      account.getAddress(),
      account.getAddress(),
      BigInt(new Date().valueOf() * 1e6) + BigInt(1e11),
      null
    );
    const transaction = new Transaction.DidBuilder(account.getAddress(), providerManager)
      .uploadCredential(didCredential)
      .build();
    transaction.sign(account);
    const response = await didService.uploadCredential(transaction).send();
    const result = await response.poll();
    expect(JSON.parse(StringUtil.fromHex(result.result.ret))).toBeTruthy();

    // 查询 credential 结果
    const credentialResponse = await didService
      .getCredentialPrimaryMessage(didCredential.getId())
      .send();
    expect(
      JSONBigintUtil.stringify({
        ...credentialResponse.result,
        subject: null,
      })
    ).toBe(JSONBigintUtil.stringify(didCredential));
    // 查询 credential 是否有效
    const credentialValidResponse = await didService
      .checkCredentialValid(didCredential.getId())
      .send();
    expect(credentialValidResponse.result).toBeTruthy();
    // 查询 credential 是否无效
    const credentialAbandonedResponse = await didService
      .checkCredentialAbandoned(didCredential.getId())
      .send();
    expect(credentialAbandonedResponse.result).toBeFalsy();

    // 部署合约
    const file: Buffer = fs.readFileSync(
      path.resolve(__dirname, "../resource/hvm-jar/credential-1.0-credential.jar")
    );
    const transaction1 = await new Transaction.HVMBuilder(account.getAddress(), providerManager)
      .deploy(file)
      .then((builder) => builder.build());
    transaction1.sign(account);
    const response1 = await contractService.deploy(transaction1).send();
    const result1 = await response1.poll();
    expect(result1.code).toBe(0);
  });
});

describe("DidService.destroyCredential", () => {
  test("normal test", async () => {
    const { providerManager, didService } = await init();
    const account = await registerDidAccount([], Algo.ECRAW);

    const didCredential = new DidCredential(
      "hello",
      account.getAddress(),
      account.getAddress(),
      BigInt(new Date().valueOf() * 1e6) + BigInt(1e11),
      null
    );

    const transaction = new Transaction.DidBuilder(account.getAddress(), providerManager)
      .uploadCredential(didCredential)
      .build();
    transaction.sign(account);
    const response = await didService.uploadCredential(transaction).send();
    const result = await response.poll();
    expect(JSON.parse(StringUtil.fromHex(result.result.ret))).toBeTruthy();

    const transaction1 = new Transaction.DidBuilder(account.getAddress(), providerManager)
      .destroyCredential(didCredential.getId())
      .build();
    transaction1.sign(account);
    const response1 = await didService.destroyCredential(transaction1).send();
    const result1 = await response1.poll();
    expect(JSON.parse(StringUtil.fromHex(result1.result.ret))).toBeTruthy();

    // 查询 credential 是否无效
    const credentialAbandonedResponse = await didService
      .checkCredentialAbandoned(didCredential.getId())
      .send();
    expect(credentialAbandonedResponse.result).toBeTruthy();
  });
});

describe("DidService.setExtra", () => {
  test("normal test", async () => {
    const { providerManager, didService } = await init();
    const didAdmin = await registerDidAccount([]);
    const account = await registerDidAccount([didAdmin.getAddress()], Algo.ECRAW);

    {
      const transaction = new Transaction.DidBuilder(didAdmin.getAddress(), providerManager)
        .setExtra(account.getAddress(), "myKey", "myValue")
        .build();
      transaction.sign(didAdmin);
      const response = await didService.setExtra(transaction).send();
      const result = await response.poll();
      expect(JSON.parse(StringUtil.fromHex(result.result.ret))).toBeTruthy();
    }

    {
      const transaction = new Transaction.DidBuilder(didAdmin.getAddress(), providerManager)
        .getExtra(account.getAddress(), "myKey")
        .build();
      transaction.sign(didAdmin);
      const response = await didService.getExtra(transaction).send();
      const result = await response.poll();
      expect(StringUtil.fromHex(result.result.ret)).toBe("myValue");
    }
  });
});
