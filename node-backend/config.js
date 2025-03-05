/**
 * 基础配置文件
 */
const SERVER_HOST = 'http://localhost';
const SERVER_PORT = 9527;

/**
 * mysql数据库
 */
const DATABASE_HOST = 'localhost';
const DATABASE_PORT = 3306;
const DATABASE_USER = 'root';
const DATABASE_PASSWORD = '2024zyZY';
const DATABASE_NAME = 'admin';

/**
 * JWT签名密钥和过期时间
 */
const JWT_PRIVATE_KEY = 'yiwei_node_jwt_private_key';
const JWT_EXPIRES_IN = '7d';

const AI_KEY = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    siliconflow_api_key: process.env.SILICONFLOW_API_KEY,
    KIMI_API_KEY: process.env.KIMI_API_KEY,
    ZHIPU_API_KEY: process.env.ZHIPU_API_KEY,
};

const MINI_CONFIG = {
    appid: process.env.MINI_APPID,
    app_secret: process.env.MINI_SECRET,
};

/**
 *
 */
const AUTH = {
    UNAUTHORIZED: {
        code: '000001',
        msg: '对不起，您还未获得授权',
    },
    AUTHORIZE_EXPIRED: {
        code: '000002',
        msg: '授权已过期',
    },
    FORBIDDEN: {
        code: '000003',
        msg: '抱歉，您没有权限访问该内容',
    },
};

module.exports = {
    SERVER_HOST,
    SERVER_PORT,
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_USER,
    DATABASE_PASSWORD,
    DATABASE_NAME,
    JWT_PRIVATE_KEY,
    JWT_EXPIRES_IN,
    MINI_CONFIG,
    AUTH,
    AI_KEY,
};
