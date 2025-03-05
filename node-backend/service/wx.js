const connection = require('../sql/index');
const axios = require('axios');
const { MINI_CONFIG } = require('../config');
const { createToken, decodeToken } = require('../utils/jwt');
// const { nanoid } = require('nanoid');
const SnowflakeIdGenerator = require('../utils/snowflake');
// const { v4: uuidv4 } = require('uuid');

// 初始化雪花算法生成器（建议在全局配置）
const idGenerator = new SnowflakeIdGenerator(1, 1);

class WxService {
    // 小程序登录
    // https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-login/code2Session.html
    async postAuthLogin(ctx) {
        return new Promise(async (resolve, reject) => {
            const envType = ctx.get('env-type') || '';
            const { code, type } = ctx.request.body;
            try {
                const res = await axios.get(
                    'https://api.weixin.qq.com/sns/jscode2session',
                    {
                        params: {
                            appid: MINI_CONFIG.appid,
                            secret: MINI_CONFIG.app_secret,
                            js_code: code,
                            grant_type: 'authorization_code',
                        },
                    }
                );
                console.log('======postAuthLogin res', res.data);
                const { unionid, openid, session_key } = res.data || {};
                if (openid && session_key) {
                    const { username, uid = '' } = await this.updateUserTable(
                        openid,
                        { session_key, unionid, envType },
                        'create'
                    );
                    console.log('======postAuthLogin nick_name', username, uid);
                    const token = createToken({ openid, username, uid });
                    resolve({ token, uid, username });
                } else {
                    reject({
                        code: data.errcode,
                        message: data.errmsg,
                    });
                }
            } catch (error) {
                console.log('======postAuthLogin error', error);
                reject({
                    code: 400,
                    message: error.message || '未知错误',
                });
            }
        });
    }
    // 获取用户信息
    async getUserInfo(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const decode_token = decodeToken(ctx);
                console.log('======getUserInfo decode_token', decode_token);
                const { openid } = decode_token;
                if (!openid) {
                    reject({
                        code: 400,
                        message: '用户不存在',
                    });
                }
                const statement = `SELECT * FROM mobile.user_table WHERE openid = ? ;`;
                const [result] = await connection.execute(statement, [openid]);
                console.log('======getUserInfo result', result);
                if (result.length > 0) {
                    resolve({
                        ...result[0],
                    });
                } else {
                    reject({
                        code: 400,
                        message: '用户不存在',
                    });
                }
            } catch (error) {
                reject(error);
            }
        });
    }
    // 更新用户信息
    async updateUserInfo(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const decode_token = decodeToken(ctx);
                console.log('======updateUserInfo decode_token', decode_token);
                const { openid } = decode_token;
                if (!openid) {
                    reject({
                        code: 400,
                        message: '用户不存在',
                    });
                }
                const { nick_name, avatar } = ctx.request.body;
                const { username, uid } = await this.updateUserTable(
                    openid,
                    { nick_name, avatar },
                    'update'
                );
                resolve({ msg: 'success', username, uid });
            } catch (err) {
                reject(err);
            }
        });
    }

    // 注销用户信息
    async deleteUserInfo(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const decode_token = decodeToken(ctx);
                console.log('======deleteUserInfo decode_token', decode_token);
                const { openid } = decode_token;
                if (!openid) {
                    reject({
                        code: 400,
                        message: '注销异常',
                    });
                }
                const statement =
                    'DELETE FROM mobile.user_table WHERE openid = ?;';
                const [result] = await connection.execute(statement, [openid]);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }

    // 更新用户表信息
    async updateUserTable(openid, info = {}, type = 'create') {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('======updateUserTable openid', openid, info);
                if (!openid) {
                    reject({
                        code: 400,
                        message: 'openid不存在',
                    });
                }
                const { session_key, unionid, nick_name, avatar, envType } =
                    info;
                const statement = `SELECT * FROM mobile.user_table WHERE openid = ? ;`;
                const [result] = await connection.execute(statement, [openid]);
                console.log('======updateUserTable result', result);
                if (result.length > 0 && type === 'update') {
                    const { uid } = result[0];
                    // 更新
                    const date = new Date();
                    let statement =
                        'UPDATE mobile.user_table SET update_time = ?';
                    const params = [date];
                    if (nick_name) {
                        statement += ', nick_name = ?, username = ?';
                        params.push(nick_name, nick_name);
                    }
                    if (avatar) {
                        statement += ', avatar = ?';
                        params.push(avatar);
                    }
                    statement += ' WHERE openid = ?;';
                    params.push(openid);
                    await connection.execute(statement, params);
                    resolve({ username: nick_name, openid, uid });
                } else if (result.length === 0 && type === 'create') {
                    // 新增
                    const statement = `INSERT INTO mobile.user_table (openid, session_key, unionid, create_time, uid, env_type) VALUES (?, ?, ?, ?, ?, ?);`;
                    const time = new Date();
                    // const uid = `USER_${uuidv4().substring(8)}_wx`;
                    const uid = `USER_WX_${idGenerator.generate()}`;
                    await connection.execute(statement, [
                        openid,
                        session_key,
                        unionid,
                        time,
                        uid,
                        envType,
                    ]);
                    resolve({ openid, uid });
                } else {
                    const { uid, username } = result[0] || {};
                    resolve({ username, openid, uid });
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new WxService();
