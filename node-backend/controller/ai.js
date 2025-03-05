const aiService = require('../service/ai');
const util = require('../utils/util');

//ai chat
async function chat(ctx) {
    try {
        const info = await aiService.chat(ctx);
        util.success(ctx, info || null);
    } catch (err) {
        const { message, code, status } = err;
        const _code = isNaN(code) ? status || 437 : code;
        util.fail(ctx, message, _code);
    }
}

async function getModels(ctx) {
    try {
        const info = await aiService.getModels(ctx);
        util.success(ctx, info || null);
    } catch (err) {
        console.log(err);
        const { message, code } = err;
        util.fail(ctx, message, code);
    }
}

async function getBalance(ctx) {
    try {
        const info = await aiService.getBalance(ctx);
        util.success(ctx, info || null);
    } catch (err) {
        console.log(err);
        const { message, code } = err;
        util.fail(ctx, message, code);
    }
}

async function saveChat(ctx) {
    try {
        const info = await aiService.saveChatRecord(ctx);
        util.success(ctx, info || null);
    } catch (err) {
        console.log(err);
        const { message, code } = err;
        util.fail(ctx, message, code);
    }
}

async function getChat(ctx) {
    try {
        const info = await aiService.getChat(ctx);
        util.success(ctx, info || null);
    } catch (err) {
        console.log(err);
        const { message, code } = err;
        util.fail(ctx, message, code);
    }
}
async function deleteChat(ctx) {
    try {
        const info = await aiService.deleteChat(ctx);
        util.success(ctx, info || null);
    } catch (err) {
        console.log(err);
        const { message, code } = err;
        util.fail(ctx, message, code);
    }
}

module.exports = {
    chat,
    getModels,
    getBalance,
    saveChat,
    getChat,
    deleteChat,
};
