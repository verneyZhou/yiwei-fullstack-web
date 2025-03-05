const axios = require('axios');
const connection = require('../sql/index');
const { createToken, decodeToken } = require('../utils/jwt');

/**
 * 手机号+发送验证码登录
 */

class SmsService {
    constructor() {
        this.codeMap = new Map(); // 用于存储验证码
    }

    // 生成验证码
    generateCode() {
        return Math.random().toString().slice(-6);
    }

    // 发送验证码
    async sendCode(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { phone } = ctx.request.body;

                // 验证手机号格式
                if (!/^1[3-9]\d{9}$/.test(phone)) {
                    // throw new Error('无效的手机号');
                    reject({
                        code: 400,
                        message: '无效的手机号',
                    });
                }

                const code = this.generateCode();

                // 存储验证码，设置5分钟过期
                this.codeMap.set(phone, {
                    code,
                    expires: Date.now() + 5 * 60 * 1000,
                });

                // 调用短信服务商API发送验证码
                // 这里以阿里云短信服务为例
                const result = await axios.post('短信服务商API', {
                    phone,
                    code,
                    template: 'SMS_TEMPLATE_ID',
                });

                resolve({ success: true, sms_code: code });
            } catch (error) {
                console.error('发送验证码失败:', error);
                throw error;
            }
        });
    }

    // 验证验证码
    verifyCode(phone, code) {
        const savedData = this.codeMap.get(phone);
        if (!savedData) {
            return false;
        }

        if (Date.now() > savedData.expires) {
            this.codeMap.delete(phone);
            return false;
        }

        if (savedData.code === code) {
            this.codeMap.delete(phone);
            return true;
        }

        return false;
    }

    // 手机号验证码登录
    async loginWithCode(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { phone, code } = ctx.request.body;
                // 验证验证码
                const isValid = this.verifyCode(phone, code);
                if (!isValid) {
                    throw new Error('验证码无效或已过期');
                }

                // 查找或创建用户
                const statement = `SELECT * FROM mobile.phone_table WHERE phone = ? ;`;
                const [result] = await connection.execute(statement, [phone]);
                if (!result.length) {
                    // user = await UserModel.create({ phone });
                    // 新增
                    const statement = `INSERT INTO mobile.phone_table (phone, create_time) VALUES (?, ?);`;
                    const time = new Date();
                    await connection.execute(statement, [phone, time]);
                }

                // 生成 JWT token
                const token = createToken({ userId: user._id, phone });

                resolve({ token, user });
            } catch (error) {
                console.error('手机号验证码登录失败:', error);
                throw new Error(error);
            }
        });
    }
}

module.exports = new SmsService();
