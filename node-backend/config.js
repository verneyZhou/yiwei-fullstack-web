/**
 * 基础配置文件
 */
const SERVER_HOST = 'http://localhost';
const SERVER_PORT = 9527;

/**
 * mysql数据库
 */
const DATABASE_PORT = process.env.DATABASE_PORT || 3306;
const DATABASE_HOST = process.env.DATABASE_HOST || 'localhost';
const DATABASE_USER = process.env.DATABASE_USER || 'root';
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || '123456';
const DATABASE_LOCAL_HOST = process.env.DATABASE_LOCAL_HOST || 'localhost';
const DATABASE_LOCAL_USER = process.env.DATABASE_LOCAL_USER || 'root';
const DATABASE_LOCAL_PASSWORD = process.env.DATABASE_LOCAL_PASSWORD || '123456';
// const DATABASE_NAME = 'admin';

/**
 * JWT签名密钥和过期时间
 */
const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

const AI_KEY = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    SILICONFLOW_API_KEY: process.env.SILICONFLOW_API_KEY,
    KIMI_API_KEY: process.env.KIMI_API_KEY,
    ZHIPU_API_KEY: process.env.ZHIPU_API_KEY,
};

const MINI_CONFIG = {
    appid: process.env.MINI_APPID,
    app_secret: process.env.MINI_SECRET,
};

// 阿里云OSS配置
const OSS_CONFIG = {
    region: process.env.OSS_REGION, // 根据你的 OSS 实例所在地域修改
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET_NAME,
};

// rag
const RAG_KEY = {
    ALIBABA_API_KEY: process.env.ALIBABA_API_KEY,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY_V2,
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
    DATABASE_PORT,
    DATABASE_HOST,
    DATABASE_USER,
    DATABASE_PASSWORD,
    DATABASE_LOCAL_HOST,
    DATABASE_LOCAL_USER,
    DATABASE_LOCAL_PASSWORD,
    // DATABASE_NAME,
    JWT_PRIVATE_KEY,
    JWT_EXPIRES_IN,
    MINI_CONFIG,
    OSS_CONFIG,
    AUTH,
    AI_KEY,
    RAG_KEY,
};
