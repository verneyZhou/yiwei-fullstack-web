const Router = require('@koa/router');
const lowcode = require('../../controller/lowcode');
const router = new Router({ prefix: '/api/lowcode/web' });

/**
 * 展示端接口
 */
// 获取已发布页面详情
router.get('/page/detail/:id', lowcode.getPublishDetail);

// 获取项目列表
router.get('/project/list', lowcode.getOwnProjectList);
// 获取项目详情
router.get('/project/detail', lowcode.getProjectDetail);
// 货物项目菜单
router.get('/project/menu', lowcode.getOwnProjectMenuList);

module.exports = router;
