// 文件名为 pm2.config.js
module.exports = {
    apps: [
        {
            name: 'YiweiNodeServer', // 应用名称
            script: './main.js', // 入口文件
        },
    ],
};
