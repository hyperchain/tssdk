# gas 使用指南

本文档提供 hyperchain 中与 gas 相关的使用指南。

## 1 Transaction 中的 gas 相关字段

在 Transaction 中，与 gas 有关的字段，如下所示：

- gasPrice：指定当前交易的 gas 单价；
- gasLimit：指定交易执行的 gas 数量上限；
- expirationTimestamp：指定交易的过期时间（以调整 gasPrice 进行交易重发），默认为发起交易时间戳的后 5 分钟；
- participant：交易参与方信息（gas 代扣情况下使用，对多个参与方进行签名聚合）
  - initiator：交易原始发起方；
  - withholding：交易代扣方，支持一个代扣方设置；

以上字段，为“交易支付 gas fee”功能提供支持。

### 1.1 gasPrice 字段补充说明

交易发起时，用户可以指定交易的 gasPrice。

当区块链的共识算法为 NoxBFT 的情况下，将会拒绝为低于当前链最低 gasPrice 的交易打包，同时将对交易按照 gasPrice 进行排序（这意味着高 gasPrice 的交易将会被优先打包）。

最后区块链将会对所有交易进行 gas fee 的扣除（除部分特殊的系统级别交易外）。

#### 1.1.1 gasPrice 默认值设置

区块链 admin 权限账户可对当前链的最低 gasPrice 进行修改，以及为某个账户地址进行 balance 的增发（该部分操作内容可参考bvm相关是有手册）。

SDK 初始化时，将会获取链上当前的最低 gasPrice 值并设置为 SDK 的默认值。

### 1.2 participant 字段补充说明

```typescript
class Participant {
  private initiator: string;
  private withholding: string[];
  // ... 省略
}
```

通常情况下（未使用 participant），交易发起方（即交易中的 From 账户地址）是作为 gas fee 的支付方。

当用户指定交易的 participant 时，用户引入了另一种 gas fee 的支付方式——交易代扣。用户可以将交易发起方填入 initiator 中，交易代扣方填入 withholding 中。在此类型的交易中，所有交易参与方需要进行“聚合签名”（交易的 From 将变为多个参与方账户的聚合地址）。

#### 1.2.1 注意事项

participant 支持普通账户与 DID 账户，且可分别设置，但仅限是基于国密 SM 算法派生的账户类型：

- 当交易参与方为普通账户的情况下，需要使用账户的公钥；
- 当交易参与方为 DID 账户的情况下，则可以使用 DID 账户地址来作为交易参与方；

因此在构造 participant 对象的时候需要特别注意传入的内容，否则交易验签将会失败。例如构造一个 initiator 为 DID 账户，withholding 为普通账户的情况如下：

```typescript
// account 为 DIDAccount，account0 为 SMAccount
const participant = new Participant(account.getAddress(), account0.getPublicKey());
```

### 1.3 gas 相关字段赋值

对于交易结构体中的 gas 相关字段，SDK 提供了默认值，用户也可以通过 Builder 构造器进行设置（与其他字段的用法相同）：

```typescript
class Builder {
  // ... 省略无关方法
  public gasPrice(gasPrice: number): Builder {
    this.transaction.setGasPrice(gasPrice);
    return this;
  }

  public gasLimit(gasLimit: number): Builder {
    this.transaction.setGasLimit(gasLimit);
    return this;
  }

  public expirationTimestamp(timestamp: bigint): Builder {
    this.transaction.setExpirationTimestamp(timestamp);
    return this;
  }

  public participant(participant: Participant): Builder {
    this.transaction.setParticipant(participant);
    return this;
  }
}

```

#### 1.3.1 示例

构造一个自定义 gasPrice 和 gasLimit 的交易如下：

```typescript
const transaction = new Transaction.Builder(account.getAddress())
        .transfer(account0.getAddress(), 0)
        .gasPrice(10)
        .gasLimit(10000000)
        .build();
transaction.sign(account);
```

## 2 代扣交易

代扣交易的实现，需要由交易发起者和交易代扣者共同完成签名（依赖于交易中的 **participant 字段**以及**聚合签名的工具**）。

participant  字段的介绍见 [1.2 小节](#12-participant-字段补充说明) 即可，接下来将详细介绍“聚合签名的工具”——`AggSigner`。

### 2.1 AggSigner

`AggSigner` 是一个聚合签名的工具，通过将自己的公私钥对进行包装后生成，可同其他人的公钥进行聚合后生成聚合公钥和聚合地址，并生成承诺，将生成的承诺进行聚合后再进一步进行聚合签名，并将各个参与方的签名进行聚合后完成对完整交易的签名。

一个完整的聚合签名流程包括：

1. 通过自身账户的公私钥对和交易参与方（participant）的公钥列表来生成`AggSigner`。注意公钥列表需保证有序，对应到 participant 的结构中，应 initiator 在前，withholding 在后；
2. 各个参与方各自生成承诺，可由任意一方在收到所有人的承诺后进行承诺聚合，并广播给所有人，后续将依赖于该承诺进行签名（注意承诺无法多次使用）；
3. 各个参与方各自通过上述的聚合承诺进行部分签名，可由任意一方在收到所有人的部分签名后进行签名聚合，并为交易设置签名；

`AggSigner` 结构如下：

```typescript
class AggSigner {
  public static readonly AGGFlag: Uint8Array = Uint8Array.from([7]);
  public static readonly DIDAggFlag: Uint8Array = Uint8Array.from([7 | 128]);

  private account?: Account;
  private publicKeys?: string[];
  private address?: string;
  private publicKey?: string;
  private index: number;
  private aggContext?: AggContext;
  private hasDid?: boolean;

  // 构造函数（self：自身账户公私钥对结构；publicKeys：参与方公钥列表）
  public constructor(self: Account, publicKeys: string[]);

  // 生成个人账户承诺
  public commitment(): Uint8Array;

  // 生成聚合承诺（commitments：多方承诺，多方承诺的顺序需要与publicKeys列表顺序相同）
  public aggCommitment(...commitments: Uint8Array[]): Uint8Array;

  // 部分签名（msg：待签名原文；aggCommitment：聚合承诺）
  public partSign(msg: Uint8Array | Transaction, aggCommitment: Uint8Array): Uint8Array;

  // 聚合签名（signs：多方签名，多方签名的顺序需要与publicKeys列表顺序相同）
  public aggSign(...signs: Uint8Array[]);
}
```

### 2.2 示例

本示例展示了使用“聚合签名”对交易进行签名的过程。

具体示例见 [master/test/account/incentive.spec.ts](https://git.hyperchain.cn/yuqingbo1/jssdk/blob/master/test/account/incentive.spec.ts)。可以在`@hyperchain/jssdk`项目根目录，使用 `npx jest ./test/account/incentive.spec.ts ` 命令运行该测试。

```typescript
// 参与者公钥集合
const publicKeys = [account.getPublicKey(), account0.getPublicKey()];
// 参与者 1
const user = new AggSigner(account, publicKeys);
// 参与者 2
const institution = new AggSigner(account0, publicKeys);

// 生成承诺
const commitment0 = user.commitment();
const commitment1 = institution.commitment();
// 生成聚合承诺
const aggCommitment = institution.aggCommitment(commitment0, commitment1); // 共同承诺

// 创建一笔交易（任意），并填写参与者信息
const participant = new Participant(account.getPublicKey(), account0.getPublicKey());
const sql = `create table if not exists test(id bigint(20) NOT NULL auto_increment primary key, meta varchar(255))`;
const tx = new Transaction.SqlBuilder(user.getAddress()!, providerManager)
  .invoke(contractAddress, sql)
  .participant(participant) // 指定参与者
  .build();

// 部分交易签名
const partSign0 = user.partSign(tx, aggCommitment); // 签名确认
const partSign1 = institution.partSign(tx, aggCommitment); // 签名确认

// 聚合交易签名（可由任意一方）
const aggSign = institution.aggSign(partSign0, partSign1);

// 正式签名
tx.setSignature(ByteUtil.toHex(aggSign));

// 发送交易
const response = await sqlService.invoke(tx).send();
const receipt = await response.poll();
const response = await txService.getTxByHash(receipt.result.txHash).send();
console.log(response.result.participant);
```


