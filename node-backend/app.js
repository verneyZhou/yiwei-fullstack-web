const Koa = require('koa');
const { koaBody } = require('koa-body');
const cors = require('koa2-cors');
const static = require('koa-static');
const koajwt = require('koa-jwt');
const path = require('path');

const config = require('./config');
const errorHandler = require('./error');
const { routerInstaller } = require('./utils/installer');

const app = new Koa();

app.use(
    cors({
        exposeHeaders: ['filename'], // 下载文件时，响应头中包含filename
        // origin: '*', //允许所有域名访问
        // exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
        // maxAge: 5,
        credentials: true, //允许携带cookie
        // allowMethods: ['GET', 'POST', 'DELETE'], //允许的请求方法
        // allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //允许的请求头
    })
);

/**
 * 中间件处理
 * 1. Cookie令牌验证。
 * 2. 参数、请求地址打印，通过monitor排查错误日志。
 * 3. 拦截通过throw抛出的异常。
 */
app.use(async (ctx, next) => {
    console.log('=123456==ctx', ctx.request);
    try {
        await next();
    } catch (err) {
        console.log(err);
        const { name, message } = err || {};
        if (name === 'UnauthorizedError') {
            ctx.body = {
                code: 401,
                data: null,
                message: '令牌已过期或无效',
            };
            return;
        }
        if (message.indexOf('options.maxFileSize') > -1) {
            ctx.body = {
                code: 102,
                data: null,
                message: '超出最大限制，文件最大为5M', // 自定义错误信息
            };
            return;
        }
        ctx.body = {
            code: -1,
            data: null,
            message: err.message,
        };
    }
});

// 文件上传中间件
app.use(
    koaBody({
        multipart: true, // 支持文件上传
        formidable: {
            // uploadDir: path.join(__dirname, 'public'), // 设置文件上传目录
            keepExtensions: true, // 保持文件的后缀
            allowEmptyFiles: false, // 允许上传空文件
            maxFiles: 1, // 设置同时上传文件的个数
            maxFileSize: 5 * 1024 * 1024, // 文件大小限制，默认5M
            maxFields: 10, // 设置字段数量
            maxFieldsSize: 3 * 1024 * 1024, // 设置上传文件内存大小
        },
    })
);

// token鉴权
app.use(
    koajwt({
        secret: config.JWT_PRIVATE_KEY,
        cookie: 'token',
        // cookie: 'yiwei-admin-web-token-key', // 从cookie中获取token
        // key: 'user',     // 解析后的用户信息存储在ctx.state.user中
        // tokenKey: 'token'  // 从请求头获取token时的键名
        // debug: true // 开启debug可以看到准确的错误信息
    }).unless({
        path: [
            /^\/api\/auth/,
            /^\/public\//,
            // /^\/api\/admin\//,
            // /^\/api\/user\//,
            /^\/api\/wx\/login/,
            /^\/api\/ai\/models/,
            // /^\/api\/captcha\/code/,
            /^\/api\/captcha\/\w*/,
            /^\/api\/admin\/auth\/\w*/,
            /^\/api\/lowcode\/proxy/,
            /^\/api\/lowcode\/\w*/,
            /^\/api\/upload\/\w*/, // 上传文件
        ], // 排除不需要token验证的路由
    })
);

// 路由
routerInstaller(app);

// 静态资源
app.use(static(path.join(__dirname, 'public')));

// 错误处理
app.on('error', errorHandler);

module.exports = app;
