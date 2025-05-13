const Router = require('@koa/router');
const lowcode = require('../../controller/lowcode');
const router = new Router({ prefix: '/api/lowcode/admin' });

/**
 * 编辑端接口
 */

// 获取页面列表
router.get('/page/list', lowcode.getPageList);
// 删除页面
router.post('/page/delete', lowcode.deletePage);
// 获取页面详情
router.get('/page/detail', lowcode.getPageDetail);
// 更新页面
router.post('/page/update', lowcode.updatePage);
// 新增页面
router.post('/page/create', lowcode.createPage);

// 发布接口
router.post('/page/publish', lowcode.publishPage);

module.exports = router;
