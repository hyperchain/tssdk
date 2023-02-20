import { ProviderManager } from "../provider";
import { Response } from "../request";

interface RequestBody {
  id: number;
  jsonrpc: string;
  namespace: string;
  method: string;
  params: unknown[];
}

export default class Request<T, R extends Response<T> = Response<T>> {
  protected providerManager: ProviderManager;
  protected nodeIds: number[];
  protected headers: HeadersInit;
  protected id: number;
  protected jsonrpc: string;
  protected namespace: string;
  protected method: string;
  protected params: unknown[];
  protected pollable: boolean;
  //// attr usedProviders usedAllProviders auth

  constructor(method: string, providerManager: ProviderManager, ...nodeIds: number[]) {
    this.method = method;
    this.providerManager = providerManager;
    this.nodeIds = nodeIds;
    this.id = 1;
    this.jsonrpc = "2.0";
    this.headers = {};
    this.namespace = providerManager.getNamespace();
    this.params = [];
    this.pollable = false;
  }

  public send(): Promise<R> {
    return this.providerManager.send(this, ...this.nodeIds);
  }

  public addHeader(key: string, value: string): void {
    this.headers = {
      ...this.headers,
      [key]: value,
    };
  }

  public addParam(obj: unknown): void {
    this.params.push(obj);
  }

  public getHeaders() {
    return this.headers;
  }

  public body(): RequestBody {
    return {
      method: this.method,
      id: this.id,
      jsonrpc: this.jsonrpc,
      namespace: this.namespace,
      params: this.params,
    };
  }

  public getProviderManager(): ProviderManager {
    return this.providerManager;
  }

  public getNodeIds(): number[] {
    return this.nodeIds;
  }

  public enablePolling() {
    this.pollable = true;
    return this;
  }

  public getPollable(): boolean {
    return this.pollable;
  }

  public useGrpc(): boolean {
    const grpcMethods: string[] = ["contract_deployContractReturnReceipt"];
    return grpcMethods.includes(this.method);
  }

  public getMethod(): string {
    return this.method;
  }
}
