const Router = require('@koa/router');
const admin = require('../../controller/admin');
const router = new Router({ prefix: '/api/admin/lowcode' });

/**
 * pc 后台管理系统配置 lowcode 相关接口
 */

// 获取低码页面列表
router.get('/page/list', admin.getLowCodePageList);
// 删除低码页面
router.post('/page/delete', admin.deleteLowCodePage);
// 获取低码项目列表
router.get('/project/list', admin.getLowCodeProjectList);
// 删除低码项目
router.post('/project/delete', admin.deleteLowCodeProject);

module.exports = router;
