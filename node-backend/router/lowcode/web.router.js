const Router = require('@koa/router');
const lowcode = require('../../controller/lowcode');
const router = new Router({ prefix: '/api/lowcode/web' });

/**
 * 展示端接口
 */
// 获取已发布页面详情
router.get('/page/detail/:id', lowcode.getPublishDetail);

module.exports = router;
