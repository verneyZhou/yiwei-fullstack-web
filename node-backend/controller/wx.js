const wxService = require('../service/wx');
const util = require('../utils/util');

//小程序登录
async function postAuthLogin(ctx) {
    try {
        const info = await wxService.postAuthLogin(ctx);
        util.success(ctx, info || null);
    } catch (err) {
        console.log(err);
        const { message, code } = err;
        util.fail(ctx, message, code);
    }
}

// 小程序获取用户信息
async function getUserInfo(ctx) {
    try {
        const info = await wxService.getUserInfo(ctx);
        util.success(ctx, info || null);
    } catch (err) {
        console.log(err);
        const { message, code } = err;
        util.fail(ctx, message, code);
    }
}
// 小程序更新用户信息
async function updateUserInfo(ctx) {
    try {
        const info = await wxService.updateUserInfo(ctx);
        util.success(ctx, info || null);
    } catch (err) {
        console.log(err);
        const { message, code } = err;
        util.fail(ctx, message, code);
    }
}

module.exports = {
    postAuthLogin,
    getUserInfo,
    updateUserInfo,
};
