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
                return ctx.throw(400, '页面ID不能为空');
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
};
