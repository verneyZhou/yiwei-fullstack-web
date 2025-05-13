const fs = require('node:fs');
const path = require('node:path');

// 路由自动注册
const routerInstaller = async (app) => {
    const exclude = [];
    const routerdir = path.resolve(__dirname, '../router');
    // 自动获取routerDir目录下所有以 .router.js 结尾的文件
    getRouterFiles(routerdir).then((routers) => {
        const include = routers.filter((item) => !exclude.includes(item));
        console.log('====include', include);
        include.forEach((path) => {
            app.use(require(`${path}`).routes());
            app.use(require(`${path}`).allowedMethods());
        });
    });
};

/**
 * 获取指定目录下所有以 .router.js 结尾的文件
 * @param {string} dir - 要遍历的目录
 * @returns {string[]} - 匹配的文件路径数组
 */
async function getRouterFiles(dir) {
    return new Promise((resolve, reject) => {
        let routerFiles = [];
        let index = 0;
        fs.readdir(dir, (err, files) => {
            if (err) {
                reject(`无法读取目录 ${dir}: ${err}`);
            }
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                const filePath = path.join(dir, file);
                fs.stat(filePath, async (err, stats) => {
                    if (err) {
                        reject(`无法获取文件状态 ${filePath}: ${err}`);
                    }
                    if (stats.isDirectory()) {
                        // 如果是目录，则递归调用
                        try {
                            const files = await getRouterFiles(filePath);
                            routerFiles = routerFiles.concat(files);
                            index++;
                        } catch (err) {
                            reject(err);
                        }
                    } else if (
                        stats.isFile() &&
                        filePath.endsWith('.router.js')
                    ) {
                        routerFiles.push(filePath);
                        index++;
                    }
                    if (index >= files.length) {
                        // 遍历完成，返回结果
                        resolve(routerFiles);
                    }
                });
            }
        });
    });
    // // 读取目录内容
    // const files = fs.readdirSync(dir, {
    //     encoding: 'utf-8',
    // });
    // (files || []).forEach(file => {
    //     const filePath = path.join(dir, file);
    //     const stats = fs.statSync(filePath);
    //     if (stats.isDirectory()) { // 如果是目录，则递归调用
    //         getRouterFiles(filePath, routerFiles);
    //     } else if (stats.isFile() && path.extname(file) === '.router.js') { // 如果是文件且以 .router.js 结尾，则添加到结果数组
    //         routerFiles.push(filePath);
    //     }
    // })
    // return routerFiles;
}

module.exports = {
    routerInstaller,
};
