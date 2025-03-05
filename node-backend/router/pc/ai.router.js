const Router = require('@koa/router');
const admin = require('../../controller/admin');
const router = new Router({ prefix: '/api/admin/ai' });

/**
 * pc 后台管理系统配置 ai 相关接口
 */

// 获取模型列表
router.get('/model/list', admin.getAIModelList);
// 新增模型
router.post('/model/create', admin.createAIModel);
// 删除模型
router.post('/model/delete', admin.deleteAIModel);
// 更新模型
router.post('/model/update', admin.updateAIModel);
// 模型上下线
router.post('/model/status', admin.statusAIModel);

// 获取用户列表
router.get('/user/list', admin.getUserList);

// 获取用户聊天列表
router.get('/chat/list', admin.getChatList);
// 删除用户聊天记录
router.post('/chat/delete', admin.deleteChat);

module.exports = router;
