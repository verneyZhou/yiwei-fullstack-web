const Router = require('@koa/router');
const ai = require('../../controller/ai');
const router = new Router({ prefix: '/api/ai' });

// AI聊天接口
router.post('/chat', ai.chat);
// 获取可用模型列表
router.get('/models', ai.getModels);
// 获取余额
router.get('/balance', ai.getBalance);
// 新增对话数据
router.post('/saveChat', ai.saveChat);
// 获取对话数据
router.get('/getChat', ai.getChat);
// 删除对话
router.post('/deleteChat', ai.deleteChat);
module.exports = router;
