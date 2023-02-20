// import { Request, Response } from "../../request";
// import ContractService from "../../service/contract-service";
// import Provider from "../provider";
// import * as grpc from "@grpc/grpc-js";
// import {
//   GrpcApiContractClient,
//   GrpcApiDidClient,
//   GrpcApiTransactionClient,
// } from "./grpc/node/transaction_grpc_pb";

// import { CommonReq, CommonRes, SendTxArgs } from "./grpc/node/transaction_pb";
// export default class GrpcProvider implements Provider {
//   private host: string;
//   private nodeClient?: any;
//   private browserClient?: any;

//   constructor(host: string) {
//     this.host = host;
//     this.nodeClient = {};
//     this.browserClient = {};
//   }

//   async send<T, R extends Response<T> = Response<T>>(request: Request<T, Response<T>>): Promise<R> {
//     // 浏览器环境（使用 webpack 去除 "@grpc/grpc-js" 等包的依赖）
//     if (typeof window !== "undefined") {
//       throw new Error("not implemented");
//     }
//     // Node 环境
//     // const grpc = await import("@grpc/grpc-js");
//     // const { GrpcApiContractClient, GrpcApiDidClient, GrpcApiTransactionClient } = await import(
//     //   "./grpc/node/transaction_grpc_pb"
//     // );
//     // const { CommonReq, CommonRes, SendTxArgs } = await import("./grpc/node/transaction_pb");
//     // 通过 method 来判断该使用哪个 client
//     const method = request.getMethod();
//     // ContractClient
//     if (
//       method.startsWith(ContractService.CONTRACT_PREFIX) ||
//       method.startsWith(ContractService.SIMULATE_PREFIX)
//     ) {
//       if (this.nodeClient.grpcApiContractClient == null) {
//         this.nodeClient.grpcApiContractClient = new GrpcApiContractClient(
//           this.host,
//           grpc.credentials.createInsecure()
//         );
//       }
//       const grpcApiContractClient = this.nodeClient.grpcApiContractClient as GrpcApiContractClient;
//       const stream = grpcApiContractClient.deployContractReturnReceipt();
//       return new Promise((resolve, reject) => {
//         stream.on("data", (data: R) => {
//           resolve(data);
//         });
//         stream.on("end", resolve);
//         stream.on("error", reject);

//         const requestBody = request.body();
//         const transaction = requestBody.params[0] as any;
//         const sendTxArgs = new SendTxArgs()
//           .setFrom(transaction.from)
//           .setTo(transaction.to)
//           .setValue(transaction.value)
//           .setPayload(transaction.payload)
//           .setSignature(transaction.signature)
//           .setTimestamp(Number(transaction.timestamp))
//           .setSimulate(transaction.simulate)
//           .setNonce(Number(transaction.nonce))
//           .setExtra(transaction.extra)
//           .setVmtype(transaction.vmType)
//           .setCname(transaction.contractName);
//         // int32 opcode = 11;
//         // string snapshotID = 12;
//         // repeated int64 extraIDInt64Array = 13;
//         // repeated string extraIDStringArray = 14;
//         // string cName = 15;
//         // int64 expirationTimestamp = 16;
//         // int64 gasPrice = 17;
//         // int64 gasLimit = 18;
//         // ParticipantMsg participant = 19;
//         const commonReq = new CommonReq();
//         commonReq.setNamespace(requestBody.namespace);
//         commonReq.setSignature(transaction.signature);
//         commonReq.setParams(sendTxArgs.serializeBinary());
//         stream.write(commonReq);
//       });
//     }
//     throw new Error("no implements");
//   }
// }
