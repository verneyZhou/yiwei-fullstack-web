const Router = require('@koa/router');
const captcha = require('../../controller/captcha');
const router = new Router({ prefix: '/api/captcha' });

/**
 * captcha auth router
 */
router.get('/code', captcha.generate);
router.post('/login', captcha.login);
router.post('/register', captcha.register);

module.exports = router;
