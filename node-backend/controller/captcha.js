const captchaService = require('../service/captcha');
const util = require('../utils/util');

//获取图形验证码
async function generate(ctx) {
    try {
        const info = await captchaService.generateCaptcha(ctx);
        util.success(ctx, info || null);
    } catch (err) {
        console.log(err);
        const { message, code } = err;
        util.fail(ctx, message, code);
    }
}

// 验证码登录
async function login(ctx) {
    try {
        const info = await captchaService.loginByCaptcha(ctx);
        util.success(ctx, info || null);
    } catch (err) {
        console.log(err);
        const { message, code } = err;
        util.fail(ctx, message, code);
    }
}

// 注册
async function register(ctx) {
    try {
        const info = await captchaService.registerByCaptcha(ctx);
        util.success(ctx, info || null);
    } catch (err) {
        console.log(err);
        const { message, code } = err;
        util.fail(ctx, message, code);
    }
}

// 获取用户信息
async function getUserInfo(ctx) {
    try {
        const info = await captchaService.getUserInfo(ctx);
        util.success(ctx, info || null);
    } catch (err) {
        console.log(err);
        const { message, code } = err;
        util.fail(ctx, message, code);
    }
}

module.exports = {
    generate,
    login,
    register,
    getUserInfo,
};
