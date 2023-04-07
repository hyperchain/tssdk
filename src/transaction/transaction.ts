import AbiCoder from "web3-eth-abi";
import { Account, DidAccount, AggSigner } from "../account";
import DidDocument from "./did/document";
import DidPublicKey from "./did/public-key";
import {
  ByteUtil,
  NumUtil,
  StringUtil,
  VmType,
  JSONBigintUtil,
  EncodeUtil,
  InvokeParams,
  EvmType,
  BvmOperation,
  BvmType,
} from "../common";
import { LONG_MAX_VALUE } from "../common/constant";
import { ArgEmptyError, ArgError, PropertyEmptyError, PropertyError } from "../common";
import { ProviderManager } from "../provider";
import Participant from "./participant";
import TxVersion from "./tx-version";
import { DidCredential } from "./index";

export default class Transaction {
  public static readonly DEFAULT_GAS_LIMIT: bigint = BigInt(1000000000);
  public static readonly DEFAULT_GAS_LIMIT_FLATO = 10000000;
  private static readonly EXTRAID_STRING_MAX_LENGTH = 1024;
  private static readonly EXTRAID_LIST_MAX_LENGTH = 30;

  // maintain opcode const
  public static readonly UPDATE = 1;
  public static readonly FREEZE = 2;
  public static readonly UNFREEZE = 3;
  public static readonly DESTROY = 5;

  public static readonly DID_REGISTER = 200;
  public static readonly DID_FREEZE = 201;
  public static readonly DID_UNFREEZE = 202;
  public static readonly DID_ABANDON = 203;
  public static readonly DID_UPDATEPUBLICKEY = 204;
  public static readonly DID_UPDATEADMINS = 205;
  public static readonly DIDCREDENTIAL_UPLOAD = 206;
  public static readonly DIDCREDENTIAL_DOWNLOAD = 207;
  public static readonly DIDCREDENTIAL_ABANDON = 208;
  public static readonly DID_SETEXTRA = 209;
  public static readonly DID_GETEXTRA = 210;

  public static readonly DEFAULT_EXPIRATION_TIME: bigint = BigInt(5 * 60 * 1000 * 1000000);
  public static readonly MAX_EXPIRATION_TIME = LONG_MAX_VALUE;
  public static readonly MAX_GAS_PRICE = LONG_MAX_VALUE;

  public static Builder: typeof Builder;
  public static HVMBuilder: typeof HVMBuilder;
  public static EVMBuilder: typeof EVMBuilder;
  public static BVMBuilder: typeof BVMBuilder;
  public static DidBuilder: typeof DidBuilder;
  public static SqlBuilder: typeof SqlBuilder;

  private from?: string;
  private to: string;
  private payload?: string;
  private value: number;
  private simulate: boolean;
  private vmType?: VmType;
  private opCode: number;
  private extra?: string;
  private timestamp?: bigint;
  private nonce?: bigint;
  private extraIdLong?: bigint[];
  private extraIdString?: string[];
  private signature?: string;
  private needHashString?: string;
  private contractName?: string;
  private txVersion?: TxVersion;
  private gasPrice?: bigint;
  private gasLimit: bigint;
  private expirationTimestamp?: bigint;
  private participant?: Participant;

  public constructor() {
    this.to = "0x0";
    this.value = 0;
    this.opCode = 0;
    this.gasLimit = Transaction.DEFAULT_GAS_LIMIT;
    this.simulate = false;
  }

  public sign(account: Account): void {
    if (this.from == null) {
      this.setFrom(account.getAddress());
    }
    if (this.timestamp == null) {
      const timestamp = BigInt(new Date().getTime() * 1e6);
      this.setTimestamp(timestamp);
    }
    if (this.expirationTimestamp == null) {
      this.setExpirationTimestamp(this.timestamp! + Transaction.DEFAULT_EXPIRATION_TIME);
    }
    if (this.nonce == null) {
      this.setNonce(getRandNonce());
    }
    this.setNeedHashString();
    const needHashString = this.getNeedHashString();
    if (needHashString == null) {
      throw new PropertyEmptyError("needHashString");
    }
    this.setSignature(account.sign(needHashString));
  }

  public commonParam(): any {
    let param: any = {
      from: this.getFrom(),
      to: this.getTo(),
      timestamp: this.getTimestamp(),
      nonce: this.getNonce(),
      type: this.getVmType(),
      opCode: this.getOpCode(),
    };
    const payload = this.getPayload();
    if (!StringUtil.isBlank(payload)) {
      param = {
        ...param,
        payload,
      };
    } else {
      param = {
        ...param,
        value: this.getValue(),
      };
    }

    const extra = this.getExtra();
    if (!StringUtil.isBlank(extra)) {
      param = {
        ...param,
        extra,
      };
    }

    const extraIdInt64 = this.getExtraIdLong();
    if (extraIdInt64 != null && extraIdInt64.length > 0) {
      param = {
        ...param,
        extraIdInt64,
      };
    }
    const extraIdString = this.getExtraIdString();
    if (extraIdString != null && extraIdString.length > 0) {
      param = {
        ...param,
        extraIdString,
      };
    }
    const cname = this.getContractName();
    if (!StringUtil.isBlank(cname)) {
      param = {
        ...param,
        cname,
      };
    }
    if (this.participant != null) {
      param = {
        ...param,
        participant: this.participant.encodeBase64(),
      };
    }
    param = {
      ...param,
      simulate: this.isSimulate(),
      signature: this.getSignature(),
      gasPrice: this.getGasPrice(),
      gasLimit: this.getGasLimit(),
      expirationTimestamp: this.getExpirationTimestamp(),
      version: this.getTxVersion()?.getVersion(),
    };
    return param;
  }

  public static toJson(transaction: Transaction): string {
    return JSONBigintUtil.stringify(transaction.commonParam());
  }

  public static fromJson(transactionStr: string) {
    const transactionTmp = JSONBigintUtil.parse(transactionStr) as any;
    const transaction = new Transaction();

    if (transactionTmp?.from != null) {
      transaction.setFrom(transactionTmp.from);
    }
    if (transactionTmp?.to != null) {
      transaction.setTo(transactionTmp.to);
    }
    if (transactionTmp?.payload != null) {
      transaction.setPayload(transactionTmp.payload);
    }
    if (transactionTmp?.value != null) {
      transaction.setValue(transactionTmp.value);
    }
    if (transactionTmp?.simulate != null) {
      transaction.setSimulate(transactionTmp.simulate);
    }
    if (transactionTmp?.type != null) {
      transaction.setVmType(transactionTmp.type);
    }
    if (transactionTmp?.opCode != null) {
      transaction.setOpCode(transactionTmp.opCode);
    }
    if (transactionTmp?.extra != null) {
      transaction.setExtra(transactionTmp.extra);
    }
    if (transactionTmp?.timestamp != null) {
      transaction.setTimestamp(transactionTmp.timestamp);
    }
    if (transactionTmp?.nonce != null) {
      transaction.setNonce(transactionTmp.nonce);
    }
    if (transactionTmp?.extraIdInt64 != null) {
      transaction.setExtraIdLong(transactionTmp.extraIdInt64);
    }
    if (transactionTmp?.extraIdString != null) {
      transaction.setExtraIdString(transactionTmp.extraIdString);
    }
    if (transactionTmp?.contractName != null) {
      transaction.setContractName(transactionTmp.contractName);
    }
    if (transactionTmp?.version != null) {
      if (typeof transactionTmp.version === "string") {
        transaction.setTxVersion(TxVersion.convertTxVersion(transactionTmp.version));
      } else {
        transaction.setTxVersion(transactionTmp.version);
      }
    }
    if (transactionTmp?.gasPrice != null) {
      transaction.setGasPrice(transactionTmp.gasPrice);
    }
    if (transactionTmp?.gasLimit != null) {
      transaction.setGasLimit(transactionTmp.gasLimit);
    }
    if (transactionTmp?.expirationTimestamp != null) {
      transaction.setExpirationTimestamp(transactionTmp.expirationTimestamp);
    }
    if (transactionTmp?.participant != null) {
      const { initiator, withholding } = transactionTmp.participant;
      if (initiator == null || withholding == null || typeof initiator !== "string") {
        throw new ArgError("participant is invalid");
      }
      transaction.setParticipant(Participant.parseBase64(initiator, withholding));
    }
    // if (transactionTmp?.signature != null) {
    //   transaction.setSignature(transactionTmp.from);
    // }
    // if (transactionTmp?.needHashString != null) {
    //   transaction.setNeedHashString();
    // }
    return transaction;
  }

  public toJson(): string {
    return Transaction.toJson(this);
  }

  public getFrom(): string {
    if (this.from == null || this.from === "") {
      throw new PropertyEmptyError("from");
    }
    return this.from;
  }

  public setFrom(from: string): void {
    this.from = DidAccount.convertDIDAddrToHex(from);
  }

  public getTo(): string {
    if (this.to === "") {
      throw new PropertyEmptyError("from");
    }
    return this.to;
  }

  public setTo(to: string): void {
    this.to = DidAccount.convertDIDAddrToHex(to);
  }

  public getPayload(): string | undefined {
    return this.payload;
  }

  public setPayload(payload: string): void {
    this.payload = StringUtil.toStartWith0x(payload);
  }

  public getValue(): number {
    return this.value;
  }

  public setValue(value: number): void {
    this.value = value;
  }

  public isSimulate(): boolean {
    return this.simulate;
  }

  public setSimulate(simulate: boolean): void {
    this.simulate = simulate;
  }

  public getVmType(): VmType | undefined {
    return this.vmType;
  }

  public setVmType(vmType: VmType): void {
    this.vmType = vmType;
  }

  public getOpCode(): number {
    return this.opCode;
  }

  public setOpCode(opCode: number): void {
    this.opCode = opCode;
  }

  public getExtra(): string | undefined {
    return this.extra;
  }

  public setExtra(extra: string): void {
    this.extra = extra;
  }

  public getTimestamp(): bigint | undefined {
    return this.timestamp;
  }

  public setTimestamp(timestamp: bigint): void {
    this.timestamp = timestamp;
  }

  public getNonce(): bigint | undefined {
    return this.nonce;
  }

  public setNonce(nonce: bigint): void {
    this.nonce = nonce;
  }

  public getExtraIdLong(): bigint[] | undefined {
    return this.extraIdLong;
  }

  public setExtraIdLong(extraIdLong: bigint[]): void {
    this.extraIdLong = extraIdLong;
  }

  public getExtraIdString(): string[] | undefined {
    return this.extraIdString;
  }

  public setExtraIdString(extraIdString: string[]): void {
    this.extraIdString = extraIdString;
  }

  public getSignature(): string | undefined {
    return this.signature;
  }

  public setSignature(signature: string): void {
    if (this.isDIDParticipant()) {
      const signatureTmp = ByteUtil.fromHex(signature);
      signatureTmp[0] = AggSigner.DIDAggFlag[0];
      signature = ByteUtil.toHex(signatureTmp);
    }
    this.signature = signature;
  }

  public getNeedHashString(): string | undefined {
    return this.needHashString;
  }

  public setNeedHashString(): void {
    let query: { [key: string]: string };

    const txVersion = this.getTxVersion();
    const from = this.getFrom();
    const to = this.getTo();
    const value = this.getValue();
    const payloadThis = this.getPayload();
    const payload = StringUtil.isBlank(payloadThis) ? "0x0" : payloadThis!;
    const timestamp = this.getTimestamp();
    const nonce = this.getNonce();
    const opcode = this.getOpCode();
    const extra = this.getExtra() || "";
    const vmtype = this.getVmType();
    const cname = this.getContractName() || "";
    const price = this.getGasPrice();
    const gasLimit = this.getGasLimit();
    const expirationTimestamp = this.getExpirationTimestamp();

    if (txVersion == null) {
      throw new PropertyEmptyError("txVersion");
    }
    if (timestamp == null) {
      throw new PropertyEmptyError("timestamp");
    }
    if (nonce == null) {
      throw new PropertyEmptyError("nonce");
    }
    if (vmtype == null) {
      throw new PropertyEmptyError("vmType");
    }
    if (price == null) {
      throw new PropertyEmptyError("gasPrice");
    }
    if (expirationTimestamp == null) {
      throw new PropertyEmptyError("expirationTimestamp");
    }

    if (txVersion.isGreaterOrEqual(TxVersion.TxVersion20)) {
      query = {
        from: StringUtil.toStartWith0x(from, { toLowerCase: true }),
        to: StringUtil.toStartWith0x(to, { toLowerCase: true }),
        value: NumUtil.toHex(value, {
          startsWith0x: true,
        }),
        payload: StringUtil.toStartWith0x(payload, {
          toLowerCase: true,
        }),
        timestamp: NumUtil.toHex(timestamp, { startsWith0x: true }),
        nonce: NumUtil.toHex(nonce, {
          startsWith0x: true,
        }),
        opcode: NumUtil.toHex(opcode),
        extra,
        vmtype,
        version: txVersion.getVersion(),
      };
      if (txVersion.isGreaterOrEqual(TxVersion.TxVersion21)) {
        query = {
          ...query,
          extraid: buildExtraId(this),
        };
      }
      if (txVersion.isGreaterOrEqual(TxVersion.TxVersion22)) {
        query = {
          ...query,
          cname,
        };
      }
      if (txVersion.isGreaterOrEqual(TxVersion.TxVersion36)) {
        query = {
          ...query,
          price: NumUtil.toHex(price, { startsWith0x: true }),
          gasLimit: NumUtil.toHex(gasLimit, { startsWith0x: true }),
          expirationTimestamp: NumUtil.toHex(expirationTimestamp, {
            startsWith0x: true,
          }),
        };
        if (this.participant == null) {
          query = {
            ...query,
            initiator: "",
            withholding: "",
          };
        } else {
          const withholdingValue = this.participant
            .getWithholding()
            .map((w) => DidAccount.convertDIDAddrToHex(w))
            .join(",");
          query = {
            ...query,
            initiator: DidAccount.convertDIDAddrToHex(this.participant.getInitiator()),
            withholding: `[${withholdingValue}]`,
          };
        }
      }
    } else {
      // hyperchain
      const v: string = this.payload ? NumUtil.toHex(value) : payloadThis || "";
      query = {
        from: StringUtil.toStartWith0x(from, { toLowerCase: true }),
        to: StringUtil.toStartWith0x(to, { toLowerCase: true }),
        value: v,
        timestamp: NumUtil.toHex(timestamp, { startsWith0x: true }),
        nonce: NumUtil.toHex(nonce, {
          startsWith0x: true,
        }),
        opcode: NumUtil.toHex(this.opCode),
        extra,
        vmtype,
      };
    }

    // 最后结果
    this.needHashString = Object.entries(query)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    function buildExtraId(transaction: Transaction): string {
      let extraIds: (bigint | string)[] = [];
      const extraIdLong = transaction.getExtraIdLong();
      if (extraIdLong != null) {
        extraIds = [...extraIds, ...extraIdLong];
      }
      const extraString = transaction.getExtraIdString();
      if (extraString != null) {
        for (let i = 0; i < extraString.length; i += 1) {
          if (extraString[i].length > Transaction.EXTRAID_STRING_MAX_LENGTH) {
            throw new PropertyError(
              "extraID string exceed the EXTRAID_STRING_MAX_LENGTH " +
                Transaction.EXTRAID_STRING_MAX_LENGTH
            );
          }
          extraIds.push(extraIds[i]);
        }
      }
      if (extraIds.length > Transaction.EXTRAID_LIST_MAX_LENGTH) {
        throw new PropertyError(
          "extraID list exceed EXTRAID_LIST_MAX_LENGTH " + Transaction.EXTRAID_LIST_MAX_LENGTH
        );
      }
      if (extraIds.length === 0) {
        return "";
      }
      return JSONBigintUtil.stringify(extraIds);
    }
  }

  private isDIDParticipant(): boolean {
    if (this.participant == null) {
      return false;
    }
    return [this.participant.getInitiator(), ...this.participant.getWithholding()].some((v) =>
      DidAccount.isDID(v)
    );
  }

  public getContractName(): string | undefined {
    return this.contractName;
  }

  public setContractName(contractName: string): void {
    this.contractName = contractName;
  }

  public getTxVersion(): TxVersion | undefined {
    return this.txVersion;
  }

  public setTxVersion(txVersion: TxVersion): void {
    this.txVersion = txVersion;
  }

  public getGasPrice(): bigint | undefined {
    return this.gasPrice;
  }

  public setGasPrice(gasPrice: bigint): void {
    this.gasPrice = gasPrice;
  }

  public getGasLimit(): bigint {
    return this.gasLimit;
  }

  public setGasLimit(gasLimit: bigint): void {
    this.gasLimit = gasLimit;
  }

  public getExpirationTimestamp(): bigint | undefined {
    return this.expirationTimestamp;
  }

  public setExpirationTimestamp(expirationTimestamp: bigint): void {
    this.expirationTimestamp = expirationTimestamp;
  }

  public getParticipant(): Participant | undefined {
    return this.participant;
  }

  public setParticipant(participant: Participant): void {
    this.participant = participant;
  }
}

class Builder {
  transaction: Transaction;

  constructor(from: string, providerManager: ProviderManager);
  constructor(from: string, gasPrice: bigint, txVersion: TxVersion);
  constructor(param1: string, param2: ProviderManager | bigint, param3?: TxVersion) {
    const from = param1;
    this.transaction = new Transaction();
    this.transaction.setFrom(from);
    this.transaction.setVmType(VmType.EVM);

    let gasPrice: bigint | undefined;
    let txVersion: TxVersion | undefined;
    if (typeof param2 === "bigint" && param3 != null) {
      gasPrice = param2;
      txVersion = param3;
    } else {
      const providerManager = param2 as ProviderManager;
      gasPrice = providerManager.getGasPrice();
      txVersion = providerManager.getTxVersion();
    }
    if (gasPrice == null) {
      throw new ArgEmptyError("gasPrice");
    }
    if (txVersion == null) {
      throw new ArgEmptyError("txVersion");
    }
    this.transaction.setGasPrice(gasPrice);
    this.transaction.setTxVersion(txVersion);
  }

  public simulate(): Builder {
    this.transaction.setSimulate(true);
    return this;
  }

  public extra(extra: string): Builder {
    this.transaction.setExtra(extra);
    return this;
  }

  public extraIdLong(...extraIdLong: bigint[]): Builder {
    this.transaction.setExtraIdLong(extraIdLong);
    return this;
  }

  public extraIdString(...extraIdString: string[]): Builder {
    this.transaction.setExtraIdString(extraIdString);
    return this;
  }

  public async upgrade(contractAddress: string, payload: string): Promise<Builder> {
    this.transaction.setPayload(payload);
    this.transaction.setTo(contractAddress);
    this.transaction.setOpCode(Transaction.UPDATE);
    return this;
  }

  public contractName(contractName: string): Builder {
    this.transaction.setContractName(contractName);
    this.transaction.setTo("0x0000000000000000000000000000000000000000");
    return this;
  }

  public freeze(contractAddress: string): Builder {
    this.transaction.setOpCode(Transaction.FREEZE);
    this.transaction.setTo(contractAddress);
    return this;
  }

  public unfreeze(contractAddress: string): Builder {
    this.transaction.setOpCode(Transaction.UNFREEZE);
    this.transaction.setTo(contractAddress);
    return this;
  }

  public destroy(contractAddress: string): Builder {
    this.transaction.setOpCode(Transaction.DESTROY);
    this.transaction.setTo(contractAddress);
    return this;
  }

  public vmType(vmType: VmType): Builder {
    this.transaction.setVmType(vmType);
    return this;
  }

  public gasPrice(gasPrice: bigint): Builder {
    this.transaction.setGasPrice(gasPrice);
    return this;
  }

  public gasLimit(gasLimit: bigint): Builder {
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

  public invokeContractAddr(contractAddress: string, isDid: boolean, chainId?: string): Builder {
    if (isDid && !this.transaction.getTxVersion()?.isGreaterOrEqual(TxVersion.TxVersion41)) {
      if (chainId == undefined) {
        throw new ArgEmptyError("chainId");
      }
      const didContractAddress = `${DidAccount.DID_PREFIX}${chainId}:${contractAddress}`;
      this.transaction.setTo(didContractAddress);
    } else {
      this.transaction.setTo(contractAddress);
    }
    return this;
  }

  public transfer(to: string, value: number): Builder {
    this.transaction.setTo(to);
    this.transaction.setValue(value);
    this.transaction.setVmType(VmType.TRANSFER);
    return this;
  }

  public build(): Transaction {
    const timestamp = BigInt(new Date().getTime() * 1e6);
    this.transaction.setTimestamp(timestamp);
    if (this.transaction.getExpirationTimestamp() == null) {
      this.transaction.setExpirationTimestamp(timestamp + Transaction.DEFAULT_EXPIRATION_TIME);
    }
    this.transaction.setNonce(getRandNonce());
    this.transaction.setNeedHashString();
    return this.transaction;
  }
}

class HVMBuilder extends Builder {
  constructor(from: string, providerManager: ProviderManager);
  constructor(from: string, gasPrice: bigint, txVersion: TxVersion);
  constructor(param1: string, param2: ProviderManager | bigint, param3?: TxVersion) {
    if (typeof param2 === "bigint" && param3 != null) {
      super(param1, param2, param3);
    } else {
      super(param1, param2 as ProviderManager);
    }
    this.transaction.setVmType(VmType.HVM);
  }

  public async deploy(file: ArrayBuffer): Promise<Builder> {
    const payload = await EncodeUtil.encodeDeployJar(file, this.transaction.getTxVersion()!);
    this.transaction.setTo("0x0");
    this.transaction.setPayload(payload);
    return this;
  }

  public async upgrade(contractAddress: string, file: string): Promise<Builder>;
  public async upgrade(contractAddress: string, file: ArrayBuffer): Promise<Builder>;
  public async upgrade(contractAddress: string, file: ArrayBuffer | string): Promise<Builder> {
    if (typeof file === "string") {
      super.upgrade(contractAddress, file);
      return this;
    }
    const payload = await EncodeUtil.encodeDeployJar(file, this.transaction.getTxVersion()!);
    this.transaction.setTo(contractAddress);
    this.transaction.setPayload(payload);
    this.transaction.setOpCode(Transaction.UPDATE);
    return this;
  }

  public invoke(contractAddress: string, invokeParams: InvokeParams): Builder;
  public invoke(
    contractAddress: string,
    invokeParams: InvokeParams,
    isDid: boolean,
    chainId: string
  ): Builder;
  public invoke(
    contractAddress: string,
    invokeParams: InvokeParams,
    isDid = false,
    chainId?: string
  ): Builder {
    const payload = invokeParams.getParams();
    if (payload == null) {
      throw new ArgEmptyError("invokeParams");
    }
    this.transaction.setPayload(payload);
    if (chainId == null) {
      return this.invokeContractAddr(contractAddress, isDid);
    } else {
      return this.invokeContractAddr(contractAddress, isDid, chainId);
    }
  }
}

class EVMBuilder extends Builder {
  constructor(from: string, providerManager: ProviderManager);
  constructor(from: string, gasPrice: bigint, txVersion: TxVersion);
  constructor(param1: string, param2: ProviderManager | bigint, param3?: TxVersion) {
    if (typeof param2 === "bigint" && param3 != null) {
      super(param1, param2, param3);
    } else {
      super(param1, param2 as ProviderManager);
    }
    this.transaction.setVmType(VmType.EVM);
  }

  public deploy(bin: string | ArrayBuffer | Uint8Array): Builder;
  public deploy(
    bin: string | ArrayBuffer | Uint8Array,
    abi: string | ArrayBuffer | Uint8Array,
    params: any[]
  ): Builder;
  public deploy(
    bin: string | ArrayBuffer | Uint8Array,
    abi?: string | ArrayBuffer | Uint8Array,
    params?: any[]
  ) {
    this.transaction.setTo("0x0");
    let payload = typeof bin === "string" ? bin : ByteUtil.toString(bin);
    if (abi != null && params != null) {
      const abiStr = typeof abi === "string" ? abi : ByteUtil.toString(abi);
      const abiJson = JSON.parse(abiStr) as EvmType.AbiItem[];
      const constructor = abiJson.find((abi) => abi.type === "constructor");
      if (constructor == null) {
        throw new ArgError("abi file is error(can't find constructor)!");
      }
      const inputTypes = constructor.inputs?.map((input) => input.type) || [];
      const encodedParameter = AbiCoder.encodeParameters(inputTypes, params);
      payload += StringUtil.toStartWithout0x(encodedParameter);
    }
    this.transaction.setPayload(payload);
    return this;
  }

  public invoke(
    contractAddress: string,
    methodName: string,
    abi: string | ArrayBuffer | Uint8Array,
    params: any[]
  ): Builder;
  public invoke(
    contractAddress: string,
    methodName: string,
    abi: string | ArrayBuffer | Uint8Array,
    params: any[],
    isDid: boolean,
    chainId: string
  ): Builder;
  public invoke(
    contractAddress: string,
    methodName: string,
    abi: string | ArrayBuffer | Uint8Array,
    params: any[],
    isDid?: boolean,
    chainId?: string
  ): Builder {
    const abiStr = typeof abi === "string" ? abi : ByteUtil.toString(abi);
    const abiJson = JSON.parse(abiStr) as EvmType.AbiItem[];

    const abiItem = abiJson.find(
      ({ name, inputs }) =>
        `${name}(${inputs != null ? inputs.map(({ type }) => type).join(",") : ""})` === methodName
    );

    if (abiItem == null) {
      throw new ArgError(`can't find ${methodName} from abi!`);
    }
    const encodedFunction = AbiCoder.encodeFunctionCall(abiItem, params);
    this.transaction.setPayload(encodedFunction);
    if (isDid != null && chainId != null) {
      return this.invokeContractAddr(contractAddress, isDid, chainId);
    }
    return this.invokeContractAddr(contractAddress, false);
  }

  public transfer(to: string, value: number): EVMBuilder {
    this.transaction.setTo(to);
    this.transaction.setValue(value);
    return this;
  }
}

class BVMBuilder extends Builder {
  constructor(from: string, providerManager: ProviderManager);
  constructor(from: string, gasPrice: bigint, txVersion: TxVersion);
  constructor(param1: string, param2: ProviderManager | bigint, param3?: TxVersion) {
    if (typeof param2 === "bigint" && param3 != null) {
      super(param1, param2, param3);
    } else {
      super(param1, param2 as ProviderManager);
    }
    this.transaction.setVmType(VmType.BVM);
  }

  /**
   * invoke BVM contract for builtin operation.
   */
  public invoke(opt: BvmOperation.Builtin): BVMBuilder;
  /**
   * invoke BVM contract for builtin operation.
   */
  public invoke(opt: BvmOperation.Builtin, isDid: boolean, chainId?: string): BVMBuilder;
  /**
   * invoke BVM contract whit specific method and params.
   */
  public invoke(contractAddress: string, methodName: string, ...params: string[]): BVMBuilder;

  public invoke(a: string | BvmOperation.Builtin, b?: boolean | string, c?: string | string[]) {
    if (typeof a === "string") {
      const contractAddress = a;
      const methodName = b as string;
      const params = c as string[];
      this.transaction.setTo(contractAddress);
      const payload: string = EncodeUtil.encodeBVM(methodName, ...params);
      this.transaction.setPayload(payload);
    } else if (typeof b === "boolean") {
      const opt = a as BvmOperation.Builtin;
      const isDid = b;
      const chainId = c as string | undefined;
      if (BVMBuilder.isSystemOpt(opt)) {
        this.transaction.setGasPrice(Transaction.MAX_GAS_PRICE);
        this.transaction.setExpirationTimestamp(BigInt(Transaction.MAX_EXPIRATION_TIME));
      }
      this.transaction.setPayload(ByteUtil.toHex(EncodeUtil.encodeOperation(opt)));
      return this.invokeContractAddr(opt.getAddress()!, isDid, chainId);
    } else {
      const opt = a as BvmOperation.Builtin;
      this.invoke(opt, false, undefined);
    }
    return this;
  }

  private static isSystemOpt(opt: BvmOperation.Builtin): boolean {
    if (
      opt instanceof BvmOperation.Proposal ||
      opt instanceof BvmOperation.Account ||
      opt instanceof BvmOperation.HashChange ||
      opt instanceof BvmOperation.Balance ||
      opt instanceof BvmOperation.DID
    ) {
      return true;
    }
    if (opt instanceof BvmOperation.RootCA) {
      return opt.getMethod() === BvmType.ContractMethod.RootCAAdd;
    }
    return false;
  }
}

class DidBuilder extends Builder {
  constructor(from: string, providerManager: ProviderManager);
  constructor(from: string, gasPrice: bigint, txVersion: TxVersion);
  constructor(param1: string, param2: ProviderManager | bigint, param3?: TxVersion) {
    if (typeof param2 === "bigint" && param3 != null) {
      super(param1, param2, param3);
    } else {
      super(param1, param2 as ProviderManager);
    }
    this.transaction.setVmType(VmType.TRANSFER);
  }

  public create(didDocument: DidDocument): Builder {
    this.transaction.setTo(this.transaction.getFrom());
    const payload: string = JSON.stringify(didDocument);
    this.transaction.setPayload(StringUtil.toHex(payload));
    this.transaction.setOpCode(Transaction.DID_REGISTER);
    return this;
  }

  public freeze(to: string): Builder {
    this.transaction.setOpCode(Transaction.DID_FREEZE);
    this.transaction.setTo(to);
    return this;
  }

  public unfreeze(to: string): Builder {
    this.transaction.setOpCode(Transaction.DID_UNFREEZE);
    this.transaction.setTo(to);
    return this;
  }

  public destroy(to: string): Builder {
    this.transaction.setOpCode(Transaction.DID_ABANDON);
    this.transaction.setTo(to);
    return this;
  }

  public updatePublicKey(to: string, publicKey: DidPublicKey): Builder {
    const payload = JSON.stringify(publicKey);
    this.transaction.setPayload(StringUtil.toHex(payload));
    this.transaction.setTo(to);
    this.transaction.setOpCode(Transaction.DID_UPDATEPUBLICKEY);
    return this;
  }

  public updateAdmins(to: string, admins: string[]): Builder {
    const payload = JSON.stringify(admins);
    this.transaction.setPayload(StringUtil.toHex(payload));
    this.transaction.setTo(to);
    this.transaction.setOpCode(Transaction.DID_UPDATEADMINS);
    return this;
  }

  public uploadCredential(credential: DidCredential): Builder {
    this.transaction.setTo(this.transaction.getFrom());
    const payload = JSONBigintUtil.stringify(credential);
    this.transaction.setPayload(StringUtil.toHex(payload));
    this.transaction.setOpCode(Transaction.DIDCREDENTIAL_UPLOAD);
    return this;
  }

  public downloadCredential(credentialId: string): Builder {
    this.transaction.setTo(this.transaction.getFrom());
    this.transaction.setPayload(StringUtil.toHex(credentialId));
    this.transaction.setOpCode(Transaction.DIDCREDENTIAL_DOWNLOAD);
    return this;
  }

  public destroyCredential(credentialId: string): Builder {
    this.transaction.setTo(this.transaction.getFrom());
    this.transaction.setPayload(StringUtil.toHex(credentialId));
    this.transaction.setOpCode(Transaction.DIDCREDENTIAL_ABANDON);
    return this;
  }

  public setExtra(to: string, key: string, value: string): Builder {
    this.transaction.setTo(to);
    const payload = JSON.stringify({
      key,
      value,
    });
    this.transaction.setPayload(StringUtil.toHex(payload));
    this.transaction.setOpCode(Transaction.DID_SETEXTRA);
    return this;
  }

  public getExtra(to: string, key: string): Builder {
    this.transaction.setTo(to);
    const payload = JSON.stringify({
      key,
    });
    this.transaction.setPayload(StringUtil.toHex(payload));
    this.transaction.setOpCode(Transaction.DID_GETEXTRA);
    return this;
  }
}

class SqlBuilder extends Builder {
  private static readonly rowSql = Uint8Array.from([0]);

  constructor(from: string, providerManager: ProviderManager);
  constructor(from: string, gasPrice: bigint, txVersion: TxVersion);
  constructor(param1: string, param2: ProviderManager | bigint, param3?: TxVersion) {
    if (typeof param2 === "bigint" && param3 != null) {
      super(param1, param2, param3);
    } else {
      super(param1, param2 as ProviderManager);
    }
    this.transaction.setVmType(VmType.KVSQL);
  }

  public invoke(to: string, sql: string): Builder {
    this.transaction.setTo(to);
    const data = ByteUtil.concat(SqlBuilder.rowSql, StringUtil.toByte(sql));
    this.transaction.setPayload(ByteUtil.toHex(data));
    return this;
  }

  public create(): Builder {
    this.transaction.setTo("0x0");
    this.transaction.setPayload("0x4b5653514c");
    return this;
  }
}

Transaction.Builder = Builder;
Transaction.HVMBuilder = HVMBuilder;
Transaction.EVMBuilder = EVMBuilder;
Transaction.DidBuilder = DidBuilder;
Transaction.SqlBuilder = SqlBuilder;
Transaction.BVMBuilder = BVMBuilder;

function getRandNonce(): bigint {
  let random = Math.random();
  if (random < 0.1) {
    random += 0.1;
  }
  const nonce = BigInt(Math.floor(random * 1e16));
  return nonce;
}
