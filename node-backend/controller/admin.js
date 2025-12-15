const adminService = require('../service/admin');
const ragService = require('../service/rag');
const util = require('../utils/util');

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

// ai助手
async function chatStream(ctx) {
    try {
        const uid = (
            ctx.request.headers['x-user-id'] ||
            ctx.request.headers['x-real-ip'] ||
            ''
        ).toString();
        const key = `quota:${uid || ctx.ip}`;
        await ragService.rateLimit(ctx, key, 30, 60); // 每个用户/IP 每分钟最多 30 次请求
        await ragService.streamChat(ctx);
    } catch (err) {
        console.log('===err', err);
        util.fail(
            ctx,
            err?.message || 'error',
            err?.code || 500,
            err?.data || null
        );
    }
}

module.exports = {
    // ai管理
    getAIModelList: (ctx) => {
        return wrapperController(ctx, adminService.getAIModels);
    },
    createAIModel: (ctx) => {
        return wrapperController(ctx, adminService.createAIModel);
    },
    deleteAIModel: (ctx) => {
        return wrapperController(ctx, adminService.deleteAIModel);
    },
    updateAIModel: (ctx) => {
        return wrapperController(ctx, adminService.updateAIModel);
    },
    statusAIModel: (ctx) => {
        return wrapperController(ctx, adminService.statusAIModel);
    },
    getUserList: (ctx) => {
        return wrapperController(ctx, adminService.getUserList);
    },
    getChatList: (ctx) => {
        return wrapperController(ctx, adminService.getChatList);
    },
    deleteChat: (ctx) => {
        return wrapperController(ctx, adminService.deleteChat);
    },
    // 游戏管理
    getTetrisScoreList: (ctx) => {
        return wrapperController(ctx, adminService.getTetrisScoreList);
    },
    deleteTetrisScore: (ctx) => {
        return wrapperController(ctx, adminService.deleteTetrisScore);
    },
    getSnakeScoreList: (ctx) => {
        return wrapperController(ctx, adminService.getSnakeScoreList);
    },
    deleteSnakeScore: (ctx) => {
        return wrapperController(ctx, adminService.deleteSnakeScore);
    },
    // 低码管理
    getLowCodePageList: (ctx) => {
        return wrapperController(ctx, adminService.getLowCodePageList);
    },
    deleteLowCodePage: (ctx) => {
        return wrapperController(ctx, adminService.deleteLowCodePage);
    },
    getLowCodeProjectList: (ctx) => {
        return wrapperController(ctx, adminService.getLowCodeProjectList);
    },
    deleteLowCodeProject: (ctx) => {
        return wrapperController(ctx, adminService.deleteLowCodeProject);
    },
    // ai助手
    chatStream,
};
