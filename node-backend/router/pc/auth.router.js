const Router = require('@koa/router');
const captcha = require('../../controller/captcha');
const router = new Router({ prefix: '/api/admin/auth' });

/**
 *  user router
 */
router.get('/code', (ctx) => {
    Object.assign(ctx.request.body, {
        platform: 'admin',
    });
    return captcha.generate(ctx);
});
router.post('/login', (ctx) => {
    Object.assign(ctx.request.body, {
        platform: 'admin',
    });
    return captcha.login(ctx);
});
router.post('/register', (ctx) => {
    Object.assign(ctx.request.body, {
        platform: 'admin',
    });
    return captcha.register(ctx);
});

module.exports = router;
