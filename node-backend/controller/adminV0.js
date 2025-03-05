const adminService = require('../service/adminV0');
const util = require('../utils/util');

//获取order_table
async function getOrderTable(ctx) {
    console.log('获取order_table', ctx);
    const info = await adminService.getOrderTable();
    util.success(ctx, info || []);
}
//获取user_table
async function getUserTable(ctx) {
    const info = await adminService.getUserTable();
    util.success(ctx, info || []);
}

// 项目配置
async function getProjectConfig(ctx) {
    console.log('获取项目配置', ctx);
    const { projectId } = ctx.request.query;

    if (!projectId) {
        return ctx.throw(400, '项目ID不能为空');
    }
    const info = await adminService.getProjectConfig(projectId);
    util.success(ctx, info?.[0] || {});
}

async function generate(ctx) {
    try {
        const info = await captchaService.generateCaptcha(ctx);
        util.success(ctx, info || null);
    } catch (err) {
        console.log(err);
        const { message, code } = err;
        util.fail(ctx, message, code);
    }
}

module.exports = {
    getOrderTable,
    getUserTable,
    getProjectConfig,
};
