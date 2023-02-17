import { Receipt, DidServiceType } from "../common";
import { ProviderManager } from "../provider";
import { Transaction } from "../transaction";
import { PollingResponse, Request } from "../request";

export default class DidService {
  private providerManager: ProviderManager;

  private static readonly DID_PREFIX = "did_";

  constructor(providerManager: ProviderManager) {
    this.providerManager = providerManager;
  }

  private sendDIDTransaction(
    transaction: Transaction,
    ...nodeIds: number[]
  ): Request<string | Receipt, PollingResponse> {
    const request = new Request<string | Receipt, PollingResponse>(
      `${DidService.DID_PREFIX}sendDIDTransaction`,
      this.providerManager,
      ...nodeIds
    ).enablePolling();
    request.addParam(transaction.commonParam());
    return request;
  }

  public getChainID(...nodeIds: number[]): Request<string> {
    const request = new Request<string>(
      `${DidService.DID_PREFIX}getChainID`,
      this.providerManager,
      ...nodeIds
    );
    return request;
  }

  public getDIDDocument(
    didAddress: string,
    ...nodeIds: number[]
  ): Request<DidServiceType.Document> {
    const request = new Request<DidServiceType.Document>(
      `${DidService.DID_PREFIX}getDIDDocument`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam({
      didAddress,
    });
    return request;
  }

  public getCredentialPrimaryMessage(
    id: string,
    ...nodeIds: number[]
  ): Request<DidServiceType.Credential> {
    const request = new Request<DidServiceType.Credential>(
      `${DidService.DID_PREFIX}getCredentialPrimaryMessage`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam({
      id,
    });
    return request;
  }

  public checkCredentialValid(id: string, ...nodeIds: number[]): Request<boolean> {
    const request = new Request<boolean>(
      `${DidService.DID_PREFIX}checkCredentialValid`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam({
      id,
    });
    return request;
  }

  public checkCredentialAbandoned(id: string, ...nodeIds: number[]): Request<boolean> {
    const request = new Request<boolean>(
      `${DidService.DID_PREFIX}checkCredentialAbandoned`,
      this.providerManager,
      ...nodeIds
    );
    request.addParam({
      id,
    });
    return request;
  }

  public setExtra(
    transaction: Transaction,
    ...nodeIds: number[]
  ): Request<string | Receipt, PollingResponse> {
    return this.sendDIDTransaction(transaction, ...nodeIds);
  }

  public getExtra(
    transaction: Transaction,
    ...nodeIds: number[]
  ): Request<string | Receipt, PollingResponse> {
    return this.sendDIDTransaction(transaction, ...nodeIds);
  }

  public register(
    transaction: Transaction,
    ...nodeIds: number[]
  ): Request<string | Receipt, PollingResponse> {
    return this.sendDIDTransaction(transaction, ...nodeIds);
  }

  public freeze(
    transaction: Transaction,
    ...nodeIds: number[]
  ): Request<string | Receipt, PollingResponse> {
    return this.sendDIDTransaction(transaction, ...nodeIds);
  }

  public unFreeze(
    transaction: Transaction,
    ...nodeIds: number[]
  ): Request<string | Receipt, PollingResponse> {
    return this.sendDIDTransaction(transaction, ...nodeIds);
  }

  public updatePublicKey(
    transaction: Transaction,
    ...nodeIds: number[]
  ): Request<string | Receipt, PollingResponse> {
    return this.sendDIDTransaction(transaction, ...nodeIds);
  }

  public updateAdmins(
    transaction: Transaction,
    ...nodeIds: number[]
  ): Request<string | Receipt, PollingResponse> {
    return this.sendDIDTransaction(transaction, ...nodeIds);
  }

  public destroy(
    transaction: Transaction,
    ...nodeIds: number[]
  ): Request<string | Receipt, PollingResponse> {
    return this.sendDIDTransaction(transaction, ...nodeIds);
  }

  public uploadCredential(
    transaction: Transaction,
    ...nodeIds: number[]
  ): Request<string | Receipt, PollingResponse> {
    return this.sendDIDTransaction(transaction, ...nodeIds);
  }

  public downloadCredential(
    transaction: Transaction,
    ...nodeIds: number[]
  ): Request<string | Receipt, PollingResponse> {
    return this.sendDIDTransaction(transaction, ...nodeIds);
  }

  public destroyCredential(
    transaction: Transaction,
    ...nodeIds: number[]
  ): Request<string | Receipt, PollingResponse> {
    return this.sendDIDTransaction(transaction, ...nodeIds);
  }
}
