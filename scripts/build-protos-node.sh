#!/bin/bash

BASEDIR=$(dirname "$0") # 脚本当前目录
cd ${BASEDIR}/../

PROTO_SOURCE_DIR=./src/provider/grpc-provider/grpc/proto/
PROTO_DEST_DIR=./src/provider/grpc-provider/grpc/node/

mkdir -p ${PROTO_DEST_DIR}

npx grpc_tools_node_protoc \
--plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
--ts_out=grpc_js:${PROTO_DEST_DIR} \
--js_out=import_style=commonjs:${PROTO_DEST_DIR} \
--grpc_out=grpc_js:${PROTO_DEST_DIR} \
--proto_path=${PROTO_SOURCE_DIR}  \
transaction.proto
