const connection = require('../sql/index');
const SnowflakeIdGenerator = require('../utils/snowflake');
const { createToken, decodeToken } = require('../utils/jwt');
const { randomString, isNotEmpty } = require('../utils/util');

// 初始化雪花算法生成器（建议在全局配置）
const idGenerator = new SnowflakeIdGenerator(1, 2);

class LowCodeService {
    /**
     * 页面
     */
    // 获取页面列表
    async getPageList(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const {
                    page_size = 10,
                    page_num = 1,
                    name,
                    project_id,
                } = ctx.request.query;
                console.log(ctx.request.query);
                // const { uid = '' } = decodeToken(ctx);
                // console.log('======getPageList uid', uid);
                // const creator_id = uid;
                const creator_id = '001';

                // 构建基础查询语句
                let statement = `SELECT * FROM admin.lowcode_page_table WHERE 1=1`;
                const params = [];
                // 添加名称模糊搜索条件
                if (name) {
                    statement += ` AND name LIKE ?`;
                    params.push(`%${name}%`);
                }
                if (project_id) {
                    statement += ` AND project_id = ?`;
                    params.push(`${project_id}`);
                }
                if (creator_id) {
                    statement += ` AND creator_id = ?`;
                    params.push(`${creator_id}`);
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
                // 添加排序
                statement += ` ORDER BY update_time DESC`;
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
    // 删除页面
    async deletePage(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { id } = ctx.request.body;
                if (!id) {
                    reject(new Error('id is required'));
                    return;
                }
                const statement = `DELETE FROM admin.lowcode_page_table WHERE id = ?`;
                const [result] = await connection.execute(statement, id);
                console.log(result);
                resolve({ success: true });
            } catch (error) {
                reject(error);
            }
        });
    }
    // 创建页面
    async createPage(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                // const {uid = '' } = decodeToken(ctx);
                // const creator_id = uid;
                const creator_id = '001';
                const creator = 'admin';
                const { name, remark, project_id } = ctx.request.body;
                const page_id = `PAGE_${idGenerator.generate()}`;
                const time = new Date();
                const statement = `INSERT INTO admin.lowcode_page_table (id, name, remark, project_id, creator, creator_id, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                const [result] = await connection.execute(statement, [
                    page_id,
                    name,
                    remark,
                    project_id,
                    creator,
                    creator_id,
                    time,
                    time,
                ]);
                console.log(result);
                resolve({ id: page_id, name, creat_time: time });
            } catch (error) {
                reject(error);
            }
        });
    }
    // 更新页面
    async updatePage(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { id, name, remark, project_id, page_data } =
                    ctx.request.body;
                if (!id) {
                    reject(new Error('page_id is required'));
                    return;
                }
                // state 1 未保存 2 已保存 3 已发布 4 已回滚
                let statement = 'UPDATE admin.lowcode_page_table SET state = 2';
                const params = [];
                if (name) {
                    statement += `, name=?`;
                    params.push(name);
                }
                if (remark) {
                    statement += `, remark=?`;
                    params.push(remark);
                }
                if (project_id) {
                    statement += `, project_id=?`;
                    params.push(project_id);
                }
                if (page_data) {
                    statement += `, page_data=?`;
                    params.push(page_data);
                }
                statement += `, update_time=?`;
                statement += ` WHERE id=?`;
                const time = new Date();
                params.push(time, id);
                console.log(statement, params);
                const [result] = await connection.execute(statement, params);
                console.log(result);
                resolve({ id, name, update_time: time });
            } catch (error) {
                reject(error);
            }
        });
    }
    // 更改页面状态
    async changePageState(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { id, state, publish_id } = ctx.request.body;
                if (!id) {
                    reject(new Error('page_id is required'));
                    return;
                }
                if (!state) {
                    reject(new Error('state is required'));
                    return;
                }
                if (!publish_id) {
                    reject(new Error('publish_id is required'));
                    return;
                }
                const statement = `UPDATE admin.lowcode_page_table SET state = ?, publish_id = ? WHERE id = ?`;
                const [result] = await connection.execute(statement, [
                    state,
                    publish_id,
                    id,
                ]);
                console.log(result);
                resolve({ id, state });
            } catch (error) {
                reject(error);
            }
        });
    }
    // 获取页面详情
    async getPageDetail(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { id } = ctx.request.query;
                if (!id) {
                    reject(new Error('page_id is required'));
                    return;
                }
                const statement = `SELECT * FROM admin.lowcode_page_table WHERE id=?`;
                const [result] = await connection.execute(statement, [id]);
                console.log(result);
                if (result.length === 0) {
                    reject(new Error('page not found'));
                    return;
                }
                resolve(result[0]);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 发布相关操作
     */
    // 发布页面
    async publishPage(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { page_id, project_id } = ctx.request.body;
                if (!page_id) {
                    reject(new Error('page_id is required'));
                    return;
                }
                // if (!project_id) {
                //     reject(new Error('project_id is required'));
                //     return;
                // }
                // 获取页面详情
                const statement = `SELECT * FROM admin.lowcode_page_table WHERE id=?`;
                const [result] = await connection.execute(statement, [page_id]);
                if (!result || result.length === 0) {
                    reject(new Error('page not found'));
                    return;
                }
                const page = result[0];
                const { name, creator, creator_id, create_time, page_data } =
                    page;
                const publish_id = `PUBLISH_${idGenerator.generate()}`;
                const publish_time = new Date();
                // 插入发布记录
                const statement2 = `INSERT INTO admin.lowcode_publish_table (id, name, creator, creator_id, create_time, publish_time, page_id, page_data) VALUES (?,?,?,?,?,?,?,?)`;
                const [result2] = await connection.execute(statement2, [
                    publish_id,
                    name,
                    creator,
                    creator_id,
                    create_time,
                    publish_time,
                    page_id,
                    page_data,
                ]);
                console.log(result2);
                resolve({ id: publish_id, page_id, name, publish_time });
            } catch (error) {
                reject(error);
            }
        });
    }
    // 获取已发布页面列表
    async getPublishPageList(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const {
                    page_size = 10,
                    page_num = 1,
                    name,
                    page_id,
                } = ctx.request.query;
                console.log(ctx.request.query);

                // 构建基础查询语句
                let statement = `SELECT * FROM admin.lowcode_publish_table WHERE 1=1`;
                const params = [];
                // 添加名称模糊搜索条件
                if (name) {
                    statement += ` AND name LIKE ?`;
                    params.push(`%${name}%`);
                }
                if (page_id) {
                    statement += ` AND page_id = ?`;
                    params.push(`${page_id}`);
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
                // 默认按发布时间降序排序
                statement += ` ORDER BY publish_time DESC`;
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
    // 删除页面
    async deletePublishPage(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { ids } = ctx.request.body;
                if (!ids) {
                    reject(new Error('id is required'));
                    return;
                }
                // 构建 IN 查询条件的占位符
                const idsArr = ids.split(',');
                const placeholders = idsArr.map(() => '?').join(',');
                // const statement = ` DELETE FROM admin.model_table WHERE id =?`;
                const statement = `DELETE FROM admin.lowcode_publish_table WHERE id IN (${placeholders})`;
                const [result] = await connection.execute(statement, idsArr);
                console.log(result);
                resolve({ success: true });
            } catch (error) {
                reject(error);
            }
        });
    }
    // 获取最近发布页面详情
    async getPublishPageDetail(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { page_id, publish_id } = ctx.request.query;
                if (!page_id || !publish_id) {
                    reject(new Error('page_id and publish_id are required'));
                    return;
                }
                const statement = `SELECT * FROM admin.lowcode_publish_table WHERE id=? && page_id=?`;
                const [result] = await connection.execute(statement, [
                    publish_id,
                    page_id,
                ]);
                if (result.length === 0) {
                    reject(new Error('page not found'));
                    return;
                }
                resolve(result[0]);
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = new LowCodeService();
