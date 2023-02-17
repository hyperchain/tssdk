#!/bin/bash

BASEDIR=$(dirname "$0") # 脚本当前目录
cd ${BASEDIR}/../

PROTO_SOURCE_DIR=./src/provider/grpc-provider/grpc/proto/
PROTO_DEST_DIR=./src/provider/grpc-provider/grpc/web/

mkdir -p ${PROTO_DEST_DIR}

./bin/protoc \
--proto_path=${PROTO_SOURCE_DIR}  \
--plugin=protoc-gen-grpc-web=./bin/protoc-gen-grpc-web \
--js_out=import_style=commonjs:${PROTO_DEST_DIR} \
--grpc-web_out=import_style=typescript,mode=grpcwebtext:${PROTO_DEST_DIR} \
transaction.proto

# --plugin：使用插件 protoc-gen-grpc-web
# --js_out：xxx_pb.js 输出目录
# --grpc_out: xxx_grpc_pb.js 输出目录
# -I：作为输入的 proto 目录
# proto/*.proto 通配符，指定哪些文件作为输入（也可以写 */*.proto）

# helloworld_pb.js: this contains the HelloRequest and HelloReply classes
# helloworld_grpc_web_pb.js: this contains the GreeterClient class
