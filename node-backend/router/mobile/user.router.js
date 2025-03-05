const Router = require('@koa/router');
const user = require('../../controller/user');
const router = new Router({ prefix: '/api/user' });


/**
 * user router
 */
// user_list
router.get('/getUserList', user.getUserTable);

module.exports = router;