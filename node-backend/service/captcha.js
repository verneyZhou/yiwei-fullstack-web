const svgCaptcha = require('svg-captcha');
// const Redis = require('ioredis');
const connection = require('../sql/index');
const SnowflakeIdGenerator = require('../utils/snowflake');
const { createToken, decodeToken } = require('../utils/jwt');
// const { v4: uuidv4 } = require('uuid');
// const { nanoid } = require('nanoid');
// const redis = new Redis({
//     // port: 6379, // Redis port 默认是6379
//     // host: '127.0.0.1',
// });
// // 连接到Redis
// redis.on('connect', () => {
//     console.log('Connected to Redis');
// });
// // 断开与Redis的连接
// redis.on('error', (err) => {
//     console.log(`Redis error: ${err}`);
// });

const captchaMap = new Map();
// 初始化雪花算法生成器（建议在全局配置）
const idGenerator = new SnowflakeIdGenerator(1, 1);

/**
 * 账号+密码+图形验证码登录
 */

class CaptchaService {
    // 生成图形验证码
    async generateCaptcha(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const captcha = svgCaptcha.create({
                    size: 4, // 验证码长度
                    width: 120, // 验证码图片宽度
                    height: 40, // 验证码图片高度
                    fontSize: 30, // 验证码字体大小
                    noise: Math.floor(Math.random() * 5), //干扰线条数目_随机0-5条 可以增加一些噪点，但不影响背景
                    color: true, //验证码字符是否有颜色，默认是没有，但是如果设置了背景颜色，那么默认就是有字符颜色
                    // background: '#f1f5f8', //背景色
                    ignoreChars: '0o1i', // 避免混淆字符
                });

                // const captchaId = `captcha:${
                //     Date.now() + Math.random().toString(36).substr(2)
                // }`;
                // 使用雪花算法生成ID
                const captchaId = `CAPTCHA_${idGenerator.generate()}`;
                console.log('====captchaId', captchaId);
                // 将验证码存入 Redis，设置 5 分钟过期
                // await redis.set(
                //     `captcha:${captchaId}`,
                //     captcha.text.toLowerCase(),
                //     'EX',
                //     300 // 5 minutes
                // );
                captchaMap.set(captchaId, {
                    captcha: captcha.text.toLowerCase(),
                    expire: Date.now() + 300000, // 5 minutes
                });

                let img = new Buffer.from(captcha.data).toString('base64'); // 验证码
                let base64Img = 'data:image/svg+xml;base64,' + img;

                resolve({
                    id: captchaId,
                    image: base64Img,
                    captcha,
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // 验证验证码
    async verifyCaptcha(ctx) {
        return new Promise(async (resolve, reject) => {
            const { captcha_id: captchaId, code } = ctx.request.body;
            console.log(ctx.request.body, captchaMap);
            try {
                if (!captchaId || !code) {
                    reject({
                        code: 400,
                        message: '缺少验证码参数',
                    });
                    return;
                }
                // const savedCode = await redis.get(`captcha:${captchaId}`);
                const savedCode = captchaMap.get(captchaId);
                if (!savedCode) {
                    reject({
                        code: 400,
                        message: '验证码错误或已过期',
                    });
                    return;
                }

                if (savedCode && savedCode.expire < Date.now()) {
                    reject({
                        code: 400,
                        message: '验证码已过期',
                    });
                    return;
                }

                if (savedCode.captcha.toLowerCase() === code.toLowerCase()) {
                    resolve(true);
                } else {
                    reject({
                        code: 400,
                        message: '验证码错误',
                    });
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    // 登录
    async loginByCaptcha(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.verifyCaptcha(ctx); // 验证验证码
                const {
                    username,
                    password,
                    captcha_id: captchaId,
                    platform = 'mobile',
                } = ctx.request.body;
                console.log('====platform', platform);
                // 查找用户
                let statement = '';
                // 移动端登录查询逻辑
                if (platform === 'mobile') {
                    statement = `SELECT * FROM mobile.account_table WHERE username =? ;`;
                } else if (platform === 'admin') {
                    // PC端登录查询逻辑
                    statement = `SELECT * FROM admin.user_table WHERE username =? ;`;
                }
                const [result] = await connection.execute(statement, [
                    username,
                ]);
                console.log(result);
                if (!result.length) {
                    reject({
                        code: 400,
                        message: '用户不存在',
                    });
                    return;
                }
                const user = result[0];
                if (user.password !== password) {
                    reject({
                        code: 400,
                        message: '密码错误',
                    });
                    return;
                }

                // 登录成功后，验证码已使用，可以删除
                // await redis.del(`captcha:${captchaId}`);
                captchaMap.delete(captchaId);

                // 生成 JWT token
                const token = createToken({
                    username: user.username,
                    uid: user.uid,
                });

                resolve({
                    token,
                    username,
                    uid: user.uid,
                    create_time: user.create_time,
                    message: '登录成功',
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // 注册
    async registerByCaptcha(ctx) {
        return new Promise(async (resolve, reject) => {
            const envType = ctx.get('env-type') || '';
            console.log('====envType', envType);
            const {
                username,
                password,
                confirm_password,
                captcha_id: captchaId,
                platform = 'mobile',
            } = ctx.request.body;
            try {
                if (password !== confirm_password) {
                    reject({
                        code: 400,
                        message: '两次密码不一致',
                    });
                    return;
                }
                await this.verifyCaptcha(ctx); // 验证验证码

                // 查找用户
                let statement = '';
                if (platform === 'mobile') {
                    statement = `SELECT * FROM mobile.account_table WHERE username =? ;`;
                } else if (platform === 'admin') {
                    statement = `SELECT * FROM admin.user_table WHERE username =? ;`;
                }
                const [result] = await connection.execute(statement, [
                    username,
                ]);
                console.log(result);
                if (result.length) {
                    reject({
                        code: 400,
                        message: '用户已存在',
                    });
                    return;
                }
                // 注册用户
                let statement2 = '';
                if (platform === 'mobile') {
                    statement2 = `INSERT INTO mobile.account_table (username, password, create_time, uid, env_type) VALUES (?, ?, ?, ?, ?);`;
                } else if (platform === 'admin') {
                    statement2 = `INSERT INTO admin.user_table (username, password, create_time, uid) VALUES (?, ?, ?, ?);`;
                }
                const time = new Date();
                // const user_id = uuidv4();
                // const uid = `USER_${uuidv4().slice(0, 8)}_captcha`;
                const uid = `USER_CA_${idGenerator.generate()}`;
                await connection.execute(statement2, [
                    username,
                    password,
                    time,
                    uid,
                    envType,
                ]);

                // 登录成功后，验证码已使用，可以删除
                captchaMap.delete(captchaId);

                // 生成 JWT token
                const token = createToken({
                    username,
                    uid,
                });

                resolve({
                    token,
                    username,
                    create_time: time,
                    uid,
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // 获取用户信息（通过账号+密码注册的：admin/mobile ）
    async getUserInfo(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const decode_token = decodeToken(ctx);
                console.log('======getUserInfo decode_token', decode_token);
                const { username } = decode_token;
                if (!username) {
                    reject({
                        code: 400,
                        message: '用户不存在',
                    });
                }
                const { platform = 'mobile' } = ctx.request.body;
                let statement = '';
                if (platform === 'admin') {
                    statement = `SELECT * FROM admin.user_table WHERE username =? ;`;
                } else if (platform === 'mobile') {
                    statement = `SELECT * FROM mobile.account_table WHERE username =? ;`;
                }
                const [result] = await connection.execute(statement, [
                    username,
                ]);
                if (!result.length) {
                    reject({
                        code: 400,
                        message: '用户不存在',
                    });
                    return;
                }
                console.log('======getUserInfo result', result);
                const res = {
                    ...result[0],
                };
                if (platform === 'admin') {
                    const { roles = '' } = result[0];
                    Object.assign(res, {
                        roles: !roles ? [] : roles.split(','),
                    });
                }
                resolve(res);
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = new CaptchaService();
