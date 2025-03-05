const Router = require('@koa/router');
const sms = require('../../controller/sms');
const router = new Router({ prefix: '/api/sms' });

/**
 * sms auth router
 */
router.post('/code', sms.sendCode);
router.post('/login', sms.login);

module.exports = router;
