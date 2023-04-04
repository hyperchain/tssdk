# @hyperchain/jssdk

## 1 概述

`@hyperchain/jssdk` 是一个能与 Hyperchain 直接通信的 JavaScript 库。

### 1.1 特点

- 便于使用：开发者无需关注 Hyperchain 内部的具体实现，即可编写出与"链"交互的应用；
- 功能对齐：API 全面与 LITE SDK 对齐，提供相对统一的使用方式，减少使用者的学习成本；
- 兼容平台：兼容 Node.js 和浏览器两套运行环境；
- 类型提示：提供全套的 TypeScript 类型注解；
- 详尽文档：完善的使用文档，帮助开发者快速全面了解和使用 JS SDK；

### 1.2 与 LiteSDK 的差异

除了以下提到的 5 点，其余功能基本与 LiteSDK 保持一致。

- 暂不支持 FVM；
- 不支持 GRPC 相关服务（只支持 HTTP 通信）；
- 暂不支持 MQ 相关接口、Archive 相关接口、FileMgr 相关接口、数据证明 ProofService 相关接口；
- 暂不支持 SQL 执行结果解码；
- Account 类型暂只支持 SM2、ECDSA；

## 2 基础使用

通过简单的 5 个步骤，快速全览 JSSDK 的使用。其他功能的详细介绍，可继续阅读之后的章节进行了解。

**1. Build provider manager**

```typescript
const httpProvider1 = new HttpProvider(1, "localhost:8081");

const providerManager = await ProviderManager.createManager({
  httpProviders: [httpProvider1]
});
```

**2. Build service**

```typescript
const accountService = ServiceManager.getAccountService(providerManager);
const contractService = ServiceManager.getContractService(providerManager);
```

**3. Create account**

```typescript
const account = accountService.genAccount(Algo.ECRAW);
```

**4. Build transaction**

```typescript
const file: Buffer = fs.readFileSync(
  path.resolve(__dirname, "../resource/hvm-jar/credential-1.0-credential.jar")
);

const transaction = await new Transaction.HVMBuilder(
  account.getAddress(),
  providerManager
)
  .deploy(file)
  .then((builder) => builder.build());
transaction.sign(account);
```

**5. Get response**

```typescript
const deployRequest = contractService.deploy(transaction);
const response = await deployRequest.send();
const deployHvmResult = await response.poll();
```

## 3 Provider

`Provider` 是一个接口，只需要实现一个 `send` 方法：

```typescript
interface Provider {
  send<R>(request: Request<R>): Promise<Response<R>>;
}
```

`HttpProvider` 是 `Provider` 的一个实现类：

```typescript
class HttpProvider implements Provider {
  private id: number;
  private host: string;
  private options?: Omit<RequestInit, "body" | "headers">;

  public async send<T, R extends Response<T> = Response<T>>(
    request: Request<T>
  ): Promise<R> {
    // ...
  }
}
```

`HttpProvider` 构造函数接收 3 个参数—— `id`、`host` 和 `options`：

- `id` 是用于表示当前 `HttpProvider` 实例；
- `host` 是节点地址；
- `options` 是请求可选项（包括是否使用 HTTPS、请求超时时间等，具体可参考 `HttpProviderOptions` 结构）；

`HttpProvider` 的 `send` 方法，接收 request，拿到 request 中的 header、body，使用封装的 `post` 方法，发送请求，返回请求结果。

在 `@hyperchain/jssdk` 中，用户不直接使用 `HttpProvider` 进行请求，而是使用后面章节中提到的 service 进行请求。所以用户只需知道如何实例化一个 `httpProvider` 即可，使用示例如下：

```typescript
const httpProvider1 = new HttpProvider(1, "localhost:8081");
```

## 4 ProviderManager

每个节点的连接都需要一个 `HttpProvider`，而 `ProviderManager` 负责集成、管理这些 `HttpProvider`。

使用 `ProviderManager.createManager` 创建 `ProviderManager` 实例，实例内部初始化全局的 `gasPrice` 和 `txVersion`。`createManager` 函数接收 1 个参数——`ProviderManagerOptions`，包含 `namespace` 和 `httpProviders` 两个属性（都为可选参数）。

使用示例如下：

```typescript
const httpProvider1 = new HttpProvider(1, "localhost:8081");
const httpProvider2 = new HttpProvider(1, "localhost:8082");

const providerManager = await ProviderManager.createManager({
  namespace: "global",
  httpProviders: [httpProvider1, httpProvider2]
});
```

## 5 Account

Account 模块主要负责：结合加密算法和哈希算法生成账户，并提供签名、验签功能。

- 加密算法包括：SM2、ECDSA；
- 哈希算法包括：sha3、SM3；

`Account` 是一个抽象类，定义账户信息，并要求子类实现各自的 `sign` 和 `verify` 方法。

`Account` 子类有`ECAccount`、`SMAccount` 、`DIDAccount` 等，它们的大致结构和逻辑都相同。

在 `@hyperchain/jssdk` 中，用户不直接创建 `Account` 实例，而是使用后面章节中提到的 `AccountService` 进行创建。

使用示例如下：

```typescript
const accountService = ServiceManager.getAccountService(providerManager);
const account = accountService.genAccount(Algo.ECRAW);
// 签名
transaction.sign(account);
```

## 6 Transaction

`Transaction` 是对“交易体”进行统一的封装，主要作为后面篇章中的 Service 的参数使用。构建不同的 `Transaction`，即构建了不同的交易体，通过 Service，完成交易的链上执行。

`@hyperchain/jssdk` 同 `LiteSDK`，使用 **Builder** 模式来负责对 `Transaction` 的创建，通过调用 `build()` 函数来获取到 `Transaction` 实例。

`@hyperchain/jssdk` 本期总共提供了 5 种 Builder（共同继承 Builder），分别为 `HVMBuilder`、`EVMBuilder`、`DidBuilder`、`SqlBuilder`、`BvmBuilder`。

### 6.1 HVMBuilder

#### deploy：部署合约

```typescript
deploy(file: ArrayBuffer): Promise<Builder>
```

参数说明：

- file：部署的 jar 包；

示例如下：

```typescript
const file: Buffer = fs.readFileSync(path.resolve(__dirname, "../xxx.jar"));

const transaction = await new Transaction.HVMBuilder(
  account.getAddress(),
  providerManager
)
  .deploy(file)
  .then((builder) => builder.build());
```

#### invoke：调用合约

```typescript
public invoke(contractAddress: string, invokeParams: InvokeParams): Builder

public invoke(
  contractAddress: string,
  invokeParams: InvokeParams,
  isDid: boolean,
  chainId: string
): Builder
```

参数说明：

- contractAddress：合约地址；
- invokeParams：调用参数，可以通过 `HvmTypeBuilder` 或者 `HvmAbiBuilder` 来创建；
- isDid：contractAddress 是否是 DID；
- chainId：如果是 DID，则 chainId 必须设置；

示例如下：

```typescript
const params = new InvokeParams.HvmTypeBuilder("setHash");
params.addString("test").addObject("java.lang.Object", {
  a: 1,
  b: 2
});

const transaction = new Transaction.HVMBuilder(
  account.getAddress(),
  providerManager
)
  .invoke(contractAddress, params.build())
  .build();
```

#### upgrade：升级合约

```typescript
public async upgrade(contractAddress: string, file: ArrayBuffer): Promise<Builder>
public async upgrade(contractAddress: string, file: string): Promise<Builder>
```

参数说明：

- contractAddress：合约地址；
- file：新合约的 jar 包，或者直接传递设置 payload；

### 6.2 EVMBuilder

#### deploy：部署合约

```typescript
deploy(bin: string | ArrayBuffer | Uint8Array): Builder

deploy(
  bin: string | ArrayBuffer | Uint8Array,
  abi: string | ArrayBuffer | Uint8Array,
  params: string[]
): Builder
```

参数说明：

- bin：合约；
- abi：当合约需要提供 abi 解析构造方法参数时使用；
- params：构造函数参数；

示例如下：

```typescript
const transaction = new Transaction.EVMBuilder(
  account.getAddress(),
  providerManager
)
  .deploy(binFile, abiFile, [
    "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003df32340000000000000000000000000000000000000000000000000000000000"
  ])
  .build();
```

#### invoke：调用合约

```typescript
invoke(
  contractAddress: string,
  methodName: string,
  abi: string | ArrayBuffer | Uint8Array,
  params: any[]
): Builder

invoke(
  contractAddress: string,
  methodName: string,
  abi: string | ArrayBuffer | Uint8Array,
  params: any[],
  isDid: boolean,
  chainId: string
): Builder
```

参数说明：

- contractAddress：合约地址；
- methodName：调用的合约方法名；
- abi：abi 文件；
- params：参数；
- isDid：是否是 DID；
- chainId：如果是 DID，则必须提供 chainId；

示例如下：

```typescript
const abiStr =
  '[{"constant":true,"inputs":[{"name":"a","type":"int256"},\n' +
  '{"name":"b","type":"uint256"},{"name":"c","type":"uint256"},\n' +
  '{"name":"d","type":"int256[2]"}],"name":"testIntAndUint",\n' +
  '"outputs":[{"name":"","type":"int256"},{"name":"","type":"uint256"},\n' +
  '{"name":"","type":"uint256"},{"name":"","type":"int256[2]"}],\n' +
  '"payable":false,"stateMutability":"pure","type":"function"}]';
const invokeMethod = "testIntAndUint(uint256,uint256,int256[2])";
const params = ["123", "123", "123", ["123", "123"]];

const invokeTransaction = new Transaction.EVMBuilder(
  account.getAddress(),
  providerManager
)
  .invoke(contractAddress, invokeMethod, abiStr, params)
  .build();
```

### 6.3 DidBuilder

#### create：构建 DID 账户注册交易

```typescript
create(didDocument: DidDocument): Builder
```

参数说明：

- 需传入账户对应的地址，以及 DID 账户对应的 DID 文档；

示例如下：

```typescript
const transaction = new Transaction.DidBuilder(
  didAccount.getAddress(),
  providerManager
)
  .create(didDocument)
  .build();
```

#### freeze：构建 DID 账户冻结交易

```typescript
freeze(to: string): Builder
```

参数说明：

- 需传入发起交易的账户地址，以及冻结账户对应的地址；

示例如下：

```typescript
const transaction = new Transaction.DidBuilder(
  didAdmin.getAddress(),
  providerManager
)
  .freeze(account.getAddress())
  .build();
```

#### unfreeze：构建 DID 账户解冻交易

```typescript
unfreeze(to: string): Builder
```

参数说明：

- 需传入发起交易的账户地址，以及解冻账户对应的地址；

示例如下：

```typescript
const unfreezeTransaction = new Transaction.DidBuilder(
  didAdmin.getAddress(),
  providerManager
)
  .unfreeze(account1.getAddress())
  .build();
```

#### destroy：构建 DID 账户吊销交易

```typescript
destroy(to: string): Builder
```

参数说明：

- 需传入发起交易的账户地址，以及吊销账户对应的地址；

示例如下：

```typescript
const transaction = new Transaction.DidBuilder(
  didAdmin.getAddress(),
  providerManager
)
  .destroy(account1.getAddress())
  .build();
```

#### updatePublicKey：构建 DID 账户公钥更新交易

```typescript
updatePublicKey(to: string, publicKey: DidPublicKey): Builder
```

参数说明：

- 需传入发起交易的账户地址，以及更新公钥账户对应的地址和新的公钥；

示例如下：

```typescript
const updatePublicKeyTransaction = new Transaction.DidBuilder(
  didAdmin.getAddress(),
  providerManager
)
  .updatePublicKey(account1.getAddress(), publicKey)
  .build();
```

#### updateAdmins：构建 DID 账户管理员更新交易

```typescript
updateAdmins(to: string, admins: string[]): Builder
```

参数说明：

- 需传入发起交易的账户地址，以及更新管理员账户对应的地址和新的管理员列表；

示例如下：

```typescript
const transaction = new Transaction.DidBuilder(
  didAdmin.getAddress(),
  providerManager
)
  .updateAdmins(account1.getAddress(), [])
  .build();
```

#### uploadCredential：构建凭证上传交易

```typescript
uploadCredential(credential: DidCredential): Builder
```

参数说明：

- 需传入发起交易的账户地址，以及凭证；

示例如下：

```typescript
const transaction = new Transaction.DidBuilder(
  account.getAddress(),
  providerManager
)
  .uploadCredential(didCredential)
  .build();
```

#### downloadCredential：构建凭证下载交易

```typescript
downloadCredential(credentialId: string): Builder
```

参数说明：

- 需传入发起交易的账户地址，以及凭证 ID；

示例如下：

```typescript
const transaction = new Transaction.DidBuilder(
  account.getAddress(),
  providerManager
)
  .downloadCredential(credentialID)
  .build();
```

#### destroyCredential：构建凭证下载交易

```typescript
destroyCredential(credentialId: string): Builder
```

参数说明：

- 需传入发起交易的账户地址，以及凭证 ID；

示例如下：

```typescript
const transaction = new Transaction.DidBuilder(
  account.getAddress(),
  providerManager
)
  .destroyCredential(credentialID)
  .build();
```

#### setExtra：构建设置 extra 交易

```typescript
setExtra(to: string, key: string, value: string): Builder
```

参数说明：

- 将附加信息存入到 did 账户的 Document 中，需要有该 did 账户的管理员权限，存储信息为 key-value 对；

示例如下：

```typescript
const transaction = new Transaction.DidBuilder(
  account.getAddress(),
  providerManager
)
  .setExtra(didAccount.getAddress(), "key", "value")
  .build();
```

#### getExtra：构建查询 extra 交易

```typescript
getExtra(to: string, key: string): builder
```

参数说明：

- 从 did 账户的 Document 中通过 key 获取到附加信息，需要有该 did 账户的管理员权限；

示例如下：

```typescript
const transaction = new Transaction.DidBuilder(
  account.getAddress(),
  providerManager
)
  .getExtra(didAccount.getAddress(), "key")
  .build();
```

### 6.4 SqlBuilder

#### create：构建创建数据库交易

```typescript
create(): Builder
```

示例如下：

```typescript
const tx0 = new Transaction.SqlBuilder(account0.getAddress(), providerManager)
  .create()
  .build();
```

#### freeze：构建冻结数据库交易

```typescript
freeze(contractAddress: string): Builder
```

示例如下：

```typescript
const transaction = new Transaction.SqlBuilder(
  account.getAddress(),
  providerManager
)
  .freeze(databaseAddr)
  .build();
```

#### unfreeze：构建解冻数据库交易

```typescript
unfreeze(contractAddress: string): Builder
```

示例如下：

```typescript
const transaction = new Transaction.SqlBuilder(
  account.getAddress(),
  providerManager
)
  .unfreeze(databaseAddr)
  .build();
```

#### destroy：删除数据库

```typescript
destroy(contractAddress: string): Builder
```

示例如下：

```typescript
const transaction = new Transaction.SqlBuilder(
  account.getAddress(),
  providerManager
)
  .destroy(databaseAddr)
  .build();
```

#### invoke：调用 SQL

```typescript
invoke(to: string, sql: string): Builder
```

示例如下：

```typescript
const sql =
  "CREATE TABLE IF NOT EXISTS testTable (id bigint(20) NOT NULL, name varchar(32) NOT NULL, exp bigint(20), money double(16,2) NOT NULL DEFAULT '99', primary key (id), unique key name (name));";

const transaction = new Transaction.SqlBuilder(
  account.getAddress(),
  providerManager
)
  .invoke(databaseAddr, sql)
  .build();
```

### 6.5 BVMBuilder

#### invoke

```typescript
invoke(opt: BvmOperation.Builtin): BVMBuilder

invoke(opt: BvmOperation.Builtin, isDid: boolean, chainId?: string): BVMBuilder

invoke(contractAddress: string, methodName: string, ...params: string[]): BVMBuilder
```

`BVMBuilder`提供的 `invoke`方法接收一个`BuiltinOperation`类型的对象，这个对象集成自统一的父类`Operation`， 在`Operation`中封装了这个操作要调用的合约方法以及需要的参数，其定义如下：

```typescript
abstract class Operation {
  private args?: string[];
  private method?: ContractMethod;

  public setArgs(...args: string[]): void;
  public setMethod(method: ContractMethod);
  public getMethod(): ContractMethod | undefined;
  public getArgs(): string[] | undefined;
}
```

`BuiltinOpetation`继承自`Operation`，增加了要调用的合约地址的封装，其定义如下：

```typescript
class BuiltinOperation extends Operation {
  private address?: string;
  private base64Index?: boolean[];

  public getAddress(): string | undefined;

  public setAddress(address: string): void;

  public getBase64Index(): boolean[] | undefined;

  public setBase64Index(...indexes: number[]): void;
}
```

由于 BVM 中有多种合约，一个合约中也有多个合约方法，为此提供了相应的`Builder`来构造相应的操作，封装了一个父类的`BuilderOperationBuilder`用于构造内置操作`BuiltinOperation`，其定义如下：

```typescript
class BuiltinOperationBuilder {
  protected opt: BuiltinOperation;

  protected constructor(opt: BuiltinOperation) {
    this.opt = opt;
  }
  public build(): BuiltinOperation {
    return this.opt;
  }
}
```

针对不同的合约地址中不同的合约方法调用有封装相应的实现类，目前 bvm 提供的合约有：`HashContract`、`ProposalContract`、`AccountContract`、`MPCContract`、`CertContract`、`RootCAContract`、`HashChangeContract`、`GasManagerContract` 8 种，分别有`BuiltinOperation`的实现类`HashOperation`、`ProposalOperation`、`AccountOperation`、`MPCOperation`、`CertOperation`、`RootCAOperation`、`HashChangeOperation`、`BalanceOperation`，相应的也提供了`HashBuilder`、`ProposalBuilder`、`AccountBuilder`、`MPCBuilder`、`CertBuilder`、`RootCABuilder`、`HashChangeBuilder`、`BalanceBuilder`用于创建相应的操作。

简单使用示例如下：

```typescript
// 构建 BVM 相关的 Transaction
const transaction = new Transaction.BVMBuilder(
  genesisAccount.getAddress(),
  providerManager
)
  .invoke(new BvmOperation.DID.Builder().setChainID("hhppcc").build())
  .build();
transaction.sign(genesisAccount);

// 使用 contractService 进行交易发送
const response = await(await contractService.invoke(transaction).send()).poll();
// 使用 DecodeUtil 的 BVM 工具函数解码拿到结果
const decodedRet = DecodeUtil.decodeBvmResultRet(response.result.ret);
```

若要了解每种 Option 的具体使用，可以参考 LiteSDK BVM 部分说明，也可以参考 [JSSDK BVM 单元测试代码](../test/common/bvm.spec.ts)。

### 6.6 fromJson：根据 JSON 字符串生成 transaction

```typescript
static fromJson(transactionStr: string)
```

示例如下：

```typescript
const transactionJson = `{"to":"0xd77614848d82d8ec8874f046571a04ccba7cf0d9","timestamp":1675219768574000000,"nonce":1870973331884563,"type":"EVM","opCode":0,"payload":"0x4ca90470000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000007b","simulate":false,"gasPrice":0,"gasLimit":1000000000,"version":"4.2"}`;
const transaction: Transaction = Transaction.fromJson(transactionJson);
```

### 6.7 toJson：生成 JSON 字符串

```typescript
toJson(): string
```

示例如下：

```typescript
const transactionStr = transcation.toJson();
// 或者 Transaction.toJson(transcation);
```

## 7 ServiceManager

`ServiceManager` 为访问各个 service 提供统一的总入口。

`ServiceManager` 提供 8 个静态方法，分别获取 8 种 Service 实例，方法参数统一是 `ProviderManager` 实例。

示例如下：

```typescript
const httpProvider1 = new HttpProvider(1, "localhost:8081");
const providerManager = await ProviderManager.createManager({
  httpProviders: [httpProvider1]
});

const accountService = ServiceManager.getAccountService(providerManager);
const txService = ServiceManager.getTxService(providerManager);
const contractService = ServiceManager.getContractService(providerManager);
const blockService = ServiceManager.getBlockService(providerManager);
const nodeService = ServiceManager.getNodeService(providerManager);
const didService = ServiceManager.getDidService(providerManager);
const sqlService = ServiceManager.getSqlService(providerManager);
const versionService = ServiceManager.getVersionService(providerManager);
```

### 7.1 getTxService：获取 TxService 实例

```typescript
static getTxService(providerManager: ProviderManager): TxService
```

### 7.2 getAccountService：获取 AccountService 实例

```typescript
static getAccountService(providerManager: ProviderManager): AccountService
```

### 7.3 getContractService：获取 ContractService 实例

```typescript
static getContractService(providerManager: ProviderManager): ContractService
```

### 7.4 getBlockService：获取 BlockService 实例

```typescript
static getBlockService(providerManager: ProviderManager): BlockService
```

### 7.5 getNodeService：获取 NodeService 实例

```typescript
static getNodeService(providerManager: ProviderManager): NodeService
```

### 7.6 getDidService：获取 DidService 实例

```typescript
static getDidService(providerManager: ProviderManager): DidService
```

### 7.7 getSqlService：获取 SqlService 实例

```typescript
static getSqlService(providerManager: ProviderManager): SqlService
```

## 8 AccountService

`AccountService` 是访问 `Account` 的总入口，为用户提供创建、查询 Account 服务。

`AccountService` 可以通过 `ServiceManager.getAccountService(providerMananger)` 进行创建。

### 8.1 genAccount：创建账户

```typescript
genAccount(algo: Algo, password?: string): Account
```

### 8.2 fromAccountJson：将 JSON 转化为账户

```typescript
fromAccountJson(accountJson: string, password?: string): Account
```

### 8.3 getBalance：获取余额

```typescript
getBalance(address: string, ...nodeIds: number[]): Request<string>
```

### 8.4 getRoles：获取账户角色

```typescript
getRoles(address: string, ...nodeIds: number[]): Request<string[]>
```

### 8.5 getAccountsByRole：查询具有改角色的账户列表

```typescript
getAccountsByRole(role: string, ...nodeIds: number[]): Request<string[]>
```

### 8.6 getStatus：查询普通账户的状态

```typescript
getStatus(address: string, ...nodeIds: number[]): Request<string>
```

### 8.7 genDidAccount：生成 DID 账户

```typescript
genDidAccount(algo: Algo, suffix: string, password?: string): Account
```

### 8.8 genDidAccountFromAccountJson：将 JSON 转化为 DID 账户

```typescript
genDidAccountFromAccountJson(accountJson: string, suffix: string, password?: string): Account
```

### 8.9 fromPrivateKey：根据私钥生成对应类型账户

```typescript
fromPrivateKey(privateKey: string, algo: Algo, password?: string): Account
```

## 9 SqlService

`SqlService` 是 SQL 操作链上数据的总入口，为用户提供以下服务：

- 管理数据库；
- SQL 调用；

`SqlService` 可以通过 `ServiceManager.getSqlService(providerMananger)` 进行创建。

说明：在当前版本中，不涉及执行结果解析查询的操作（后续版本迭代可能支持）。

### 9.1 create：创建数据库

```typescript
create(transaction: Transaction, ...nodeIds: number[]): Request<string | Receipt, PollingResponse>
```

参数说明：

- transaction：参考 `Transaction.SqlBuilder` 的 `create` 方法，构建交易体；

### 9.2 invoke：调用 SQL

```typescript
invoke(transaction: Transaction, ...nodeIds: number[]): Request<string | Receipt, PollingResponse>
```

参数说明：

- transaction：参考 `Transaction.SqlBuilder` 的 `invoke` 方法，构建交易体；

### 9.3 maintain：管理数据库的生命周期（冻结、解冻、删除数据库）

```typescript
maintain(transaction: Transaction, ...nodeIds: number[]): Request<string | Receipt, PollingResponse>
```

参数说明：

- transaction：参考 `Transaction.SqlBuilder` 的 `freeze`、`unfreeze`、`destroy` 方法，构建交易体；

## 10 DidService

`DidService` 是操作 DID 的总入口。

`DidService` 可以通过 `ServiceManager.getDidService(providerMananger)` 进行创建。

### 10.1 getChainID：查询 ChainID

```typescript
getChainID(...nodeIds: number[]): Request<string>
```

### 10.2 getDIDDocument：查询 DID 文档

```typescript
getDIDDocument(didAddress: string, ...nodeIds: number[]): Request<DidServiceType.Document>
```

参数说明：

- didAddress：DID 账户地址；

### 10.3 getCredentialPrimaryMessage：查询凭证基础信息

```typescript
getCredentialPrimaryMessage(id: string, ...nodeIds: number[]): Request<DidServiceType.Credential>
```

参数说明：

- id：凭证 ID；

### 10.4 checkCredentialValid：检查凭证是否有效

```typescript
checkCredentialValid(id: string, ...nodeIds: number[]): Request<boolean>
```

参数说明：

- id：凭证 ID；

### 10.5 checkCredentialAbandoned：检查凭证是否吊销

```typescript
checkCredentialAbandoned(id: string, ...nodeIds: number[]): Request<boolean>
```

参数说明：

- id：凭证 ID；

### 10.6 setExtra：设置 DID 账户 extra 信息

```typescript
setExtra(transaction: Transaction, ...nodeIds: number[]): Request<string | Receipt, PollingResponse>
```

参数说明：

- transaction：参考 `Transaction.DidBuilder` 的 `setExtra` 方法，构建交易体；

### 10.7 getExtra：查询 DID 账户 extra 信息

```typescript
getExtra(transaction: Transaction, ...nodeIds: number[]): Request<string | Receipt, PollingResponse>
```

参数说明：

- transaction：参考 `Transaction.DidBuilder` 的 `getExtra` 方法，构建交易体；

### 10.8 register：注册 DID 账户

```typescript
register(transaction: Transaction, ...nodeIds: number[]): Request<string | Receipt, PollingResponse>
```

参数说明：

- transaction：参考 `Transaction.DidBuilder` 的 `create` 方法，构建交易体；

### 10.9 freeze：DID 账户解冻

```typescript
freeze(transaction: Transaction, ...nodeIds: number[]): Request<string | Receipt, PollingResponse>
```

参数说明：

- transaction：参考 `Transaction.DidBuilder` 的 `freeze` 方法，构建交易体；

### 10.10 unFreeze：DID 账户解冻

```typescript
unFreeze(transaction: Transaction, ...nodeIds: number[]): Request<string | Receipt, PollingResponse>
```

参数说明：

- transaction：参考 `Transaction.DidBuilder` 的 `unfreeze` 方法，构建交易体；

### 10.11 updatePublicKey：DID 账户公钥更新

```typescript
updatePublicKey(transaction: Transaction, ...nodeIds: number[]): Request<string | Receipt, PollingResponse>
```

参数说明：

- transaction：参考 `Transaction.DidBuilder` 的 `updatePublicKey` 方法，构建交易体；

### 10.12 updateAdmins：DID 账户管理员更新

```typescript
updateAdmins(transaction: Transaction, ...nodeIds: number[]): Request<string | Receipt, PollingResponse>
```

参数说明：

- transaction：参考 `Transaction.DidBuilder` 的 `updateAdmins` 方法，构建交易体；

### 10.13 destroy：DID 账户吊销

```typescript
destroy(transaction: Transaction, ...nodeIds: number[]): Request<string | Receipt, PollingResponse>
```

参数说明：

- transaction：参考 `Transaction.DidBuilder` 的 `destroy` 方法，构建交易体；

### 10.14 uploadCredential：凭证上传

```typescript
uploadCredential(transaction: Transaction, ...nodeIds: number[]): Request<string | Receipt, PollingResponse>
```

参数说明：

- transaction：参考 `Transaction.DidBuilder` 的 `uploadCredential` 方法，构建交易体；

### 10.15 downloadCredential：凭证下载

```typescript
downloadCredential(transaction: Transaction, ...nodeIds: number[]): Request<string | Receipt, PollingResponse>
```

参数说明：

- transaction：参考 `Transaction.DidBuilder` 的 `downloadCredential` 方法，构建交易体；

### 10.16 destroyCredential：凭证吊销

```typescript
destroyCredential(transaction: Transaction, ...nodeIds: number[]): Request<string | Receipt, PollingResponse>
```

参数说明：

- transaction：参考 `Transaction.DidBuilder` 的 `destroyCredential` 方法，构建交易体；

## 11 ContractService

`ContractService` 是访问 `Contract` 的总入口，为用户提供以下服务：

- 部署合约、调用合约、管理合约（升级、冻结、解冻）；
- 查询合约的相关信息；

`ContractService` 可以通过 `ServiceManager.getContractService(providerMananger)` 进行创建。

### 11.1 deploy：部署合约

```typescript
deploy(transaction: Transaction, ...nodeIds: number[]): Request<string | Receipt, PollingResponse>
```

参数说明：

- transaction：参考 `Transaction.HvmBuilder` 的 `deloy` 方法或者 `Transaction.EvmBuilder` 的 `deploy` 方法，构建交易体；

### 11.2 invoke：调用合约

```typescript
invoke(transaction: Transaction, ...nodeIds: number[]): Request<string | Receipt, PollingResponse>
```

参数说明：

- transaction：参考 `Transaction.HvmBuilder` 的 `invoke` 方法或者 `Transaction.EvmBuilder` 的 `invoke` 方法，构建交易体；

### 11.3 maintain：管理合约，包括升级、冻结、解冻

```typescript
maintain(transaction: Transaction, ...nodeIds: number[]): Request<string | Receipt, PollingResponse>
```

参数说明：

- transaction：参考 `Transaction.HvmBuilder` 的 `upgrade` 方法，构建交易体；

### 11.4 manageContractByVote：通过投票管理合约

```typescript
manageContractByVote(transaction: Transaction, ...nodeIds: number[]): Request<string>
```

### 11.5 getDeployedList：获取账户部署的合约地址列表

```typescript
getDeployedList(address: string, ...nodeIds: number[]): Request<string[]>
```

参数说明：

- address：账户地址；

### 11.6 compileContract：编译 Solidity 合约

```typescript
compileContract(code: string, ...nodeIds: number[]): Request<ContractServiceType.CompileCode>
```

参数说明：

- code：solidity 合约源码；

### 11.7 getCode：获取合约源码

```typescript
getCode(address: string, ...nodeIds: number[]): Request<string>
```

参数说明：

- address：合约地址；

### 11.8 getContractCountByAddr：获取账户部署的合约数量

```typescript
getContractCountByAddr(address: string, ...nodeIds: number[]): Request<string>
```

参数说明：

- address：账户地址；

### 11.9 getStatus：获取合约状态

```typescript
getStatus(address: string, ...nodeIds: number[]): Request<string>
```

参数说明：

- address：合约地址；

### 11.10 getCreateTime：获取合约的部署时间

```typescript
getCreateTime(address: string, ...nodeIds: number[]): Request<string>
```

参数说明：

- address：合约地址；

### 11.11 getCreator：获取合约的部署账户

```typescript
getCreator(address: string, ...nodeIds: number[]): Request<string>
```

参数说明：

- address：合约地址；

### 11.12 getStatusByCName：获取合约状态 by cname

```typescript
getStatusByCName(cname: string, ...nodeIds: number[]): Request<string>
```

参数说明：

- cname：合约名；

### 11.13 getCreatorByCName：获取合约的部署账户 by cname

```typescript
getCreatorByCName(cname: string, ...nodeIds: number[]): Request<string>
```

参数说明：

- cname：合约名；

### 11.14 getCreateTimeByCName：获取合约的部署时间 by cname

```typescript
getCreateTimeByCName(cname: string, ...nodeIds: number[]): Request<string>
```

参数说明：

- cname：合约名；

### 11.15 getReceipt：获取交易回执

```typescript
getReceipt(txHash: string, ...nodeIds: number[]): Request<string | Receipt>
```

参数说明：

- txHash：交易 Hash；

## 12 TxService

`TxService` 是访问 `Tx` 的总入口，为用户提供“查询链上执行信息”相关的服务，可查询内容与 LiteSDK 对齐。

`TxService` 可以通过 `ServiceManager.getTxService(providerMananger)` 进行创建。

### 12.1 sendTx：转账交易

```typescript
sendTx(transaction: Transaction, ...nodeIds: number[]): Request<string | Receipt, PollingResponse>
```

### 12.2 getGasPrice

```typescript
getGasPrice(...nodeIds: number[]): Request<number>
```

### 12.3 getTransactionReceipt：查询交易回执信息 by transaction hash

```typescript
getTransactionReceipt(txHash: string, ...nodeIds: number[]): Request<Receipt>
```

参数说明：

- txHash：交易 Hash；

### 12.4 getTx：查询交易 （已弃用）

```typescript
getTx(from: bigint | string, to: bigint | string, ...nodeIds: number[]): Request<TxServiceType.Transaction>
```

参数说明：

- from：区块区间起点；
- to：区块区间终点；

### 12.5 getTxsWithLimit：查询交易 with limit

```typescript
getTxsWithLimit(from: string, to: string, metaData?: TxServiceType.MetaData, ...nodeIds: number[]): Request<PageResult<TxServiceType.Transaction>>
```

参数说明：

- from：区块区间起点；
- to：区块区间终点；
- metaData：分页相关参数；

### 12.6 getInvalidTxsWithLimit：查询非法交易 with limit

```typescript
getInvalidTxsWithLimit(from: bigint | string, to: bigint | string, metaData?: TxServiceType.MetaData, ...nodeIds: number[]): Request<PageResult<TxServiceType.Transaction>>
```

参数说明：

- from：区块区间起点；
- to：区块区间终点；
- metaData：分页相关参数；

### 12.7 getDiscardTx：获取所有的 discard 交易 （已弃用）

```typescript
getDiscardTx(...nodeIds: number[]): Request<TxServiceType.Transaction>
```

### 12.8 getTxByHash：查询交易 by transaction hash

```typescript
getTxByHash(txHash: string, isPrivateTx = false, ...nodeIds: number[]): Request<TxServiceType.Transaction>
```

参数说明：

- txHash：交易哈希；

### 12.9 getTxByBlockHashAndIndex：查询交易 by block hash

```typescript
getTxByBlockHashAndIndex(blockHash: string, idx: number, ...nodeIds: number[]): Request<TxServiceType.Transaction>
```

参数说明：

- blockHash：区块哈希值；
- idx：区块内的交易索引值；

### 12.10 getTxByBlockNumAndIndex：查询交易 by block number

```typescript
getTxByBlockNumAndIndex(blockNumber: number | string, idx: number | string, ...nodeIds: number[]): Request<TxServiceType.Transaction>
```

参数说明：

- blockNumber：区块号；
- idx：区块内的交易索引值；

### 12.11 getTxAvgTimeByBlockNumber：查询指定区块区间交易平均处理时间

```typescript
getTxAvgTimeByBlockNumber(from: bigint | string, to: bigint | string, ...nodeIds: number[]): Request<string>
```

参数说明：

- from：区块区间起点；
- to：区块区间终点；

### 12.12 getTransactionsCount：查询链上所有交易量

```typescript
getTransactionsCount(...nodeIds: number[]): Request<{ count: string; timestamp: number }>
```

### 12.13 getInvalidTransactionsCount：查询链上所有非法交易交易量

```typescript
getInvalidTransactionsCount(...nodeIds: number[]): Request<{ count: string; timestamp: number }>
```

### 12.14 getConfirmedTransactionReceipt：查询上链的交易回执信息

```typescript
getConfirmedTransactionReceipt(txHash: string, ...nodeIds: number[]): Request<Receipt>
```

参数说明：

- txHash：交易哈希；

### 12.15 getTransactionReceiptWithGas：查询交易回执信息 with gas

```typescript
getTransactionReceiptWithGas(txHash: string, ...nodeIds: number[]): Request<Receipt>
```

参数说明：

- txHash：交易哈希；

### 12.16 getBlockTxCountByHash：查询区块交易数量 by block hash

```typescript
getBlockTxCountByHash(blockHash: string, ...nodeIds: number[]): Request<string>
```

参数说明：

- blockHash：区块哈希；

### 12.17 getBlockTxCountByNumber：查询区块交易数量 by block number

```typescript
getBlockTxCountByNumber(blockNumber: string, ...nodeIds: number[]): Request<string>
```

参数说明：

- blockNumber：区块号；

### 12.18 getInvalidTxsByBlockHash：查询一个区块中的所有非法交易 by block hash

```typescript
getInvalidTxsByBlockHash(blockHash: string, ...nodeIds: number[]): Request<TxServiceType.Transaction>
```

参数说明：

- blockHash：区块哈希；

### 12.19 getInvalidTxsByBlockNumber：查询一个区块中的所有非法交易 by block number

```typescript
getInvalidTxsByBlockNumber(blockNumber: string | bigint, ...nodeIds: number[]): Request<TxServiceType.Transaction>
```

参数说明：

- blockNumber：区块号；

### 12.20 getTxVersion：查询平台当前的交易版本号

```typescript
getTxVersion(...nodeIds: number[]): Request<string>
```

`getTxVersion` 接口会在创建 ProviderManager 对象时调用，并设置全局的 TxVersion。

### 12.21 getTransactionsByTimeWithLimit：查询交易 by time with limit

```typescript
getTransactionsByTimeWithLimit(startTime: string | bigint, endTime: string | bigint, metaData?: TxServiceType.MetaData, ...nodeIds: number[]): Request<PageResult<TxServiceType.Transaction>>
```

参数说明：

- startTime：起始时间戳；
- endTime：结束时间戳；
- metaData：条件；

### 12.22 getTransactionsCountByContractAddr：查询区块区间交易数量 by contract address

```typescript
getTransactionsCountByContractAddr(from: string | bigint, to: string | bigint, contractAddress: string, txExtra: boolean, ...nodeIds: number[]): Request<TxServiceType.TxCount>
```

注意：当输入的区块范围较大并且这个范围内符合条件的交易数量非常大时，请求响应延迟将非常高。存在服务器资源被该请求处理长时间占用的风险，应尽量避免使用。

参数说明：

- from：起始区块号；
- to：终止区块号；
- address：合约地址；

### 12.23 getNextPageTransactions：查询下一页交易

```typescript
getNextPageTransactions(blkNumber: string | bigint, txIndex: string | bigint, minBlkNumber: string | bigint, maxBlkNumber: string | bigint, separated: string | bigint, pageSize: string | bigint, containCurrent: boolean, address?: string, cName?: string, ...nodeIds: number[]): Request<TxServiceType.Transaction>
```

注意：当输入的区块范围较大并且这个范围内符合条件的交易数量非常大时，**请求响应延迟将非常高**。存在服务器资源被该请求处理长时间占用的风险，应尽量 避免使用。

参数说明：

- blkNumber：从该区块开始计数；
- txIndex：起始交易在 blkNumber 号区块的位置偏移量；
- minBlkNumber：截止计数的最小区块号；
- maxBlkNumber：截止计数的最大区块号；
- separated：表示要跳过的交易条数（一般用于跳页查询）；
- pageSize：表示要返回的交易条数；
- containCurrent：true 表示返回的结果中包括 blkNumber 区块中位置为 txIndex 的交易，如果该条交易不是合约地址为 address 合约的交易，则不算入；
- address：合约地址；

### 12.24 getNextPageInvalidTransactions：查询下一页非法交易

```typescript
getNextPageInvalidTransactions(blkNumber: string | bigint, txIndex: string | bigint, minBlkNumber: string | bigint, maxBlkNumber: string | bigint, separated: string | bigint, pageSize: string | bigint, containCurrent: boolean, address?: string, cName?: string, ...nodeIds: number[]): Request<TxServiceType.Transaction>
```

注意：当输入的区块范围较大并且这个范围内符合条件的交易数量非常大时，**请求响应延迟将非常高**。存在服务器资源被该请求处理长时间占用的风险，应尽量 避免使用。

参数说明：

- blkNumber：从该区块开始计数；
- txIndex：起始交易在 blkNumber 号区块的位置偏移量；
- minBlkNumber：截止计数的最小区块号；
- maxBlkNumber：截止计数的最大区块号；
- separated：表示要跳过的交易条数（一般用于跳页查询）；
- pageSize：表示要返回的交易条数；
- containCurrent：true 表示返回的结果中包括 blkNumber 区块中位置为 txIndex 的交易，如果该条交易不是合约地址为 address 合约的交易，则不算入；
- address：合约地址；
- nodeIds：说明请求向哪些节点发送；

### 12.25 getPrevPageTransactions：查询上一页交易

```typescript
getPrevPageTransactions(blkNumber: string, txIndex: string, minBlkNumber: string, maxBlkNumber: string, separated: string, pageSize: string, containCurrent: boolean, address?: string, cName?: string, ...nodeIds: number[]): Request<TxServiceType.Transaction>
```

注意：当输入的区块范围较大并且这个范围内符合条件的交易数量非常大时，**请求响应延迟将非常高**。存在服务器资源被该请求处理长时间占用的风险，应尽量避免使用。

参数说明：

- blkNumber：从该区块开始计数；
- txIndex：起始交易在 blkNumber 号区块的位置偏移量；
- minBlkNumber：截止计数的最小区块号；
- maxBlkNumber：截止计数的最大区块号；
- separated：表示要跳过的交易条数（一般用于跳页查询）；
- pageSize：表示要返回的交易条数；
- containCurrent：true 表示返回的结果中包括 blkNumber 区块中位置为 txIndex 的交易，如果该条交易不是合约地址为 address 合约的交易，则不算入；
- address 合约地址；

### 12.26 getTxsCountByTime：查询指定时间区间内的交易数量

```typescript
getTxsCountByTime(startTime: bigint, endTime: bigint, ...nodeIds: number[]): Request<string>
```

注意：当输入的时间范围较大并且这个范围内的区块较多时，请求响应延迟将升高。存在服务器资源被该请求处理长时间占用的风险，应尽量避免使用。

参数说明：

- startTime 起起始时间戳（单位 ns）；
- endTime 结束时间戳（单位 ns）；

### 12.27 getInvalidTxsCountByTime：查询链上指定时间段内的非法交易交易量

```typescript
getInvalidTxsCountByTime(startTime: bigint, endTime: bigint, ...nodeIds: number[]): Request<string>
```

参数说明：

- startTime 开始时间；
- endTime 截止时间；

### 12.28 getTxsByExtraID：查询指定 extraID 的交易 by extraID

```typescript
getTxsByExtraID(mode: number, detail: boolean, metaData: TxServiceType.MetaData, filter: TxServiceType.Filter, ...nodeIds: number[]): Request<PageResult<TxServiceType.Transaction>>
```

该接口只要在访问的节点开启数据索引功能时才可用。

参数：

- mode：表示本次查询请求的查询模式，目前有 0、1、2 三个值可选，默认为 0：
  - 0 表示按序精确查询模式，即筛选出的的交易 extraId 数组的数值和顺序都与查询条件完全一致；
  - 1 表示非按序精确查询模式，即筛选出的交易 extraId 数组包含查询条件里指定的全部数值，顺序无要求；
  - 2 表示非按序匹配查询模式，即筛选出的交易 extraId 数组包含部分或全部查询条件指定的值，且顺序无要求；
- detail：是否返回详细的交易内容，默认为 false；
- metaData：分页相关参数，指定本次查询的起始位置、查询方向以及返回的条数。若未指定，则默认从最新区块开始向前查询，默认返回条数上限是 5000 条；
- filter：指定本次查询过滤条件，包括交易 extraId 和交易接收方地址；

### 12.29 getTxsByFilter： 查询指定 filter 的交易 by filter

```typescript
getTxsByFilter(mode: number, detail: boolean, metaData: TxServiceType.MetaData, filter: TxServiceType.Filter, ...nodeIds: number[]): Request<PageResult<TxServiceType.Transaction>>
```

参数说明：

- mode：表示本次查询请求的查询模式，目前有 0、1 两个值可选，默认为 0：
  - 0 表示多条件与查询模式，即交易对应字段的值与查询条件里所有指定的字段值都完全一致；
  - 1 表示多条件或询模式，即交易对应字段的值至少有一个等于查询条件里指定的字段值；
- detail：是否返回详细的交易内容，默认为 false；
- metaData：指定本次查询的起始位置、查询方向以及返回的条数；若未指定，则默认从最新区块开始向前查询，默认返回条数上限是 5000 条；
- filter：指定本次查询过滤条件；

### 12.30 getTransactionReceiptWithSignature： 查询回执

```typescript
getTransactionReceiptWithSignature(
    txHash: string,
    ...nodeIds: number[]
  ): Request<Receipt>
```

参数说明：

- txHash：交易的哈希, 哈希值为 32 字节的十六进制字符串；
- nodeIds：说明请求向哪些节点发送；

## 13 BlockService

`BlockService` 是访问 `Block` 的总入口，为用户提供“查询区块信息”相关的服务。

`BlockService` 可以通过 `ServiceManager.getBlockService(providerMananger)` 进行创建。

### 13.1 getLatestBlock：查询最新区块信息

```typescript
getLatestBlock(...nodeIds: number[]): Request<BlockServiceType.Block>
```

### 13.2 getBlocks：查询指定区间的区块信息

```typescript
getBlocks(from: string | bigint, to: string | bigint, isPlain = false, ...nodeIds: number[] ): Request<BlockServiceType.Block>
```

### 13.3 getBlocksWithLimit：查询指定区间区块 with limit

```typescript
getBlocksWithLimit(from: string, to: string, isPlain: boolean, ...nodeIds: number[] ): Request<unknown>
```

参数说明：

- from 起始区块号；
- to 终止区块号；
- isPlain (可选)，默认为 false，表示返回的区块包括区块内的交易信息，如果指定为 true，表示返回的区块不包括区块内的交易；

### 13.4 getBlockByHash：查询区块 by block hash

```typescript
getBlockByHash(blockHash: string, isPlain = false, ...nodeIds: number[]): Request<BlockServiceType.Block>
```

### 13.5 getBlockByNum：查询区块 by block number

```typescript
getBlockByNum(blockNumber: bigint | string, isPlain = false, ...nodeIds: number[])
```

### 13.6 getBatchBlocksByStrNum：查询批量区块 by block number list

```typescript
getBatchBlocksByStrNum(blockNumberList: string[], isPlain: boolean, ...nodeIds: number[])
```

### 13.7 getAvgGenerateTimeByBlockNumber：查询区块平均生成时间

```typescript
getAvgGenerateTimeByBlockNumber(from: bigint, to: bigint, ...nodeIds: number[])
```

参数说明：

- from：起始区块号；
- to：终止区块号；

### 13.8 getBlocksByTime：查询指定时间区间内的区块数量

```typescript
getBlocksByTime(startTime: bigint, endTime: bigint, ...nodeIds: number[] ): Request<{ sumOfBlocks: string; startBlock: string; endBlock: string }>
```

注意：当输入的时间范围较大时，请求响应延迟将升高。存在服务器资源被该请求处理长时间占用的风险，应尽量避免使用此接口。

参数说明：

- startTime：起始时间戳（单位 ns）；
- endTime：结束时间戳（单位 ns）；

### 13.9 getChainHeight：查询最新区块号，即链高

```typescript
getChainHeight(...nodeIds: number[]): Request<string>
```

### 13.10 getGenesisBlock：查询创世区块号

```typescript
getGenesisBlock(...nodeIds: number[]): Request<string>
```

## 14 NodeService

`NodeService` 是访问 `Node` 的总入口，为用户提供“查询节点信息”相关的服务。

`NodeService` 可以通过 `ServiceManager.getNodeService(providerMananger)` 进行创建。

### 14.1 getNodes：获取节点信息

```typescript
getNodes(...nodeIds: number[]): Request<NodeServiceType.Node[]>
```

### 14.2 getNodeStates：获取节点状态信息

```typescript
getNodeStates(...nodeIds: number[]): Request<NodeServiceType.NodeState[]>
```

### 14.3 getNodeHash：获取节点哈希

```typescript
getNodeHash(...nodeIds: number[]): Request<string>
```

### 14.4 getNodeHashByID：获取节点哈希

```typescript
getNodeHashByID(nodeId: number): Request<string>
```

参数说明：

- nodeId：节点 ID；

## 15 VersionService

`VersionService` 为用户提供“查询版本”相关的服务。

`VersionService` 可以通过 `ServiceManager.getVersionService(providerMananger)` 进行创建。

### 15.1 setSupportedVersion：二进制版本上链

```
setSupportedVersion(...nodeIds: number[]): Request<string | Receipt, PollingResponse>
```

接口描述：

让接收该请求的节点构造一笔交易将节点二进制支持的版本信息上链。该交易实质上由节点账户发起，其他普通账户无法构造。用户再根据接口返回的交易哈希查询交易回执，来确认版本上链是否成功。版本上链的目的是将节点支持的版本信息（SupportedVersion）上链，由内置合约计算出共识网络里的所有节点共有的、大于当前运行版本的版本号有哪些，用于指导下一次系统升级。

参数说明：

- nodeIds：接收这次请求的节点 id 号，接收该请求的节点将进行版本上链；

### 15.2 getVersions：查询链运行版本信息

```typescript
getVersions(...nodeIds: number[]): Request<VersionServiceType.VersionResult>
```

接口描述：

从节点本地账本里查询当前运行版本 RunningVersion 以及可用于下一次升级的版本 AvailableVersion。

在进行系统升级之前，通常需要先调用该接口来查询目前链可以升级到的目标版本有哪些。为了便于客户端理解与使用，本接口对 tx version、block version 等链级细分版本做了一层映射，映射到了一个大的版本号里，比如 ”2.9.0”，”2.10.0”。下面用一个 JSON-RPC 请求为例，结果表示 Hyperchain ”2.10.0” 支持的最大交易版本为 4.1。通过版本映射，用户只需要关心 Hyperchain 版本号，无需关心该版本号下面的细分链级版本内容。

### 15.3 getSupportedVersionByHostname：查询节点支持的版本信息

```typescript
getSupportedVersionByHostname(hostname: string, ...nodeIds: number[]): Request<VersionServiceType.SupportedVersion>
```

接口描述：

从节点本地账本里查询指定节点可以支持的版本信息。比如可以支持的区块版本有哪些、可以支持的交易版本有哪些。

_注意：该接口不会生成新的交易，是从节点本地账本里直接查询数据。如果查询节点账本落后，则本地账本不是链最新数据。如果要保证获取的是最新数据，请从 BVM 系统升级版本管理内置合约`VersionContract GetSupportedVersionByHostname()`方法查询。_

### 15.4 getHyperchainVersionFromBin：查询 Hyperchain 版本对应的链级细分版本

```typescript
getHyperchainVersionFromBin(hyperchainVersion: string, ...nodeIds: number[]): Request<VersionServiceType.ChainVersion>
```

接口描述：

从接收请求的节点查询指定 Hyperchain 版本支持的链级细分版本的最大版本号。

_注意：该接口只是从接收请求的节点二进制里获取这些信息，并不是从账本中查询，结果取决于接收请求节点的二进制版本。_

## 16 ConfigService

### 16.1 getProposal：查询提案

```
getProposal(...nodeIds: number[]): Request<ConfigServiceType.Proposal>
```

参数说明：

- nodeIds：请求向哪些节点发送；

### 16.2 getConfig：查询配置

```
getConfig(...nodeIds: number[]): Request<string>
```

参数说明：

- nodeIds：请求向哪些节点发送；

### 16.3 getGenesisInfo

```
getGenesisInfo(...nodeIds: number[]): Request<string>
```

### 16.4 getHosts：查询连接的节点信息

```
getHosts(role: string, ...nodeIds: number[]): Request<Record<string, string>>
```

参数说明：

- role：节点角色（目前只支持查询vp节点）；
- nodeIds：请求向哪些节点发送；

### 16.5 getVSet：查询参与共识的节点信息

```
getVSet(...nodeIds: number[]): Request<string>
```

参数说明：

- nodeIds：请求向哪些节点发送；

### 16.6 getAllRoles：查询所以角色信息

```
getAllRoles(...nodeIds: number[]): Request<Record<string, number>>
```

参数说明：

- nodeIds：请求向哪些节点发送；

### 16.7 isRoleExist：查询角色是否存在

```
isRoleExist(role: string, ...nodeIds: number[]): Request<boolean>
```

参数说明：

- role：要查询的角色名称；
- nodeIds：请求向哪些节点发送；

### 16.8 getNameByAddress：根据合约地址查询合约命名

```
getNameByAddress(address: string, ...nodeIds: number[]): Request<string>
```

参数说明：

- address：合约地址；
- nodeIds：请求向哪些节点发送；

### 16.9 getAddressByName：根据合约命名查询合约地址

```
getAddressByName(name: string, ...nodeIds: number[]): Request<string>
```

参数说明：

- name：合约命名；
- nodeIds：请求向哪些节点发送；

### 16.10 getAllCNS：查询所有合约地址到合约命名的映射关系

```
getAllCNS(...nodeIds: number[]): Request<Record<string, string>>
```

参数说明：

- nodeIds：请求向哪些节点发送；
