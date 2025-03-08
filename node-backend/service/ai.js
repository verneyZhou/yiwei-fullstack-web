const axios = require('axios');
const OpenAI = require('openai');
const connection = require('../sql/index');
const { decodeToken } = require('../utils/jwt');
const SnowflakeIdGenerator = require('../utils/snowflake');
const wxService = require('./wx');
const {
    AI_KEY: {
        OPENAI_API_KEY,
        DEEPSEEK_API_KEY,
        SILICONFLOW_API_KEY,
        KIMI_API_KEY,
        ZHIPU_API_KEY,
    },
} = require('../config');

// 初始化雪花算法生成器（建议在全局配置）
const idGenerator = new SnowflakeIdGenerator(1, 1);

const DpOpenAI = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: DEEPSEEK_API_KEY,
});

const ChatOpenAI = new OpenAI({
    apiKey: OPENAI_API_KEY, // 替换为你的OpenAI API密钥
});

const KimiOpenAI = new OpenAI({
    apiKey: KIMI_API_KEY,
    baseURL: 'https://api.moonshot.cn/v1',
});

const ZhipuOpenAI = new OpenAI({
    apiKey: ZHIPU_API_KEY,
    baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
});

class AIService {
    constructor() {
        // this.modelList = [
        //     { label: '硅基流动-DS-R1', value: 'siliconflow-ds-r1' },
        //     { label: '硅基流动-DS-V3', value: 'siliconflow-ds-v3' },
        //     {
        //         label: '硅基流动-DS-R1-Qwen-7b',
        //         value: 'siliconflow-ds-r1-qwen-7b',
        //     },
        //     {
        //         label: '硅基流动-Qwen2.5-7b',
        //         value: 'siliconflow-qwen2.5-7b',
        //     },
        //     {
        //         label: '硅基流动-Qwen2.5-Coder-7b',
        //         value: 'siliconflow-qwen2.5-coder-7b',
        //     },
        //     { label: 'Kimi-v1', value: 'moonshot-v1-8k' },
        //     { label: '智谱-GLM-4', value: 'glm-4-flash' },
        //     { label: 'GPT-4o', value: 'gpt-4o' },
        //     { label: 'GPT-4o-mini', value: 'gpt-4o-mini' },
        //     { label: 'GPT-3.5-turbo', value: 'gpt-3.5-turbo' },
        //     { label: 'DeepSeek-V3', value: 'deepseek-v3' },
        //     { label: 'DeepSeek-R1', value: 'deepseek-r1' },
        //     // { label: '文心一言', value: 'ernie' },
        // ];
        this.modelList = [];
    }

    async getErnieAccessToken() {
        const apiKey = ERNIE_API_KEY;
        const secretKey = ERNIE_SECRET_KEY;
        const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`;

        try {
            const response = await axios.post(url);
            return response.data.access_token;
        } catch (error) {
            console.error('获取文心一言access_token失败:', error);
            throw error;
        }
    }

    async chat(ctx) {
        console.log('======chat', ctx.request.body);
        const { model, chat_id } = ctx.request.body;
        try {
            if (this.modelList.length === 0) {
                this.modelList = await this.getModels();
            }
            if (!chat_id) {
            }
            const modelItem = this.modelList.find(
                (item) => item.name === model
            );
            if (!modelItem) {
                throw new Error('不支持的AI模型');
            }

            if (model.includes('deepseek')) {
                return this.chatDeepSeek(ctx);
            }
            if (model.includes('gpt')) {
                return this.chatGPT(ctx);
            }

            if (model.includes('siliconflow')) {
                return this.chatSiliconFlow(ctx);
            }

            if (model.includes('moonshot') || model.includes('kimi')) {
                return this.chatKimi(ctx);
            }
            if (model.includes('glm')) {
                return this.chatZhipu(ctx);
            }
        } catch (error) {
            console.error(`AI聊天请求失败 [${model}]:`, error);
            throw error;
        }
    }

    /**
     * GPT 模型
     */
    //  聊天
    async chatGPT(ctx) {
        console.log('======chatGPT', ctx.request.body);
        const { messages, model } = ctx.request.body;
        return new Promise(async (resolve, reject) => {
            try {
                const response = await ChatOpenAI.chat.completions.create({
                    model,
                    messages,
                    temperature: 1.3,
                });
                console.log('======response', response);
                resolve(response.choices[0].message);
            } catch (error) {
                console.log('======error', error);
                reject(error);
            }
        });
    }

    /**
     * 硅基流动 模型
     */
    //  聊天
    async chatSiliconFlow(ctx) {
        console.log('======chatSiliconFlow', ctx.request.body);
        const { messages, model } = ctx.request.body;
        return new Promise(async (resolve, reject) => {
            try {
                // resolve({
                //     message: {
                //         content:
                //             '您好！我是由中国的深度求索（DeepSeek）公司开发的智能助手DeepSeek-R1。如您有任何问题，我会尽我所能为您提供帮助。',
                //         reasoning_content:
                //             '好的，用户又问了“你是谁”这个问题。之前已经回答过同样的问题',
                //         role: 'assistant',
                //     },
                // });
                // return;
                const modelMap = {
                    'siliconflow-ds-r1': 'deepseek-ai/DeepSeek-R1',
                    'siliconflow-ds-v3': 'deepseek-ai/DeepSeek-V3',
                    'siliconflow-ds-r1-qwen-7b':
                        'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
                    'siliconflow-qwen2.5-7b': 'Qwen/Qwen2.5-7B-Instruct',
                    'siliconflow-qwen2.5-coder-7b':
                        'Qwen/Qwen2.5-Coder-7B-Instruct',
                };
                if (!modelMap[model]) {
                    reject(new Error('不支持的模型'));
                }
                const config = {
                    method: 'POST',
                    url: 'https://api.siliconflow.cn/v1/chat/completions',
                    headers: {
                        Authorization: `Bearer ${SILICONFLOW_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    data: JSON.stringify({
                        model: modelMap[model],
                        messages,
                        max_tokens: 512,
                        temperature: 1.3,
                    }),
                };
                axios(config)
                    .then((res) => {
                        const { choices = [] } = res.data || {};
                        resolve({
                            ...res.data,
                            message: choices[0]?.message || null,
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                        reject(error);
                    });
            } catch (error) {
                console.log('======error', error);
                reject(error);
            }
        });
    }

    /**
     * Kimi 模型
     */
    //  聊天
    async chatKimi(ctx) {
        console.log('======chatKimi', ctx.request.body);
        const { messages = [], model } = ctx.request.body;
        const preset = {
            role: 'system',
            content:
                '你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。',
        };
        messages.unshift(preset);
        console.log('======messages', messages);
        return new Promise(async (resolve, reject) => {
            try {
                const res = await KimiOpenAI.chat.completions.create({
                    model,
                    messages,
                    temperature: 0.6,
                });
                console.log('======res', res);
                const { choices = [] } = res || {};
                resolve({
                    ...res,
                    message: choices[0]?.message || null,
                });
            } catch (error) {
                console.log('======error', error);
                reject(error);
            }
        });
    }

    /**
     * 智谱清言 模型
     */
    //  聊天
    async chatZhipu(ctx) {
        console.log('======chatZhipu', ctx.request.body);
        const { messages, model } = ctx.request.body;
        return new Promise(async (resolve, reject) => {
            try {
                const res = await ZhipuOpenAI.chat.completions.create({
                    model,
                    messages,
                    temperature: 0.6,
                });
                console.log('======response', res);
                const { choices = [] } = res || {};
                resolve({
                    ...res,
                    message: choices[0]?.message || null,
                });
            } catch (error) {
                console.log('======error', error);
                reject(error);
            }
        });
    }

    /**
     * DeepSeek 模型  https://api-docs.deepseek.com/zh-cn/
     */
    //  聊天
    async chatDeepSeek(ctx) {
        console.log('======chatDeepSeek', ctx.request.body);
        const { messages, model } = ctx.request.body;
        return new Promise(async (resolve, reject) => {
            try {
                // const balance = await this.getBalance();
                // if (balance.available < 1) {
                //     throw new Error('余额不足');
                // }
                const response = await DpOpenAI.chat.completions.create({
                    // model: 'deepseek-chat', // V1
                    model:
                        model === 'deepseek-v3'
                            ? 'deepseek-chat'
                            : 'deepseek-reasoner', // R1 推理模型
                    messages,
                    temperature: 1.3,
                });
                console.log('======response', response);
                resolve(response.choices[0].message);
            } catch (error) {
                console.log('======error', error);
                reject(error);
            }
        });
    }
    // 查询模型列表
    async getModels(ctx) {
        return new Promise(async (resolve, reject) => {
            // const models = await DpOpenAI.models.list();
            // console.log('======models', models.data);
            // resolve(this.modelList);
            try {
                const statement = `SELECT * FROM admin.model_table WHERE status = 1;`; // 获取已上线的模型
                // 执行查询
                const [result] = await connection.execute(statement);
                resolve(result);
            } catch (error) {
                console.log('======error', error);
                reject(error);
            }
        });
    }

    //  查询是否有可用余额
    async getBalance() {
        return new Promise(async (resolve) => {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: 'https://api.deepseek.com/user/balance',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
                },
            };

            axios(config)
                .then((response) => {
                    console.log(JSON.stringify(response.data));
                    resolve(response.data);
                })
                .catch((error) => {
                    console.log(error);
                });
        });
    }

    // 保存对话记录
    async saveChatRecord(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const {
                    openid = '',
                    uid = '',
                    username = '',
                } = decodeToken(ctx);
                console.log('======saveChatRecord', openid, uid, username);
                let { chat_id, model, messages } = ctx.request.body;
                // messages = JSON.stringify(messages);
                console.log('======save chat', ctx.request.body);
                // 新增对话记录
                if (!chat_id) {
                    let creator = username || '';
                    const creator_id = uid || openid;
                    // wx用户
                    if (!creator && openid) {
                        const { username, nick_name } =
                            await wxService.getUserInfo(ctx);
                        creator = username || nick_name;
                    }
                    // chat_id = `CHAT_${(openid || uid).slice(
                    //     0,
                    //     6
                    // )}_${+new Date()}`;
                    chat_id = `CHAT_${idGenerator.generate()}`;
                    const time = new Date();
                    const statement = `
        INSERT INTO admin.chat_table (chat_id, model, messages, creator, create_time, creator_id)
        VALUES (?,?,?,?,?,?);
        `;
                    const [result] = await connection.execute(statement, [
                        chat_id,
                        model,
                        messages,
                        creator,
                        time,
                        creator_id,
                    ]);
                    resolve({ chat_id });
                } else {
                    // 更新
                    const statement = `UPDATE admin.chat_table SET messages = ? WHERE chat_id = ?;`;

                    // 执行查询
                    const [result] = await connection.execute(statement, [
                        messages,
                        chat_id,
                    ]);
                    console.log(result);
                    resolve({ chat_id });
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    // 获取对话记录
    async getChat(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { openid = '', uid = '' } = decodeToken(ctx);
                console.log('======getChat', uid, openid);
                const creator_id = uid || openid;
                // 按创建时间倒序
                const statement = `SELECT * FROM admin.chat_table WHERE creator_id =? ORDER BY create_time DESC;`;
                // 执行查询
                const [result] = await connection.execute(statement, [
                    creator_id,
                ]);
                console.log(result);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
    // 删除对话
    async deleteChat(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { chat_id } = ctx.request.body;
                console.log('======deleteChat', chat_id);
                const statement = `DELETE FROM admin.chat_table WHERE chat_id =?;`;
                // 执行查询
                const [result] = await connection.execute(statement, [chat_id]);
                console.log(result);
                resolve({
                    success: true,
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = new AIService();
