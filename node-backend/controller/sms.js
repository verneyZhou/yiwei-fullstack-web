const smsService = require('../service/sms');
const util = require('../utils/util');

//发送短信验证码
async function sendCode(ctx) {
    try {
        const info = await smsService.sendCode(ctx);
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
        const info = await smsService.loginWithCode(ctx);
        util.success(ctx, info || null);
    } catch (err) {
        console.log(err);
        const { message, code } = err;
        util.fail(ctx, message, code);
    }
}

module.exports = {
    sendCode,
    login,
};
