const Router = require('@koa/router');
const lowcode = require('../../controller/lowcode');
const router = new Router({ prefix: '/api/lowcode/admin' });

/**
 * 编辑端接口
 */

/**
 * 页面相关
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

/**
 * 项目相关
 */
// 获取项目列表
router.get('/project/list', lowcode.getProjectList);
// 获取项目详情
router.get('/project/detail', lowcode.getProjectDetail);
// // 更新项目
router.post('/project/update', lowcode.updateProject);
// 新增项目
router.post('/project/create', lowcode.createProject);
// 删除项目
router.post('/project/delete', lowcode.deleteProject);

// 更新角色
router.post('/project/role/edit', lowcode.editRole);
// 获取角色列表
router.get('/project/role/list', lowcode.getRoleList);
// 删除角色
router.post('/project/role/delete', lowcode.deleteRole);
// 更新角色菜单权限
router.post('/project/role/limits', lowcode.updateRoleLimits);

// 获取项目用户列表
router.get('/project/user/list', lowcode.getProjectUserList);
// 新增、更改项目用户
router.post('/project/user/edit', lowcode.editProjectUser);
// 删除项目用户
router.post('/project/user/delete', lowcode.deleteProjectUser);

// 获取项目菜单列表
router.get('/project/menu/list', lowcode.getProjectMenuList);
// 新增项目菜单
router.post('/project/menu/create', lowcode.createProjectMenu);
// 更新项目菜单
router.post('/project/menu/update', lowcode.updateProjectMenu);
// 删除项目菜单
router.post('/project/menu/delete', lowcode.deleteProjectMenu);

// 获取已注册低码平台用户列表
router.get('/user/list', lowcode.getUserList);

module.exports = router;
