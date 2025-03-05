const Router = require('@koa/router');
const captcha = require('../../controller/captcha');
const router = new Router({ prefix: '/api/admin/user' });

/**
 *  user router
 */
router.get('/info', (ctx) => {
    Object.assign(ctx.request.body, {
        platform: 'admin',
    });
    return captcha.getUserInfo(ctx);
});

module.exports = router;
