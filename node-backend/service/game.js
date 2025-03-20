const axios = require('axios');
const OpenAI = require('openai');
const SnowflakeIdGenerator = require('../utils/snowflake');
const connection = require('../sql/index');
const { decodeToken } = require('../utils/jwt');
const wxService = require('./wx');

const idGenerator = new SnowflakeIdGenerator(1, 1);

class GameService {
    constructor() {}

    // 获取用户tetris分数
    async getTetrisScore(ctx) {
        console.log('======getTetrisScore', ctx.request.query);
        return new Promise(async (resolve, reject) => {
            try {
                let { level } = ctx.request.query;
                const { openid = '', uid = '' } = decodeToken(ctx);
                console.log('======getTetrisScore', uid, openid, level);
                const creator_id = uid || openid;
                // 构建基础查询语句
                let statement = `SELECT * FROM admin.tetris_score_table WHERE uid = ?`;
                const params = [creator_id];

                // 如果指定了难度级别，添加level筛选条件
                if (level) {
                    statement += ` AND level = ?`;
                    params.push(level);
                }

                // 按创建时间倒序
                statement += ` ORDER BY create_time DESC`;

                // 执行查询
                const [result] = await connection.execute(statement, params);
                console.log(result);
                resolve(result && result.length ? result[0] : null);
            } catch (error) {
                reject(error);
            }
        });
    }

    // 更新用户tetris分数
    async updateTetrisScore(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const envType = ctx.get('env-type') || '';
                console.log('====envType', envType);
                const {
                    openid = '',
                    uid = '',
                    username = '',
                } = decodeToken(ctx);
                console.log('======updateTetrisScore', openid, uid, username);
                let { score, level } = ctx.request.body;
                ctx.request.query.level = level; // 将level添加到query中以便后续使用
                console.log('======save updateTetrisScore', ctx.request.body);
                const res = await this.getTetrisScore(ctx);
                // 新增成绩
                if (!res) {
                    let creator = username || '';
                    const creator_id = uid || openid;
                    // wx用户
                    if (!creator && openid) {
                        const { username, nick_name } =
                            await wxService.getUserInfo(ctx);
                        creator = username || nick_name;
                    }
                    const score_id = `TETRIS_SCORE_${idGenerator.generate()}`;
                    const time = new Date();
                    const statement = `
        INSERT INTO admin.tetris_score_table (score_id, score, username, create_time, uid, platform, level)
        VALUES (?,?,?,?,?,?,?);
        `;
                    const [result] = await connection.execute(statement, [
                        score_id,
                        score,
                        username,
                        time,
                        creator_id,
                        envType,
                        level,
                    ]);
                    resolve({ score_id, score, level });
                } else {
                    // 更新
                    const time = new Date();
                    const statement = `UPDATE admin.tetris_score_table SET score = ?, update_time = ? WHERE score_id = ?;`;

                    const { score_id, level } = res;
                    // 执行查询
                    const [result] = await connection.execute(statement, [
                        score,
                        time,
                        score_id,
                    ]);
                    console.log(result);
                    resolve({ score_id, score, level });
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    // 获取tetris排行榜
    async getTetrisRank(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { level } = ctx.request.query;
                // 按分数倒序
                let statement = `SELECT * FROM admin.tetris_score_table WHERE 1=1 AND level = ? ORDER BY score DESC;`;
                // 执行查询
                const [result] = await connection.execute(statement, [level]);
                console.log(result);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    // 获取用户贪吃蛇分数
    async getSnakeScore(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                let { level } = ctx.request.query;
                const { openid = '', uid = '' } = decodeToken(ctx);
                console.log('======getSnakeScore', uid, openid, level);
                const creator_id = uid || openid;
                // 构建基础查询语句
                let statement = `SELECT * FROM admin.snake_score_table WHERE uid = ?`;
                const params = [creator_id];

                // 如果指定了难度级别，添加level筛选条件
                if (level) {
                    statement += ` AND level = ?`;
                    params.push(level);
                }

                // 按创建时间倒序
                statement += ` ORDER BY create_time DESC`;

                // 执行查询
                const [result] = await connection.execute(statement, params);
                console.log(result);
                resolve(result && result.length ? result[0] : null);
            } catch (error) {
                reject(error);
            }
        });
    }

    // 更新用户贪吃蛇分数
    async updateSnakeScore(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const envType = ctx.get('env-type') || '';
                console.log('====envType', envType);
                const {
                    openid = '',
                    uid = '',
                    username = '',
                } = decodeToken(ctx);
                console.log('======updateSnakeScore', openid, uid, username);
                let { score, level } = ctx.request.body;
                ctx.request.query.level = level; // 将level添加到query中以便后续使用
                console.log('======save updateSnakeScore', ctx.request.body);
                const res = await this.getSnakeScore(ctx);
                // 新增成绩
                if (!res) {
                    let creator = username || '';
                    console.log(
                        '======save updateSnakeScore 11111',
                        creator,
                        openid
                    );
                    const creator_id = uid || openid;
                    // wx用户
                    if (!creator && openid) {
                        const { username, nick_name } =
                            await wxService.getUserInfo(ctx);
                        creator = username || nick_name;
                        console.log(
                            '======save updateSnakeScore 22222',
                            username,
                            nick_name
                        );
                    }
                    const score_id = `TETRIS_SCORE_${idGenerator.generate()}`;
                    const time = new Date();
                    const statement = `
        INSERT INTO admin.snake_score_table (score_id, score, username, create_time, uid, platform, level)
        VALUES (?,?,?,?,?,?,?);
        `;
                    const [result] = await connection.execute(statement, [
                        score_id,
                        score,
                        username,
                        time,
                        creator_id,
                        envType,
                        level,
                    ]);
                    resolve({ score_id, score, level });
                } else {
                    // 更新
                    const time = new Date();
                    const statement = `UPDATE admin.snake_score_table SET score = ?, update_time = ? WHERE score_id = ?;`;

                    const { score_id, level } = res;
                    // 执行查询
                    const [result] = await connection.execute(statement, [
                        score,
                        time,
                        score_id,
                    ]);
                    console.log(result);
                    resolve({ score_id, score, level });
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    // 获取贪吃蛇排行榜
    async getSnakeRank(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { level } = ctx.request.query;
                // 按分数倒序
                let statement = `SELECT * FROM admin.snake_score_table WHERE 1=1 AND level = ? ORDER BY score DESC;`;
                // 执行查询
                const [result] = await connection.execute(statement, [level]);
                console.log(result);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = new GameService();
