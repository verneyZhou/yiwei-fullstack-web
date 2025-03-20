const Router = require('@koa/router');
const game = require('../../controller/game');
const router = new Router({ prefix: '/api/game' });

// 获取用户tetris分数
router.get('/tetrisScore', game.getTetrisScore);
// 更新用户tetris分数
router.post('/update/tetrisScore', game.updateTetrisScore);
// 获取tetris排行榜
router.get('/tetrisRank', game.getTetrisRank);
// 获取用户贪吃蛇分数
router.get('/snakeScore', game.getSnakeScore);
// 更新用户贪吃蛇分数
router.post('/update/snakeScore', game.updateSnakeScore);
// 获取贪吃蛇排行榜
router.get('/snakeRank', game.getSnakeRank);
module.exports = router;
