const connection = require('../sql/index');
const SnowflakeIdGenerator = require('../utils/snowflake');
const { createToken, decodeToken } = require('../utils/jwt');
const { randomString, isNotEmpty } = require('../utils/util');

// 初始化雪花算法生成器（建议在全局配置）
const idGenerator = new SnowflakeIdGenerator(1, 2);

class LowCodeService {
    /**
     * 注册低码平台的用户
     */
    async getUserList(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { keyword = '' } = ctx.request.query;
                // 构建基础查询语句
                let statement = `SELECT * FROM admin.lowcode_user_table WHERE 1=1`;
                const params = [];
                // 添加名称模糊搜索条件
                if (keyword) {
                    statement += ` AND user_name LIKE?`;
                    params.push(`%${keyword}%`);
                }
                // 执行查询
                const [result] = await connection.execute(statement, params);
                console.log(result);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

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
                    keyword = '',
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
                if (keyword) {
                    statement += ` AND name LIKE ?`;
                    params.push(`%${keyword}%`);
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
                const [result] = await connection.execute(statement, [id]);
                console.log(result);
                resolve({ success: true });
            } catch (error) {
                reject(error);
            }
        });
    }
    // 删除项目下所有页面
    async deleteProjectPageByProjectId(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { project_id } = ctx.request.body;
                if (!project_id) {
                    reject(new Error('project_id is required'));
                    return;
                }
                const statement = `DELETE FROM admin.lowcode_page_table WHERE project_id =?`;
                const [result] = await connection.execute(statement, [
                    project_id,
                ]);
                resolve({ success: true });
            } catch (error) {
                reject(error);
            }
        });
    }
    // 解除项目下页面列表归属
    async updateProjectPageByProjectId(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { project_id } = ctx.request.body;
                if (!project_id) {
                    reject(new Error('project_id is required'));
                    return;
                }
                const statement = `UPDATE admin.lowcode_page_table SET project_id =null WHERE project_id =?`;
                const [result] = await connection.execute(statement, [
                    project_id,
                ]);
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
                const { name, remark = '', project_id = '' } = ctx.request.body;
                if (!name) {
                    reject(new Error('name is required'));
                    return;
                }
                const page_id = `PAGE_${idGenerator.generate()}`;
                const time = new Date();
                const statement = `INSERT INTO admin.lowcode_page_table (id, name, remark, project_id, creator, creator_id, create_time, update_time, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                const [result] = await connection.execute(statement, [
                    page_id,
                    name,
                    remark,
                    project_id,
                    creator,
                    creator_id,
                    time,
                    time,
                    1, // state 1 未保存 2 已保存 3 已发布 4 已回滚
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
    // 获取页面模板数据
    async getPageTemplateList(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { page_size = 10, page_num = 1 } = ctx.request.query;
                const statement = 'SELECT * FROM admin.lowcode_temp_table';
                const [result] = await connection.execute(statement);
                resolve({
                    list: result,
                    pagination: {
                        total: result.length,
                        page_size: parseInt(page_size, 10),
                        page_num: parseInt(page_num, 10),
                    },
                });
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

    /**
     * 项目相关
     */
    async getProjectList(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const {
                    page_size = 10,
                    page_num = 1,
                    keyword = '',
                } = ctx.request.query;
                console.log(ctx.request.query);
                // const { uid = '' } = decodeToken(ctx);
                // console.log('======getPageList uid', uid);
                // const creator_id = uid;
                const creator_id = '001';
                // 构建基础查询语句
                let statement = `SELECT * FROM admin.lowcode_project_table WHERE 1=1`;
                const params = [];
                // 添加名称模糊搜索条件
                if (keyword) {
                    statement += ` AND name LIKE?`;
                    params.push(`%${keyword}%`); // 添加参数
                }

                if (creator_id) {
                    statement += ` AND creator_id =?`;
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
                // 默认按发布时间降序排序
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
    // 创建项目
    async createProject(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { name, remark, logo } = ctx.request.body;
                const project_id = `PROJECT_${idGenerator.generate()}`;
                const creator_id = '001';
                const creator = 'admin';
                const time = new Date();
                const statement = `INSERT INTO admin.lowcode_project_table (id, name, remark, logo, creator, creator_id, create_time, update_time, count) VALUES (?,?,?,?,?,?,?,?,?)`;
                const [result] = await connection.execute(statement, [
                    project_id,
                    name,
                    remark,
                    logo,
                    creator,
                    creator_id,
                    time,
                    time,
                    0,
                ]);
                console.log(result);
                resolve({ id: project_id, name, create_time: time, creator });
            } catch (error) {
                reject(error);
            }
        });
    }
    // 获取项目详情
    async getProjectDetail(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { id } = ctx.request.query;
                if (!id) {
                    reject(new Error('id is required'));
                    return;
                }
                const statement = `SELECT * FROM admin.lowcode_project_table WHERE id=?`;
                const [result] = await connection.execute(statement, [id]);
                if (result.length === 0) {
                    reject(new Error('project not found'));
                    return;
                }
                resolve(result[0]);
            } catch (error) {
                reject(error);
            }
        });
    }
    // 更新项目
    async updateProject(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const {
                    id,
                    name,
                    remark,
                    logo,
                    menu_theme_color,
                    system_theme_color,
                    breadcrumb,
                    tag,
                    is_public,
                } = ctx.request.body;
                if (!id) {
                    reject(new Error('id is required'));
                    return;
                }
                if (!name) {
                    reject(new Error('name is required'));
                    return;
                }
                if (!logo) {
                    reject(new Error('logo is required'));
                    return;
                }

                const statement = `UPDATE admin.lowcode_project_table SET name=?, remark=?, logo=?, menu_theme_color=?, system_theme_color=?, breadcrumb=?, tag=?, is_public=?, update_time=? WHERE id=?`;
                const time = new Date();
                const [result] = await connection.execute(statement, [
                    name,
                    remark,
                    logo,
                    menu_theme_color,
                    system_theme_color,
                    breadcrumb,
                    tag,
                    is_public,
                    time,
                    id,
                ]);
                resolve({
                    id,
                    name,
                    update_time: time,
                });
            } catch (error) {
                reject(error);
            }
        });
    }
    // 删除项目
    async deleteProject(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { id } = ctx.request.body;
                if (!id) {
                    reject(new Error('id is required'));
                    return;
                }
                const statement = `DELETE FROM admin.lowcode_project_table WHERE id = ?`;
                const [result] = await connection.execute(statement, [id]);
                console.log(result);
                resolve({ success: true });
            } catch (error) {
                reject(error);
            }
        });
    }

    // 更新角色
    async editRole(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { id, name, remark, project_id } = ctx.request.body;
                const time = new Date();
                if (id) {
                    // 编辑
                    // 先查询是否存在
                    const queryStatement = `SELECT * FROM admin.lowcode_role_table WHERE id=?`;
                    const [queryResult] = await connection.execute(
                        queryStatement,
                        [id]
                    );
                    if (queryResult?.length === 0) {
                        reject(new Error('当前角色不存在'));
                        return;
                    }
                    // 更新
                    const statement = `UPDATE admin.lowcode_role_table SET name=?, remark=?, update_time=? WHERE id=?`;
                    const [result] = await connection.execute(statement, [
                        name,
                        remark,
                        time,
                        id,
                    ]);
                    console.log(result);
                    resolve({ id, name, update_time: time });
                    return;
                } else {
                    // 创建
                    const role_id = `ROLE_${idGenerator.generate()}`;
                    const creator_id = '001';
                    const creator = 'admin';
                    const statement = `INSERT INTO admin.lowcode_role_table (id, name, remark, project_id, creator, creator_id, create_time, update_time) VALUES (?,?,?,?,?,?,?,?)`;
                    const [result] = await connection.execute(statement, [
                        role_id,
                        name,
                        remark,
                        project_id,
                        creator,
                        creator_id,
                        time,
                        time,
                    ]);
                    console.log(result);
                    resolve({ id: role_id, name, create_time: time, creator });
                }
            } catch (error) {
                reject(error);
            }
        });
    }
    // 获取角色详情
    async getRoleDetail(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { id } = ctx.request.query;
                if (!id) {
                    reject(new Error('id is required'));
                    return;
                }
                const statement = `SELECT * FROM admin.lowcode_role_table WHERE id=?`;
                const [result] = await connection.execute(statement, [id]);
                if (result.length === 0) {
                    reject(new Error('当前角色不存在'));
                    return;
                }
                resolve(result[0]);
            } catch (error) {
                reject(error);
            }
        });
    }
    // 获取角色列表
    async getRoleList(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const {
                    page_size = 10,
                    page_num = 1,
                    name = '',
                    project_id,
                } = ctx.request.query;
                console.log(ctx.request.query);
                // const { uid = '' } = decodeToken(ctx);
                // console.log('======getPageList uid', uid);
                // const creator_id = uid;
                // const creator_id = '001';

                // 构建基础查询语句
                let statement = `SELECT * FROM admin.lowcode_role_table WHERE 1=1`;
                const params = [];
                if (project_id) {
                    statement += ` AND project_id = ?`;
                    params.push(`${project_id}`);
                }
                // 添加名称模糊搜索条件
                if (name) {
                    statement += ` AND name LIKE ?`;
                    params.push(`%${name}%`);
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
    // 删除角色
    async deleteRole(ctx) {
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
                const statement = `DELETE FROM admin.lowcode_role_table WHERE id IN (${placeholders})`;
                const [result] = await connection.execute(statement, idsArr);
                console.log(result);
                resolve({ success: true });
            } catch (error) {
                reject(error);
            }
        });
    }
    // 删除项目下角色
    async deleteProjectRoleByProjectId(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { project_id } = ctx.request.body;
                if (!project_id) {
                    reject(new Error('project_id is required'));
                    return;
                }
                // 构建 IN 查询条件的占位符
                const statement = `DELETE FROM admin.lowcode_role_table WHERE project_id =?`;
                await connection.execute(statement, [project_id]);
                resolve({ success: true });
            } catch (error) {
                reject(error);
            }
        });
    }
    // 更新角色菜单权限
    async updateRoleLimits(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { id, project_id, checked, half_checked } =
                    ctx.request.body;
                if (!id) {
                    reject(new Error('角色ID不能为空'));
                    return;
                }
                if (!project_id) {
                    reject(new Error('项目ID不能为空'));
                    return;
                }
                const statement = `UPDATE admin.lowcode_role_table SET checked = ?, half_checked = ? WHERE id = ? && project_id = ?`;
                await connection.execute(statement, [
                    checked,
                    half_checked,
                    id,
                    project_id,
                ]);
                resolve({ success: true });
            } catch (error) {
                reject(error);
            }
        });
    }

    // 获取项目用户列表
    async getProjectUserList(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const {
                    page_size = 10,
                    page_num = 1,
                    keyword = '',
                    project_id,
                } = ctx.request.query;
                console.log(ctx.request.query);

                // 构建基础查询语句
                let statement = `SELECT * FROM admin.lowcode_project_user_table WHERE 1=1`;
                const params = [];
                if (project_id) {
                    statement += ` AND project_id = ?`;
                    params.push(`${project_id}`);
                }
                // 添加名称模糊搜索条件
                if (keyword) {
                    statement += ` AND user_name LIKE ?`;
                    params.push(`%${keyword}%`);
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
    // 获取项目用户详情
    async getProjectUserDetail(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { id, project_id, user_id } = ctx.request.query;
                let statement = `SELECT * FROM admin.lowcode_project_user_table  WHERE 1=1`;
                const params = [];
                if (id) {
                    statement += ` and id =?`;
                    params.push(`${id}`);
                }
                if (project_id) {
                    statement += ` and project_id =?`;
                    params.push(`${project_id}`);
                }
                if (user_id) {
                    statement += ` and user_id =?`;
                    params.push(`${user_id}`);
                }
                const [result] = await connection.execute(statement, params);
                resolve(result[0] || null);
            } catch (error) {
                reject(error);
            }
        });
    }
    // 更改项目用户
    async editProjectUser(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const {
                    id,
                    project_id,
                    system_role,
                    role_id,
                    role_name,
                    user_name,
                    user_id,
                } = ctx.request.body;
                const time = new Date();
                if (id) {
                    // 编辑
                    // 先查询是否存在
                    const queryStatement = `SELECT * FROM admin.lowcode_project_user_table WHERE id=?`;
                    const [queryResult] = await connection.execute(
                        queryStatement,
                        [id]
                    );
                    if (queryResult?.length === 0) {
                        reject(new Error('当前用户不存在'));
                        return;
                    }
                    // 更新
                    const statement = `UPDATE admin.lowcode_project_user_table SET system_role=?, role_id=?, role_name=?, update_time=? WHERE id=?`;
                    const [result] = await connection.execute(statement, [
                        system_role,
                        role_id,
                        role_name,
                        time,
                        id,
                    ]);
                    console.log(result);
                    resolve({ id, update_time: time });
                    return;
                } else {
                    // 先查询是否存在
                    Object.assign(ctx.request.query, {
                        user_id: user_id,
                        project_id,
                    });
                    const res = await this.getProjectUserDetail(ctx);
                    if (res) {
                        reject(new Error('当前用户已存在'));
                        return;
                    }
                    // 创建
                    const id = `USER_${idGenerator.generate()}`;
                    // const { uid = '' } = decodeToken(ctx);
                    const creator_id = '001';
                    const creator = 'admin';
                    const statement = `INSERT INTO admin.lowcode_project_user_table (id, user_name, user_id, system_role, role_id, role_name, project_id, creator, creator_id, create_time, update_time) VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
                    const [result] = await connection.execute(statement, [
                        id,
                        user_name,
                        user_id,
                        system_role,
                        role_id,
                        role_name,
                        project_id,
                        creator,
                        creator_id,
                        time,
                        time,
                    ]);
                    console.log(result);
                    resolve({
                        id,
                        user_name,
                        user_id,
                        create_time: time,
                        creator,
                    });
                }
            } catch (error) {
                reject(error);
            }
        });
    }
    // 删除项目用户
    async deleteProjectUser(ctx) {
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
                const statement = `DELETE FROM admin.lowcode_project_user_table WHERE id IN (${placeholders})`;
                const [result] = await connection.execute(statement, idsArr);
                console.log(result);
                resolve({ success: true });
            } catch (error) {
                reject(error);
            }
        });
    }

    // 获取项目菜单列表
    async getProjectMenuList(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const {
                    name = '',
                    project_id,
                    menu_ids = '',
                    status,
                } = ctx.request.query;
                console.log(ctx.request.query);

                // 构建基础查询语句
                let statement = `SELECT * FROM admin.lowcode_menu_table WHERE 1=1`;
                const params = [];
                if (project_id) {
                    statement += ` AND project_id = ?`;
                    params.push(`${project_id}`);
                }
                // 添加名称模糊搜索条件
                if (name) {
                    statement += ` AND name LIKE ?`;
                    params.push(`%${name}%`);
                }
                if (isNotEmpty(status) && status !== '-1') {
                    statement += ` AND status =?`;
                    params.push(`${Number(status)}`);
                }
                if (menu_ids) {
                    statement += ` AND id IN (${menu_ids})`;
                    params.push(menu_ids);
                }
                console.log(statement, params);
                // 执行查询
                const [result] = await connection.execute(statement, params);
                resolve(result || []);
            } catch (error) {
                reject(error);
            }
        });
    }
    // 创建项目菜单
    async createProjectMenu(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const {
                    name,
                    path = '',
                    icon = '',
                    is_create = 0,
                    parent_id = '',
                    project_id,
                    type,
                    code,
                    sort_num = 0,
                } = ctx.request.body;
                if (!project_id) {
                    reject(new Error('请先创建项目'));
                }
                if (!name) {
                    reject(new Error('菜单名称不能为空'));
                }
                if (type === 2 && is_create === 1) {
                    reject(new Error('只有菜单和页面类型支持自动创建页面'));
                }
                let page_id = '';
                // 自动创建页面
                if (type !== 2 && is_create === 1) {
                    const res = await this.createPage(ctx);
                    page_id = res.id;
                }

                const time = new Date();
                const id = `MENU_${idGenerator.generate()}`;
                const creator_id = '001';
                const creator = 'admin';
                const statement = `INSERT INTO admin.lowcode_menu_table (id, name, path, type, code, icon, sort_num, page_id, parent_id, project_id, creator, creator_id, create_time, update_time, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                const [result] = await connection.execute(statement, [
                    id,
                    name,
                    path,
                    type,
                    code,
                    icon,
                    sort_num,
                    page_id,
                    parent_id,
                    project_id,
                    creator,
                    creator_id,
                    time,
                    time,
                    1, // 1 启用 0 禁用
                ]);
                console.log(result);
                resolve({
                    id,
                    name,
                    create_time: time,
                });
            } catch (error) {
                reject(error);
            }
        });
    }
    // 更改项目菜单
    async updateProjectMenu(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const {
                    id,
                    name,
                    path,
                    icon,
                    parent_id,
                    page_id,
                    type,
                    code,
                    status,
                    sort_num,
                } = ctx.request.body;
                if (!id) {
                    reject(new Error('菜单ID不能为空'));
                }
                const params = [];
                const statementArr = [];
                let hasUpdate = false;
                if (name !== undefined) {
                    statementArr.push(` name=?`);
                    params.push(name);
                    hasUpdate = true;
                }
                if (path !== undefined) {
                    statementArr.push(` path=?`);
                    params.push(path);
                    hasUpdate = true;
                }
                if (icon !== undefined) {
                    statementArr.push(` icon=?`);
                    params.push(icon);
                    hasUpdate = true;
                }
                if (parent_id !== undefined) {
                    statementArr.push(` parent_id=?`);
                    params.push(parent_id);
                    hasUpdate = true;
                }
                if (type !== undefined) {
                    statementArr.push(` type=?`);
                    params.push(type);
                    hasUpdate = true;
                }
                if (code !== undefined) {
                    statementArr.push(` code=?`);
                    params.push(code);
                    hasUpdate = true;
                }
                if (sort_num !== undefined) {
                    statementArr.push(` sort_num=?`);
                    params.push(sort_num);
                    hasUpdate = true;
                }
                if (status !== undefined) {
                    statementArr.push(` status=?`);
                    params.push(status);
                    hasUpdate = true;
                }
                if (page_id !== undefined) {
                    statementArr.push(` page_id=?`);
                    params.push(page_id);
                    hasUpdate = true;
                }
                if (!hasUpdate) {
                    reject(new Error('没有更新内容'));
                    return;
                }
                let statement = 'UPDATE admin.lowcode_menu_table SET';
                statement += statementArr.join(',');
                statement += `, update_time =?`;
                statement += ` WHERE id =?`;
                const time = new Date();
                params.push(time);
                params.push(id);
                console.log(statement, params);
                const [result] = await connection.execute(statement, params);
                console.log(result);
                resolve({
                    id,
                    name,
                    update_time: time,
                });
            } catch (error) {
                reject(error);
            }
        });
    }
    // 删除项目菜单
    async deleteProjectMenu(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { id } = ctx.request.body;
                if (!id) {
                    reject(new Error('id is required'));
                    return;
                }
                const statement = `DELETE FROM admin.lowcode_menu_table WHERE id = ? || parent_id = ?;`;
                const [result] = await connection.execute(statement, [id, id]); // 删除当前菜单和其子菜单
                console.log(result);
                resolve({ success: true });
            } catch (error) {
                reject(error);
            }
        });
    }
    // 根据项目id删除菜单
    async deleteProjectMenuByProjectId(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                const { project_id } = ctx.request.body;
                if (!project_id) {
                    reject(new Error('project_id is required'));
                    return;
                }
                const statement = `DELETE FROM admin.lowcode_menu_table WHERE project_id =?;`;
                await connection.execute(statement, [project_id]);
                resolve({ success: true });
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = new LowCodeService();
