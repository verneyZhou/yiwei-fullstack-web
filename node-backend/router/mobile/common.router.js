const Router = require('@koa/router');
const wx = require('../../controller/wx');
const captcha = require('../../controller/captcha');
const router = new Router({ prefix: '/api/mobile' });

/**
 * mobile router
 */
// 获取用户信息
router.get('/userinfo', (ctx) => {
    const { user_type = '' } = ctx.request.query;
    console.log('=====user_type', ctx.request.query);
    if (user_type === 'wechat') {
        return wx.getUserInfo(ctx);
    } else {
        return captcha.getUserInfo(ctx);
    }
});

module.exports = router;
