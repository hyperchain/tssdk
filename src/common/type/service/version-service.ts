export interface ChainVersion {
  tx_version: string;
  block_version: string;
  encode_version: string;
  consensus_version: string;
  rbft_version: string;
  noxbft_version: string;
}

export interface VersionResult {
  availableHyperchainVersions: Record<string, ChainVersion>;
  runningHyperchainVersions: Record<string, ChainVersion>;
}

export interface SupportedVersion {
  tx_version: string[];
  block_version: string[];
  encode_version: string[];
  consensus_version: string[];
  rbft_version: string[];
  noxbft_version: string[];
}
