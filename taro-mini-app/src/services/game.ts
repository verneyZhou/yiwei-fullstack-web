
import {get, post, postJSON} from './axios';


// 获取tetris分数
export const _gameTetrisScore = (params: any) => {
  return get('/api/game/tetrisScore', params);
};

// 更新tetris分数
export const _updateTetrisScore = (params: any) => {
  return postJSON('/api/game/update/tetrisScore', params);
};

// 获取贪吃蛇分数
export const _gameSnakeScore = (params: any) => {
  return get('/api/game/snakeScore', params);
};
// 更新贪吃蛇分数
export const _updateSnakeScore = (params: any) => {
  return postJSON('/api/game/update/snakeScore', params);
};

// 获取贪吃蛇排行榜
export const _gameSnakeRank = (params: any) => {
  return get('/api/game/snakeRank', params);
};
// 获取tetris排行榜
export const _gameTetrisRank = (params: any) => {
  return get('/api/game/tetrisRank', params);
};






