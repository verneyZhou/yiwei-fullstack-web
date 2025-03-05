const Router = require('@koa/router');
const admin = require('../../controller/adminV0');
const router = new Router({ prefix: '/api/admin' });

/**
 * pc 后台管理系统配置
 */

// order_list
router.get('/getOrderList', admin.getOrderTable);
// user_list
router.get('/getUserList', admin.getUserTable);

// 项目配置
router.get('/getProjectConfig', admin.getProjectConfig);

// // 页面详情
// router.get('/page/detail/:env/:id', admin.getPageDetail);

// // 自己名下的项目列表
// router.get('/project/list', admin.getProjectList);

// // 菜单列表
// router.get('/menu/list/:id', admin.getMenuList);

module.exports = router;
