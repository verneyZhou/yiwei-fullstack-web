#!/bin/bash

# 定义服务器相关信息
HOST="123.57.172.182"
USER="root"
PORT="22"
REMOTE_DIR="/root/nginx/upload/yiwei/node-backend"

# 打印部署开始信息
echo "开始部署node-backend项目到生产环境..."

# 构建项目
echo "正在打包项目文件..."

# 创建临时部署目录
DEPLOY_DIR="deploy_tmp"
rm -rf $DEPLOY_DIR
mkdir $DEPLOY_DIR

# 复制必要的文件到部署目录
cp -r .env .env.config.js app.js config.js yarn.lock package-lock.json controller error main.js package.json pm2.config.js router service sql data utils $DEPLOY_DIR/

# 连接服务器并部署
echo "正在部署到服务器..."

# 创建远程目录（如果不存在）
# ssh -p ${PORT} ${USER}@${HOST} "mkdir -p ${REMOTE_DIR}"

# 上传文件到服务器
echo "正在上传文件..."
# 使用rsync命令进行文件同步
# -a: 归档模式，保留所有文件属性
# -v: 显示详细信息
# -z: 传输时进行压缩
# --checksum: 基于校验和而不是时间戳来决定文件是否需要传输
# --delete: 删除目标目录中有而源目录中没有的文件
# --exclude: 排除node_modules目录
# -e: 指定使用ssh协议并设置端口
rsync -avz --checksum --delete --exclude='node_modules' -e "ssh -p ${PORT}" $DEPLOY_DIR/ ${USER}@${HOST}:${REMOTE_DIR}

# 清理临时部署目录
rm -rf $DEPLOY_DIR

echo "正在启动服务..."
# 在服务器上安装依赖并启动服务（首次或需要重新下载node包）
ssh -p ${PORT} ${USER}@${HOST} "cd ${REMOTE_DIR} && \
    yarn && \
    pm2 update && pm2 start pm2.config.js && pm2 list"

# ssh -p ${PORT} ${USER}@${HOST} "cd ${REMOTE_DIR} && pm2 update && pm2 reload YiweiNodeServer && pm2 list"

# 清理临时部署目录
rm -rf $DEPLOY_DIR

echo "部署完成！"