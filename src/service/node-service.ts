import { NodeServiceType } from "../common";
import { ProviderManager } from "../provider";
import { Request } from "../request";

export default class NodeService {
  private providerManager: ProviderManager;
  private static readonly NODE_PREFIX = "node_";

  constructor(providerManager: ProviderManager) {
    this.providerManager = providerManager;
  }

  public getNodes(...nodeIds: number[]): Request<NodeServiceType.Node[]> {
    const request = new Request<NodeServiceType.Node[]>(
      `${NodeService.NODE_PREFIX}getNodes`,
      this.providerManager,
      ...nodeIds
    );
    return request;
  }

  public getNodeStates(...nodeIds: number[]): Request<NodeServiceType.NodeState[]> {
    const request = new Request<NodeServiceType.NodeState[]>(
      `${NodeService.NODE_PREFIX}getNodeStates`,
      this.providerManager,
      ...nodeIds
    );
    return request;
  }

  public getNodeHash(...nodeIds: number[]): Request<string> {
    const request = new Request<string>(
      `${NodeService.NODE_PREFIX}getNodeHash`,
      this.providerManager,
      ...nodeIds
    );
    return request;
  }

  public getNodeHashByID(nodeId: number): Request<string> {
    const request = new Request<string>(
      `${NodeService.NODE_PREFIX}getNodeHash`,
      this.providerManager,
      nodeId
    );
    return request;
  }
}
