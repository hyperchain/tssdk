import {
  Algo,
  StringUtil,
  Transaction,
  AggSigner,
  Participant,
  ByteUtil,
  JSONBigintUtil,
} from "../../src";
import { AggContext } from "../../src/account/crypto";
import {
  compressPublicKeyHex,
  generateKeyPairHex,
  verifyPublicKey,
} from "../../src/account/crypto/sm2/utils";
import { sm3, sm3Str } from "../../src/account/crypto/sm3";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { init } from "../common";

const accountJsons = [
  '{"address":"0x856e2b9a5fa82fd1b031d1ff6863864dbac7995d","version":"4.0","algo":"0x13","publicKey":"047ea464762c333762d3be8a04536b22955d97231062442f81a3cff46cb009bbdbb0f30e61ade5705254d4e4e0c0745fb3ba69006d4b377f82ecec05ed094dbe87","privateKey":"71b9acc4ee2b32b3d2c79b5abe9e118e5f73765aee5e7755d6aa31f12945036d"}',
  '{"address":"0x000f1a7a08ccc48e5d30f80850cf1cf283aa3abd","version":"4.0", "algo":"0x03","publicKey":"0400ddbadb932a0d276e257c6df50599a425804a3743f40942d031f806bf14ab0c57aed6977b1ad14646672f9b9ce385f2c98c4581267b611f48f4b7937de386ac","privateKey":"16acbf6b4f09a476a35ebd4c01e337238b5dceceb6ff55ff0c4bd83c4f91e11b"}',
  '{"address":"0x6201cb0448964ac597faf6fdf1f472edf2a22b89","version":"4.0", "algo":"0x03","publicKey":"04e482f140d70a1b8ec8185cc699db5b391ea5a7b8e93e274b9f706be9efdaec69542eb32a61421ba6219230b9cf87bf849fa01c1d10a8d298cbe3dcfa5954134c","privateKey":"21ff03a654c939f0c9b83e969aaa9050484aa4108028094ee2e927ba7e7d1bbb"}',
  '{"address":"0xb18c8575e3284e79b92100025a31378feb8100d6","version":"4.0", "algo":"0x03","publicKey":"042169a7260acaff308228579aab2a2c6b3a790922c6a6b58b218cdd7ce0b1db0fbfa6f68737a452010b9d138187b8321288cae98f07fc758bb67bb818292cab9b","privateKey":"aa9c83316f68c17bcc21cf20a4733ae2b2bf76ad1c745f634c0ebf7d5094500e"}',
  '{"address":"0xe93b92f1da08f925bdee44e91e7768380ae83307","version":"4.0","algo":"0x03","publicKey":"047196daf5d4d1fe339da58e2fe0543bbfec9a464b76546f180facdcc56315b8eeeca50474100f15fb17606695ce24a1f8e5a990600c1c4ea9787ba4dd65c8ce3e","privateKey":"8cdfbe86deb690e331453a84a98c956f0422dd1e783c3a02aed9180b1f4516a9"}',
  '{"address":"fbca6a7e9e29728773b270d3f00153c75d04e1ad","version":"4.0","algo":"0x13","publicKey":"049c330d0aea3d9c73063db339b4a1a84d1c3197980d1fb9585347ceeb40a5d262166ee1e1cb0c29fd9b2ef0e4f7a7dfb1be6c5e759bf411c520a616863ee046a4","privateKey":"5f0a3ea6c1d3eb7733c3170f2271c10c1206bc49b6b2c7e550c9947cb8f098e3"}',
];

describe("incentive test", () => {
  jest.setTimeout(10000);
  test("normal test", async () => {
    const { providerManager, accountService, sqlService, txService } = await init();
    const account = accountService.genAccount(Algo.SMRAW);
    const account0 = accountService.fromAccountJson(accountJsons[0]);

    {
      const tx = new Transaction.SqlBuilder(account.getAddress(), providerManager).create().build();
      tx.sign(account);
      const response = await sqlService.create(tx).send();
      const receipt = await response.poll();
      console.log("gas use", receipt.result.gasUsed);
    }

    {
      const tx0 = new Transaction.SqlBuilder(account0.getAddress(), providerManager)
        .create()
        .build();
      tx0.sign(account0);
      const response0 = await sqlService.create(tx0).send();
      const receipt0 = await response0.poll();
      console.log("gas use", receipt0.result.gasUsed);

      const contractAddress = receipt0.result.contractAddress;

      const publicKeys = [account.getPublicKey(), account0.getPublicKey()];
      const user = new AggSigner(account, publicKeys);
      const institution = new AggSigner(account0, publicKeys);

      const commitment0 = user.commitment();
      const commitment1 = institution.commitment();
      const aggCommitment = institution.aggCommitment(commitment0, commitment1); // 共同承诺

      const participant = new Participant(account.getPublicKey(), account0.getPublicKey());
      const sql = `create table if not exists test(id bigint(20) NOT NULL auto_increment primary key, meta varchar(255))`;
      const tx = new Transaction.SqlBuilder(user.getAddress()!, providerManager)
        .invoke(contractAddress, sql)
        .participant(participant)
        .build();

      {
        // 测试 participant 反序列化时 Base64 解码
        const txStr = tx.toJson();
        const tx1 = Transaction.fromJson(txStr);

        expect(JSONBigintUtil.stringify(tx1.commonParam())).toBe(
          JSONBigintUtil.stringify(tx.commonParam())
        );
        expect(tx1.getParticipant()?.getInitiator()).toBe(tx.getParticipant()?.getInitiator());
      }

      // 部分交易签名
      const partSign0 = user.partSign(tx, aggCommitment); // 签名确认
      const partSign1 = institution.partSign(tx, aggCommitment); // 签名确认
      // 聚合交易签名（可由任意一方）
      const aggSign = institution.aggSign(partSign0, partSign1);
      console.log("tx string:", tx.getNeedHashString() || "");
      console.log("institution publicKey: ", institution.getPublicKey());
      console.log("aggSign:", ByteUtil.toHex(aggSign));
      expect(
        institution.verify(StringUtil.toByte(tx.getNeedHashString() || ""), aggSign)
      ).toBeTruthy();
      expect(user.verify(StringUtil.toByte(tx.getNeedHashString() || ""), aggSign)).toBeTruthy();
      // 正式签名
      tx.setSignature(ByteUtil.toHex(aggSign));
      // 调用
      const response = await sqlService.invoke(tx).send();
      const receipt = await response.poll();
      console.log("gas use", receipt.result.gasUsed);
      console.log(tx.getNeedHashString() || "");
      console.log(institution.verify(StringUtil.toByte(tx.getNeedHashString() || ""), aggSign));
      {
        const response = await txService.getTxByHash(receipt.result.txHash).send();
        console.log(response.result.participant);
      }
    }
  });

  test("sm3: must match the result", () => {
    expect(ByteUtil.toHex(sm3(StringUtil.toByte("abc")))).toBe(
      "66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0"
    );
    expect(ByteUtil.toHex(sm3(StringUtil.toByte("abcdefghABCDEFGH12345678")))).toBe(
      "d670c7f027fd5f9f0c163f4bfe98f9003fe597d3f52dbab0885ec2ca8dd23e9b"
    );
    expect(sm3Str("abcdefghABCDEFGH12345678abcdefghABCDEFGH12345678abcdefgh")).toBe(
      "1cf3bafec325d7d9102cd67ba46b09195af4e613b6c2b898122363d810308b11"
    );
    expect(sm3Str("abcdefghABCDEFGH12345678abcdefghABCDEFGH12345678abcdefghABCD")).toBe(
      "b8ac4203969bde27434ce667b0adbf3439ee97e416e73cb96f4431f478a531fe"
    );
    expect(sm3Str("abcdefghABCDEFGH12345678abcdefghABCDEFGH12345678abcdefghABCDEFGH")).toBe(
      "5ef0cdbe0d54426eea7f5c8b44385bb1003548735feaa59137c3dfe608aa9567"
    );
    expect(sm3Str("abcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd")).toBe(
      "debe9ff92275b8a138604889c18e5a4d6fdb70e5387e5765293dcba39c0c5732"
    );
    // 字节数组
    const t1 = sm3(
      Uint8Array.from([
        0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21, 0x20, 0xe6, 0x88,
        0x91, 0xe6, 0x98, 0xaf, 0x20, 0x6a, 0x75, 0x6e, 0x65, 0x61, 0x6e, 0x64, 0x67, 0x72, 0x65,
        0x65, 0x6e, 0x2e,
      ])
    );
    const t2 = ByteUtil.fromHex("ef1cc8e36012c1f1bc18034ab778ef800e8bb1b40c7a4c7177186f6fd521110e");
    expect(t1.toString() === t2.toString()).toBe(true);
  });
  test("curve", async () => {
    const keypair = generateKeyPairHex();

    const unCompressedPublicKey = keypair.publicKey;

    const compressedPublicKey = compressPublicKeyHex(unCompressedPublicKey);
    expect(verifyPublicKey(compressedPublicKey)).toBe(true);
    expect(
      verifyPublicKey(
        "04138d43ff185c12c15e1fb1d19e2fe24cb31d0f7cf1350c66c36547807df304cc9ee45243e9edf6181c7464fb3bf77ae90dd3fbbbf02e1e421a1e1094de2f827d"
      )
    ).toBe(true);
    expect(
      verifyPublicKey(
        "0432641233efecb6004f9068bc97e73963ec49b6da3d86b082db163003d326af0dc575f2539c09c2ee7e0bab987659172fad89b2a6dba31ddc911a4a84a5b171ec"
      )
    ).toBe(true);
  });
  test("agg context", () => {
    const account0 = generateKeyPairHex();
    const account1 = generateKeyPairHex();
    const publicKeys = [account0.publicKey, account1.publicKey];
    const account0Context = new AggContext(0, publicKeys);
    const account1Context = new AggContext(1, publicKeys);
    const apk0 = account0Context.getApk();
    const apk1 = account1Context.getApk();
    expect(verifyPublicKey(ByteUtil.toHex(apk0))).toBeTruthy();
    expect(apk0.toString() === apk1.toString()).toBeTruthy();
    const commitment0 = account0Context.init();
    const commitment1 = account1Context.init();
    const aggCommitment0 = account0Context.aggCommitment(commitment0, commitment1);
    const aggCommitment1 = account1Context.aggCommitment(commitment0, commitment1);
    expect(aggCommitment0.toString() === aggCommitment1.toString()).toBeTruthy();
    const msg = StringUtil.toByte("wow avdqwdufqvfoqgcocqrwcoqwxkwqdgqwdi");
    const partSign0 = account0Context.partSign(account0.privateKey, msg, aggCommitment0);
    const partSign1 = account1Context.partSign(account1.privateKey, msg, aggCommitment1);
    const aggSign0 = account0Context.aggSign(partSign0, partSign1);
    const aggSign1 = account1Context.aggSign(partSign1, partSign0);
    expect(aggSign0.toString() === aggSign1.toString()).toBeTruthy();
    expect(account0Context.verify(ByteUtil.toHex(apk0), msg, aggSign1)).toBeTruthy();
    expect(account1Context.verify(ByteUtil.toHex(apk1), msg, aggSign0)).toBeTruthy();
  });
});
