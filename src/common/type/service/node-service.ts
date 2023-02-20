export interface NodeState {
  id: number;
  hash: string;
  status: string;
  view: number;
  blockHeight: string;
  blockHash: string;
}

export interface Node {
  id: number;
  ip: string;
  port: string;
  namespace: string;
  hash: string;
  hostname: string;
  isPrimary: boolean;
  isvp: boolean;
  peerType: string;
  status: number;
  delay: number;
}
