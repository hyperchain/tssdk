import { StringUtil } from "../common";
import { Account, Algo, genAccount, fromAccountJson, DidAccount, fromPrivateKey } from "../account";
import { ArgEmptyError } from "../common";
import { ProviderManager } from "../provider";
import { Request, Response } from "../request";

export default class AccountService {
  private static readonly ACC_PREFIX = "account_";
  private readonly providerManager: ProviderManager;

  constructor(providerManager: ProviderManager) {
    this.providerManager = providerManager;
  }

  public genAccount(algo: Algo, password?: string): Account {
    return genAccount(algo, password);
  }

  public fromPrivateKey(privateKey: string, algo: Algo, password?: string): Account {
    return fromPrivateKey(privateKey, algo, password);
  }

  public fromAccountJson(accountJson: string, password?: string): Account {
    return fromAccountJson(accountJson, password);
  }

  public getBalance(address: string, ...nodeIds: number[]): Request<string> {
    address = DidAccount.convertDIDAddrToHex(address);
    const request = new Request<string>(
      `${AccountService.ACC_PREFIX}getBalance`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(address);
    return request;
  }

  public getRoles(address: string, ...nodeIds: number[]): Request<string[]> {
    const request = new Request<string[]>(
      `${AccountService.ACC_PREFIX}getRoles`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(DidAccount.convertDIDAddrToHex(address));
    return request;
  }

  public getAccountsByRole(role: string, ...nodeIds: number[]): Request<string[]> {
    const request = new Request<string[]>(
      `${AccountService.ACC_PREFIX}getAccountsByRole`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(role);
    return request;
  }

  public getStatus(address: string, ...nodeIds: number[]): Request<string> {
    const request = new Request<string>(
      `${AccountService.ACC_PREFIX}getStatus`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam(DidAccount.convertDIDAddrToHex(address));
    return request;
  }

  public genDidAccount(algo: Algo, suffix: string, password?: string): Account {
    if (suffix.length == 0) {
      throw new ArgEmptyError("suffix");
    }
    const chainId = this.providerManager.getChainId();
    if (chainId == null) {
      throw new ArgEmptyError("chainId");
    }
    const account: Account = this.genAccount(algo, password);
    const didAddress = `${DidAccount.DID_PREFIX}${chainId}:${suffix}`;
    return new DidAccount(account, didAddress);
  }

  public genDidAccountFromAccountJson(
    accountJson: string,
    suffix: string,
    password?: string
  ): Account {
    if (suffix.length == 0) {
      throw new ArgEmptyError("suffix");
    }
    const chainId = this.providerManager.getChainId();
    if (chainId == null) {
      throw new ArgEmptyError("chainId");
    }
    const account: Account = this.fromAccountJson(accountJson, password);
    const didAddress = `${DidAccount.DID_PREFIX}${chainId}:${suffix}`;
    return new DidAccount(account, didAddress);
  }

  // changeAccountType
}
