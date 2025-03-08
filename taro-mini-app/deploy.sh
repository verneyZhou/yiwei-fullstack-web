#!/bin/bash

# 定义变量
HOST="123.57.172.182"
USER="root"
PORT="22"
REMOTE_DIR="/root/nginx/upload/yiwei/taro-mini-app"

# 输出部署开始的信息
echo "开始部署H5项目到服务器..."

# 构建H5项目
echo "开始构建H5项目..."
npm run build:h5

if [ $? -ne 0 ]; then
    echo "构建失败，退出部署"
    exit 1
fi

# 检查dist/h5目录是否存在
if [ ! -d "dist/h5" ]; then
    echo "dist/h5目录不存在，请确认构建是否成功"
    exit 1
fi

# 使用rsync上传文件到服务器
echo "开始上传文件到服务器..."
# 使用rsync命令同步文件
# -a: 归档模式，保留所有文件属性
# -v: 显示详细信息
# -z: 传输时进行压缩
# --delete: 删除目标目录中有而源目录中没有的文件
# -e: 指定使用ssh作为远程shell，并设置端口
rsync -avz --delete -e "ssh -p ${PORT}" dist/h5/ ${USER}@${HOST}:${REMOTE_DIR}

if [ $? -ne 0 ]; then
    echo "文件上传失败"
    exit 1
fi

echo "部署完成！"