const connection = require('../sql/index');
const { randomString, isNotEmpty } = require('../utils/util');

class AdminService {
    // 获取模型列表，支持筛选
    async getAIModels(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const {
                    page_size = 10,
                    page_num = 1,
                    name,
                    company,
                    status,
                } = ctx.request.query;
                console.log(ctx.request.query);
                // 构建基础查询语句
                let statement = `SELECT * FROM admin.model_table WHERE 1=1`;
                const params = [];
                // 添加名称模糊搜索条件
                if (name) {
                    statement += ` AND name LIKE ?`;
                    params.push(`%${name}%`);
                }
                // 添加公司模糊搜索条件
                if (company) {
                    statement += ` AND company LIKE ?`;
                    params.push(`%${company}%`);
                }

                // 添加状态筛选条件
                if (isNotEmpty(status)) {
                    statement += ` AND status = ?`;
                    params.push(status);
                }

                // 计算总数
                // 将之前构建的查询语句 statement 作为子查询；统计子查询结果的总行数；将统计结果命名为 total
                // 在 SQL 中，as t 是给子查询结果指定一个临时表的别名（alias）。这里的 t 可以是任何有效的标识符，比如也可以写成 as temp 或 as result。这里的 as t 就是给包含在括号中的子查询 ${statement} 指定一个别名，使整个 SQL 语句在语法上是完整和正确的。
                const countStatement = `SELECT COUNT(*) as total FROM (${statement}) as t`;
                const [[{ total }]] = await connection.execute(
                    countStatement,
                    params
                );

                // 添加分页
                const pageSize = parseInt(page_size, 10);
                const pageNum = parseInt(page_num, 10);
                const limit = pageSize;
                const offset = pageSize * (pageNum - 1);
                statement += ` LIMIT ${limit} OFFSET ${offset}`;
                console.log(statement, params);

                // 执行查询
                const [result] = await connection.execute(statement, params);
                console.log(result, total);

                resolve({
                    list: result,
                    pagination: {
                        total,
                        page_size: pageSize,
                        page_num: pageNum,
                    },
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // 添加模型
    async createAIModel(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { name, label, company, temperature } = ctx.request.body;
                const id = randomString('mode_id_', 6);
                const time = new Date();
                const statement = `
        INSERT INTO admin.model_table (id, name, label, company, temperature, create_time, status)
        VALUES (?,?, ?, ?, ?, ?, 0)
        `;
                const [result] = await connection.execute(statement, [
                    id,
                    name,
                    label,
                    company,
                    temperature,
                    time,
                ]);
                console.log(result);
                resolve({ id });
            } catch (error) {
                reject(error);
            }
        });
    }
    // 更新模型
    async updateAIModel(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { id, name, label, company, temperature } =
                    ctx.request.body;
                const time = new Date();
                const statement = `
        UPDATE admin.model_table
        SET name = ?, label = ?, company = ?, temperature = ?, update_time = ?
        WHERE id = ?
        `;
                const [result] = await connection.execute(statement, [
                    name,
                    label,
                    company,
                    temperature,
                    time,
                    id,
                ]);
                console.log(result);
                resolve({ id });
            } catch (error) {
                reject(error);
            }
        });
    }
    // 删除模型
    async deleteAIModel(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { ids } = ctx.request.body;
                // 构建 IN 查询条件的占位符
                const idsArr = ids.split(',');
                const placeholders = idsArr.map(() => '?').join(',');
                // const statement = ` DELETE FROM admin.model_table WHERE id =?`;
                const statement = `DELETE FROM admin.model_table WHERE id IN (${placeholders})`;
                const [result] = await connection.execute(statement, idsArr);
                console.log(result);
                resolve({ success: true });
            } catch (error) {
                reject(error);
            }
        });
    }
    // 模型上下线
    async statusAIModel(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { id, status } = ctx.request.body;
                const time = new Date();
                const statement = `
        UPDATE admin.model_table
        SET status = ?, update_time = ?
        WHERE id = ?
        `;
                const [result] = await connection.execute(statement, [
                    status,
                    time,
                    id,
                ]);
                console.log(result);
                resolve({ id });
            } catch (error) {
                reject(error);
            }
        });
    }

    // 获取用户列表
    async getUserList(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const {
                    page_size = 10,
                    page_num = 1,
                    username,
                    register_type = 'wechat',
                } = ctx.request.query;
                console.log(ctx.request.query);
                // 构建基础查询语句
                let statement = '';
                if (register_type === 'wechat') {
                    // 微信用户
                    statement = `SELECT * FROM mobile.user_table WHERE 1=1`;
                } else {
                    // 账号密码注册用户
                    statement = `SELECT * FROM mobile.account_table WHERE 1=1`;
                }
                const params = [];
                // 添加名称模糊搜索条件
                if (username) {
                    statement += ` AND ${
                        register_type === 'wechat' ? 'nick_name' : 'username'
                    } LIKE ?`;
                    params.push(`%${username}%`);
                }

                const countStatement = `SELECT COUNT(*) as total FROM (${statement}) as t`;
                const [[{ total }]] = await connection.execute(
                    countStatement,
                    params
                );

                // 添加分页
                const pageSize = parseInt(page_size, 10);
                const pageNum = parseInt(page_num, 10);
                const limit = pageSize;
                const offset = pageSize * (pageNum - 1);
                statement += ` LIMIT ${limit} OFFSET ${offset}`;
                console.log(statement, params);

                // 执行查询
                const [result] = await connection.execute(statement, params);
                console.log(result, total);

                resolve({
                    list: result,
                    pagination: {
                        total,
                        page_size: pageSize,
                        page_num: pageNum,
                    },
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // 获取聊天列表
    async getChatList(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const {
                    page_size = 10,
                    page_num = 1,
                    creator,
                    model,
                } = ctx.request.query;
                console.log(ctx.request.query);
                // 构建基础查询语句
                let statement = `SELECT * FROM admin.chat_table WHERE 1=1`;
                const params = [];
                // 添加名称模糊搜索条件
                if (creator) {
                    statement += ` AND creator LIKE ?`;
                    params.push(`%${creator}%`);
                }
                if (model) {
                    statement += ` AND model LIKE?`;
                    params.push(`%${model}%`);
                }

                const countStatement = `SELECT COUNT(*) as total FROM (${statement}) as t`;
                const [[{ total }]] = await connection.execute(
                    countStatement,
                    params
                );

                // 添加分页
                const pageSize = parseInt(page_size, 10);
                const pageNum = parseInt(page_num, 10);
                const limit = pageSize;
                const offset = pageSize * (pageNum - 1);
                statement += ` LIMIT ${limit} OFFSET ${offset}`;
                console.log(statement, params);

                // 执行查询
                const [result] = await connection.execute(statement, params);
                console.log(result, total);

                resolve({
                    list: result,
                    pagination: {
                        total,
                        page_size: pageSize,
                        page_num: pageNum,
                    },
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // 删除聊天记录
    async deleteChat(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { ids } = ctx.request.body;
                // 构建 IN 查询条件的占位符
                const idsArr = ids.split(',');
                const placeholders = idsArr.map(() => '?').join(',');
                const statement = `DELETE FROM admin.chat_table WHERE chat_id IN (${placeholders})`;
                const [result] = await connection.execute(statement, idsArr);
                console.log(result);
                resolve({ success: true });
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = new AdminService();
