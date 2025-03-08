#!/bin/bash

# 定义服务器相关信息
HOST="123.57.172.182"
USER="root"
REMOTE_DIR="/root/nginx/upload/yiwei/vue-admin-web"

# 打印部署开始信息
echo "开始部署vue-admin-web项目到生产环境..."

# 安装依赖
echo "正在安装依赖..."
# npm install

# 构建项目
echo "正在构建项目..."
npm run build

# 检查构建结果
if [ ! -d "dist" ]; then
  echo "构建失败，dist目录不存在！"
  exit 1
fi

# 连接服务器并部署
echo "正在部署到服务器..."

# 创建远程目录（如果不存在）
ssh ${USER}@${HOST} "mkdir -p ${REMOTE_DIR}"

# 上传dist目录下的所有文件到服务器
echo "正在上传文件..."
scp -r dist/* ${USER}@${HOST}:${REMOTE_DIR}

# 设置权限
ssh ${USER}@${HOST} "chmod -R 755 ${REMOTE_DIR}"

echo "部署完成！"