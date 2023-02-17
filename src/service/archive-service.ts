// import { ProviderManager } from "../provider";
// import { Request } from "../request";
//
// export default class ArchiveService {
//   private providerManager: ProviderManager;
//   private static readonly ARCHIVE_PRE = "archive_";
//
//   constructor(providerManager: ProviderManager) {
//     this.providerManager = providerManager;
//   }
//
//   // 制作快照
//   public snapshot(blockNumber: bigint | string, ...nodeIds: number[]): Request<string> {
//     let method;
//     if (typeof blockNumber === "string") {
//       method = `${ArchiveService.ARCHIVE_PRE}snapshot`;
//     } else {
//       method = `${ArchiveService.ARCHIVE_PRE}makeSnapshot4Flato`;
//     }
//     const request = new Request<string>(method, this.providerManager, ...nodeIds);
//     request.addParam(blockNumber);
//     return request;
//   }
//
//   // 查询最近一次归档的进度
//   public querySnapshotExist(filterId: string, ...nodeIds: number[]): Request<boolean> {
//     const request = new Request<boolean>(
//       `${ArchiveService.ARCHIVE_PRE}querySnapshotExist`,
//       this.providerManager,
//       ...nodeIds
//     );
//     request.addParam(filterId);
//     return request;
//   }
//
//   public checkSnapshot(filterId: string, ...nodeIds: number[]): Request<boolean> {
//     const request = new Request<boolean>(
//       `${ArchiveService.ARCHIVE_PRE}checkSnapshot`,
//       this.providerManager,
//       ...nodeIds
//     );
//     request.addParam(filterId);
//     return request;
//   }
//
//   public deleteSnapshot(filterId: string, ...nodeIds: number[]): Request<boolean> {
//     const request = new Request<boolean>(
//       `${ArchiveService.ARCHIVE_PRE}deleteSnapshot`,
//       this.providerManager,
//       ...nodeIds
//     );
//     request.addParam(filterId);
//     return request;
//   }
//
//   // 列出所有快照
//   public listSnapshot(...nodeIds: number[]): Request<Archive> {
//     const request = new Request<Archive>(
//       `${ArchiveService.ARCHIVE_PRE}listSnapshot`,
//       this.providerManager,
//       ...nodeIds
//     );
//     return request;
//   }
//
//   public readSnapshot(filterId: string, ...nodeIds: number[]): Request<Archive> {
//     const request = new Request<Archive>(
//       `${ArchiveService.ARCHIVE_PRE}readSnapshot`,
//       this.providerManager,
//       ...nodeIds
//     );
//     request.addParam(filterId);
//     return request;
//   }
//
//   public archive(filterId: string, sync: boolean, ...nodeIds: number[]): Request<boolean> {
//     const request = new Request<boolean>(
//       `${ArchiveService.ARCHIVE_PRE}archive`,
//       this.providerManager,
//       ...nodeIds
//     );
//     request.addParam(filterId);
//     request.addParam(sync);
//     return request;
//   }
//
//   // 数据归档（直接归档）
//   public archiveNoPredict(blkNumber: bigint, ...nodeIds: number[]): Request<boolean> {
//     const request = new Request<boolean>(
//       `${ArchiveService.ARCHIVE_PRE}archiveNoPredict`,
//       this.providerManager,
//       ...nodeIds
//     );
//     request.addParam(blkNumber);
//     return request;
//   }
//
//   public restore(filterId: string, sync: boolean, ...nodeIds: number[]): Request<boolean> {
//     const request = new Request<boolean>(
//       `${ArchiveService.ARCHIVE_PRE}restore`,
//       this.providerManager,
//       ...nodeIds
//     );
//     request.addParam(filterId);
//     request.addParam(sync);
//     return request;
//   }
//
//   public restoreAll(sync: boolean, ...nodeIds: number[]): Request<boolean> {
//     const request = new Request<boolean>(
//       `${ArchiveService.ARCHIVE_PRE}restoreAll`,
//       this.providerManager,
//       ...nodeIds
//     );
//     request.addParam(sync);
//     return request;
//   }
//
//   // 查询归档数据状态
//   public queryArchive(filterId: string, ...nodeIds: number[]): Request<string> {
//     const request = new Request<string>(
//       `${ArchiveService.ARCHIVE_PRE}restoreAll`,
//       this.providerManager,
//       ...nodeIds
//     );
//     request.addParam(filterId);
//     return request;
//   }
//
//   public queryLatestArchive(...nodeIds: number[]): Request<ArchiveLatest> {
//     const request = new Request<ArchiveLatest>(
//       `${ArchiveService.ARCHIVE_PRE}queryLatestArchive`,
//       this.providerManager,
//       ...nodeIds
//     );
//     return request;
//   }
//
//   public pending(...nodeIds: number[]): Request<Archive> {
//     const request = new Request<Archive>(
//       `${ArchiveService.ARCHIVE_PRE}pending`,
//       this.providerManager,
//       ...nodeIds
//     );
//     return request;
//   }
//
//   // 查询归档数据是否存在
//   public queryArchiveExist(filterId: string, ...nodeIds: number[]): Request<boolean> {
//     const request = new Request<boolean>(
//       `${ArchiveService.ARCHIVE_PRE}queryArchiveExist`,
//       this.providerManager,
//       ...nodeIds
//     );
//     return request;
//   }
// }
