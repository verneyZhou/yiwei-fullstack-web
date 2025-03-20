const gameService = require('../service/game');
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
    getTetrisScore: (ctx) => {
        return wrapperController(ctx, gameService.getTetrisScore);
    },
    updateTetrisScore: (ctx) => {
        // return wrapperController(ctx, gameService.updateTetrisScore);
        return wrapperController(
            ctx,
            gameService.updateTetrisScore.bind(gameService)
        );
        // 解决上下文丢失，报错：TypeError: Cannot read properties of undefined (reading 'getTetrisScore')
    },
    getSnakeScore: (ctx) => {
        return wrapperController(ctx, gameService.getSnakeScore);
    },
    updateSnakeScore: (ctx) => {
        return wrapperController(
            ctx,
            gameService.updateSnakeScore.bind(gameService)
        );
    },
    getTetrisRank: (ctx) => {
        return wrapperController(ctx, gameService.getTetrisRank);
    },
    getSnakeRank: (ctx) => {
        return wrapperController(ctx, gameService.getSnakeRank);
    },
};
