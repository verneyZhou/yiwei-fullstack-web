const LowCodeService = require('../service/lowcode');
const util = require('../utils/util');

// 版本清理策略
const VersionCleanupStrategy = {
    // 保留最近 N 个版本
    keepLatestVersions: 3,
    // 保留最近 N 天的版本
    // keepDaysVersions: 30,
};

const wrapperController = async (ctx, method) => {
    try {
        const info = await method(ctx);
        util.success(ctx, info || null);
    } catch (err) {
        console.log(err);
        const { message, code } = err;
        util.fail(ctx, message, code);
    }
};

module.exports = {
    // 获取低码平台注册用户列表
    getUserList: (ctx) => {
        return wrapperController(ctx, LowCodeService.getUserList);
    },
    // 页面
    getPageList: (ctx) => {
        return wrapperController(ctx, LowCodeService.getPageList);
    },
    deletePage: (ctx) => {
        return wrapperController(ctx, LowCodeService.deletePage);
    },
    getPageDetail: (ctx) => {
        return wrapperController(ctx, LowCodeService.getPageDetail);
    },
    updatePage: (ctx) => {
        return wrapperController(ctx, LowCodeService.updatePage);
    },
    createPage: (ctx) => {
        return wrapperController(ctx, LowCodeService.createPage);
    },
    async publishPage(ctx) {
        try {
            // 查询已发布的页面
            const { page_id } = ctx.request.body;
            if (!util.isNotEmpty(page_id)) {
                return ctx.throw('页面ID不能为空');
            }
            Object.assign(ctx.request.query, {
                page_size: 10000,
                page_num: 1,
                page_id,
            });
            // 查询已发布的页面
            const { list } = await LowCodeService.getPublishPageList(ctx);
            console.log(list);
            // 清理旧版本
            const { keepLatestVersions } = VersionCleanupStrategy;
            if (list.length >= keepLatestVersions) {
                // 超过保留版本数量时，删除旧版本
                const versionsToDelete = list.slice(
                    keepLatestVersions - 1,
                    list.length
                );
                const versionsToDeleteIds = versionsToDelete.map(
                    (item) => item.id
                );
                console.log('====1234567', versionsToDeleteIds);
                Object.assign(ctx.request.body, {
                    ids: versionsToDeleteIds.join(','),
                });
                await LowCodeService.deletePublishPage(ctx);
            }
            // 发布新版本
            const info = await LowCodeService.publishPage(ctx);
            // 更改页面状态
            Object.assign(ctx.request.body, {
                id: page_id,
                publish_id: info.id,
                state: 3, // 已发布
            });
            await LowCodeService.changePageState(ctx);

            util.success(ctx, info || null);
        } catch (err) {
            console.log(err);
            const { message, code } = err;
            util.fail(ctx, message, code);
        }
    },

    // 项目
    getProjectList: (ctx) => {
        return wrapperController(ctx, LowCodeService.getProjectList);
    },
    // 新增项目
    createProject: (ctx) => {
        return wrapperController(ctx, LowCodeService.createProject);
    },
    // 更新项目
    updateProject: (ctx) => {
        return wrapperController(ctx, LowCodeService.updateProject);
    },
    // 删除项目
    deleteProject: async (ctx) => {
        // return wrapperController(ctx, LowCodeService.deleteProject);
        try {
            // type: all 删除项目和项目下的所有数据
            const { id, type = 'all' } = ctx.request.body;
            if (!util.isNotEmpty(id)) {
                return ctx.throw('项目ID不能为空');
            }
            // const { uid } = util.decodeToken(ctx);
            ctx.request.query.id = id;
            const res = await LowCodeService.getProjectDetail(ctx);
            if (!res) {
                return ctx.throw('项目不存在');
            }
            // if (res.creator_id !== uid) {
            //     return ctx.throw('您没有权限删除该项目');
            // }
            // 删除项目
            await LowCodeService.deleteProject(ctx);
            Object.assign(ctx.request.body, {
                project_id: id,
            });
            // 删除项目下菜单
            await LowCodeService.deleteProjectMenuByProjectId(ctx);
            // 删除项目下角色
            await LowCodeService.deleteProjectRoleByProjectId(ctx);
            if (type === 'all') {
                // 删除项目下所有页面
                await LowCodeService.deleteProjectPageByProjectId(ctx);
            } else {
                // 更新项目下所有页面
                await LowCodeService.updateProjectPageByProjectId(ctx);
            }
            util.success(ctx, null);
        } catch (err) {
            const { message, code } = err;
            util.fail(ctx, message, code);
        }
    },
    // 获取项目详情
    getProjectDetail: (ctx) => {
        return wrapperController(ctx, LowCodeService.getProjectDetail);
    },

    // 更新角色
    editRole: (ctx) => {
        return wrapperController(ctx, LowCodeService.editRole);
    },
    // 获取角色列表
    getRoleList: (ctx) => {
        return wrapperController(ctx, LowCodeService.getRoleList);
    },
    // 删除角色
    deleteRole: (ctx) => {
        return wrapperController(ctx, LowCodeService.deleteRole);
    },
    updateRoleLimits: (ctx) => {
        return wrapperController(ctx, LowCodeService.updateRoleLimits);
    },

    // 获取项目用户列表
    getProjectUserList: (ctx) => {
        return wrapperController(ctx, LowCodeService.getProjectUserList);
    },
    // 编辑项目用户
    editProjectUser: (ctx) => {
        return wrapperController(
            ctx,
            LowCodeService.editProjectUser.bind(LowCodeService)
        );
    },
    // 删除项目用户
    deleteProjectUser: (ctx) => {
        return wrapperController(ctx, LowCodeService.deleteProjectUser);
    },

    // 获取项目菜单列表
    getProjectMenuList: (ctx) => {
        return wrapperController(ctx, LowCodeService.getProjectMenuList);
    },
    // 新增项目菜单
    createProjectMenu: (ctx) => {
        return wrapperController(
            ctx,
            LowCodeService.createProjectMenu.bind(LowCodeService) // 解决上下文丢失
        );
    },
    // 更新项目菜单
    updateProjectMenu: (ctx) => {
        return wrapperController(ctx, LowCodeService.updateProjectMenu);
    },
    // 删除项目菜单列表
    deleteProjectMenu: (ctx) => {
        return wrapperController(ctx, LowCodeService.deleteProjectMenu);
    },

    /**
     * web端接口
     */
    // 获取已发布页面详情
    async getPublishDetail(ctx) {
        try {
            // const { id } = ctx.request.query;
            const { id } = ctx.request.params;
            if (!util.isNotEmpty(id)) {
                return ctx.throw(400, '页面ID不能为空');
            }
            // 查询页面详情
            Object.assign(ctx.request.query, {
                id,
            });
            const result = await LowCodeService.getPageDetail(ctx);
            if (result) {
                const { publish_id, id } = result;
                if (util.isNotEmpty(publish_id)) {
                    Object.assign(ctx.request.query, {
                        publish_id,
                        page_id: id,
                    });
                    // 查询发布详情
                    const res = await LowCodeService.getPublishPageDetail(ctx);
                    console.log('234567876543', res);
                    util.success(ctx, res || null);
                } else {
                    util.fail(ctx, '页面未发布', 400);
                }
            } else {
                util.fail(ctx, '页面不存在', 400);
            }
        } catch (err) {
            console.log(err);
            const { message, code } = err;
            util.fail(ctx, message, code);
        }
    },
    // 获取用户项目列表
    async getOwnProjectList(ctx) {
        return wrapperController(ctx, LowCodeService.getProjectList);
    },
    // 获取用户项目菜单列表
    async getOwnProjectMenuList(ctx) {
        try {
            const { project_id } = ctx.request.query;
            if (!util.isNotEmpty(project_id)) {
                return ctx.throw('项目ID不能为空');
            }
            // const { uid } = util.decodeToken(ctx);
            const uid = '001';
            ctx.request.query.id = project_id;
            const projectInfo = await LowCodeService.getProjectDetail(ctx);
            if (!projectInfo) {
                return ctx.throw('项目不存在');
            }
            // TODO: 后面的逻辑待验证
            // 公开
            if (projectInfo.is_public) {
                const res = await LowCodeService.getProjectMenuList(ctx);
                util.success(ctx, res || null);
            } else {
                // 项目创建者，相当于项目管理员
                if (projectInfo.creator_id === uid) {
                    const res = await LowCodeService.getProjectMenuList(ctx);
                    util.success(ctx, res || null);
                } else {
                    // 查询用户
                    ctx.request.query.project_id = project_id;
                    ctx.request.query.user_id = uid;
                    ctx.request.query.id = undefined;
                    const role = await LowCodeService.getProjectUserDetail(ctx);
                    console.log('role', role);
                    if (!role) {
                        return util.fail(ctx, '您当前暂无访问权限', 403);
                    }
                    // 系统管理员
                    if (role.system_role === 1) {
                        const res = await LowCodeService.getProjectMenuList(
                            ctx
                        );
                        return util.success(ctx, res || null);
                    }
                    // 根据用户角色获取角色详情
                    ctx.request.query.id = role.role_id;
                    const roleRes = await LowCodeService.getRoleDetail(ctx);
                    const { id, checked = '', half_checked = '' } = roleRes;
                    let menuIds = [];
                    if (checked) {
                        menuIds = menuIds.concat(checked.split(','));
                    }
                    if (half_checked) {
                        menuIds = menuIds.concat(half_checked.split(','));
                    }
                    if (!menuIds.length) {
                        return util.fail(ctx, '您当前暂无访问权限', 403);
                    }
                    ctx.request.query.menu_ids = menuIds.join(',');
                    const res = await LowCodeService.getProjectMenuList(ctx);
                    util.success(ctx, res || null);
                }
            }
        } catch (err) {
            const { message, code } = err;
            util.fail(ctx, message, code);
        }
    },
};
