const adminService = require('../service/admin');
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

module.exports = {
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
};
