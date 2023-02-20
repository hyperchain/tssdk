#!/bin/bash

BASEDIR=$(dirname "$0")

cd ${BASEDIR}/

if [[ -z $(docker ps -a -q -f "name=^nodesolo$") ]]; then
  echo "创建 nodesolo docker..."
  docker run -it -d -p 8081:8081 -p 11001:11001  --name nodesolo --platform linux/amd64 centos:latest /bin/bash
  docker cp ../bin/nodesolo nodesolo:/home
fi

if [[ -z $(docker ps -q -f "name=^nodesolo$") ]]; then
  echo "启动 nodesolo docker..."
  docker start nodesolo
fi

if [[ -z $(ps -aux | grep hyperchain) ]]; then
  echo "启动 hyperchain..."
  docker exec -it nodesolo /bin/bash -c 'cd home/nodesolo && ./hyperchain'
fi

echo "nodesolo hyerchain 启动成功..."
