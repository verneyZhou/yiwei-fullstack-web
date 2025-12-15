# node-backend

## 开发流程

> node v20+

## 备注

### 安装 sql

-   安装 本地 mysql， 同时安装数据库客户端 MySQL Workbench，[参考](https://blog.csdn.net/bigge_L/article/details/118766906)

-   [MySQL Workbench 使用教程](https://blog.csdn.net/weixin_48131807/article/details/123133538)、[MySQL-Workbench 数据库基本操作](https://blog.csdn.net/jsugs/article/details/124176899)

-   [mysql 教程](https://www.runoob.com/mysql/mysql-tutorial.html)

## 报错记录

-   运行 mysql 时报错：`Error: getaddrinfo ENOTFOUND http://localhost`

    > 连接 mysql 时 `http://localhost` 改成 `localhost` 即可~

-   云服务器上`nvm use v20.18.3`报错：

```sh
[root@iz2zef9ue9eyhqrvjxs3aqz node-backend]# nvm use v20.18.3
node: /lib64/libm.so.6: version `GLIBC_2.27' not found (required by node)
node: /lib64/libstdc++.so.6: version `GLIBCXX_3.4.20' not found (required by node)
node: /lib64/libstdc++.so.6: version `CXXABI_1.3.9' not found (required by node)
node: /lib64/libstdc++.so.6: version `GLIBCXX_3.4.21' not found (required by node)
node: /lib64/libc.so.6: version `GLIBC_2.28' not found (required by node)
node: /lib64/libc.so.6: version `GLIBC_2.25' not found (required by node)




# 报错
[root@iz2zef9ue9eyhqrvjxs3aqz build]# make && make install
make: \*\*\* 没有指明目标并且找不到 makefile。 停止。
```

> 这个错误是因为服务器上的 GLIBC 和 GLIBCXX 版本过低，无法支持 Node.js v20 版本。我们需要先升级系统库，然后再安装 Node.js:

```sh
# 检查当前 GLIBC 版本
ldd --version

# 下载并安装新版本 GLIBC
cd /usr/local/src
wget http://ftp.gnu.org/gnu/glibc/glibc-2.28.tar.gz
tar xvf glibc-2.28.tar.gz
cd glibc-2.28
mkdir build
cd build
../configure --prefix=/usr --disable-profile --enable-add-ons --with-headers=/usr/include --with-binutils=/usr/bin
make
make install
```

[node: /lib64/libm.so.6: version `GLIBC_2.27‘ not found 问题解决方案](https://blog.csdn.net/u012559967/article/details/136344204)

-   报错：

```sh
# ../configure --prefix=/usr --disable-profile --enable-add-ons --with-headers=/usr/include --with-binutils=/usr/bin 时报错：
*** These critical programs are missing or too old: make compiler
*** Check the INSTALL file for required versions.


##### 解决办法：
# 首先安装 CentOS 的 SCL 源
yum install -y centos-release-scl-rh centos-release-scl
# 创建新的 repo 文件
cat > /etc/yum.repos.d/centos-sclo-rh.repo << 'EOF'
[centos-sclo-rh]
name=CentOS-7 - SCLo rh
baseurl=https://mirrors.aliyun.com/centos/7/sclo/x86_64/rh/
gpgcheck=0
enabled=1
EOF
# 清理缓存
yum clean all

# 更新缓存
yum makecache

# 重新尝试安装
yum install -y devtoolset-7-gcc devtoolset-7-gcc-c++ devtoolset-7-binutils

# 启用新版本
scl enable devtoolset-7 bash

```

-   服务器执行`yum install -y bison`报错：`bison-3.0.4-2.el7.x86_64: [Errno 256] No more mirrors to try.`
    > 这个错误表明 yum 无法找到可用的镜像源来安装 bison 包。我们可以通过以下步骤解决：

```sh
# 备份原有源
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup

# 下载阿里云源
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo

# 清除缓存
yum clean all

# 生成缓存
yum makecache

# 安装 bison
yum install -y bison
```

## TODO

-   ai 助手部署到服务器上提示 node 版本需 v18+，如何升级 centos 云服务器到 v18+版本？
