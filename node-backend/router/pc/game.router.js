const Router = require('@koa/router');
const admin = require('../../controller/admin');
const router = new Router({ prefix: '/api/admin/game' });

/**
 * pc 后台管理系统配置 game 相关接口
 */

// 获取俄罗斯方块用户成绩列表
router.get('/tetrisScore/list', admin.getTetrisScoreList);
// 删除俄罗斯方块用户成绩
router.post('/tetrisScore/delete', admin.deleteTetrisScore);

// 获取贪吃蛇用户成绩列表
router.get('/snakeScore/list', admin.getSnakeScoreList);
// 删除贪吃蛇用户成绩
router.post('/snakeScore/delete', admin.deleteSnakeScore);

module.exports = router;
