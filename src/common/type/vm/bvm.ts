import VmType from "./vm-type";

export interface DecodedRet {
  Err: string;
  Ret?: string;
  Success: boolean;
}

export interface NsFilterRule {
  allow_anyone: boolean;
  authorized_roles: string[];
  forbidden_roles: string[];
  id: number;
  name: string;
  to: string[];
  vm: string[];
}

export interface ContractManageOption {
  vmType: VmType;
  source?: string;
  bin?: string;
  addr?: string;
  name?: string;
  opCode?: number;
  compileOpt?: Record<string, string> | null;
}

export interface GenesisInfo {
  genesisAccount: Record<string, string>;
  genesisNodes: GenesisNode[];
}

export interface GenesisNode {
  genesisNode: string;
  certContent: string;
}

export enum HashAlgo {
  SHA2_224 = "SHA2_224",
  SHA2_256 = "SHA2_256",
  SHA2_384 = "SHA2_384",
  SHA2_512 = "SHA2_512",
  SHA3_224 = "SHA3_224",
  SHA3_256 = "SHA3_256",
  SHA3_384 = "SHA3_384",
  SHA3_512 = "SHA3_512",
  KECCAK_224 = "KECCAK_224",
  KECCAK_256 = "KECCAK_256",
  KECCAK_384 = "KECCAK_384",
  KECCAK_512 = "KECCAK_512",
  SM3 = "SM3",
  SELF_DEFINED_HASH = "SELF_DEFINED_HASH",
}

export enum EncryptAlgo {
  SM4_CBC = "SM4_CBC",
  AES_CBC = "AES_CBC",
  DES3_CBC = "3DES_CBC",
  TEE = "TEE",
  SELF_DEFINED_CRYPTO = "SELF_DEFINED_CRYPTO",
}

export interface AlgoSet {
  hash_algo: HashAlgo;
  encrypt_algo: EncryptAlgo;
}

export interface OperationResult {
  code: number;
  msg?: string;
}

export enum CAMode {
  Center = 1,
  Distributed = 2,
  None = 3,
}

export enum ProposalType {
  Config = "CONFIG",
  Permission = "PERMISSION",
  Node = "NODE",
  Contract = "CONTRACT",
  CNS = "CNS",
  CA = "CA",
  System = "SYSTEM",
}

export enum MPCCurveType {
  CurveSM9 = "sm9",
  CurveBN254 = "bn254",
}

export enum ContractMethod {
  ConfigSetFilterEnable = "SetFilterEnable",
  ConfigSetFilterRules = "SetFilterRules",
  ConfigSetConsensusAlgo = "SetConsensusAlgo",
  ConfigUpdateConsensusAlgo = "UpdateConsensusAlgo",
  ConfigSetConsensusSetSize = "SetConsensusSetSize",
  ConfigSetProposalTimeout = "SetProposalTimeout",
  ConfigSetProposalThreshold = "SetProposalThreshold",
  ConfigSetContractVoteThreshold = "SetContractVoteThreshold",
  ConfigSetContractVoteEnable = "SetContractVoteEnable",
  ConfigSetConsensusBatchSize = "SetConsensusBatchSize",
  ConfigSetConsensusPoolSize = "SetConsensusPoolSize",
  ConfigSetGasPrice = "SetExecutorBaseGasPrice",

  ContractDeployContract = "DeployContract",
  ContractUpgradeContract = "UpgradeContract",
  ContractMaintainContract = "MaintainContract",

  CNSSetCName = "SetCName",

  CASetCAMode = "SetCAMode",
  CAGetCAMode = "GetCAMode",

  NodeAddNode = "AddNode",
  NodeAddVP = "AddVP",
  NodeRemoveVP = "RemoveVP",

  PermissionCreateRole = "CreateRole",
  PermissionDeleteRole = "DeleteRole",
  PermissionGrant = "Grant",
  PermissionRevoke = "Revoke",

  ProposalCreate = "Create",
  ProposalVote = "Vote",
  ProposalCancel = "Cancel",
  ProposalExecute = "Execute",
  ProposalDirect = "Direct",

  HashSet = "Set",
  HashGet = "Get",

  AccountRegister = "Register",
  AccountAbandon = "Abandon",

  DIDSetChainID = "SetChainID",

  CertRevoke = "CertRevoke",
  CertCheck = "CertCheck",
  CertFreeze = "CertFreeze",
  CertUnfreeze = "CertUnfreeze",

  SRSInfo = "GetSRSInfo",
  SRSHistory = "GetHistory",
  SRSBeacon = "Beacon",

  RootCAAdd = "AddRootCA",
  RootCAGet = "GetRootCAs",

  HashChangeChangeHashAlgo = "ChangeHashAlgo",
  HashChangeGetHashAlgo = "GetHashAlgo",
  HashChangeGetSupportHashAlgo = "GetSupportHashAlgo",

  IssueBalance = "Issue",

  SystemUpgrade = "SystemUpgrade",

  VersionGetLatestVersions = "GetLatestVersions",
  VersionGetSupportedVersionByHostname = "GetSupportedVersionByHostname",
}
