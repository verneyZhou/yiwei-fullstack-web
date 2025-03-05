const userService = require('../service/user');
const util = require('../utils/util');


//获取user_table
async function getUserTable(ctx) {
    const info = await userService.getUserTable();
    util.success(ctx, info || []);
}

module.exports = {
    getUserTable,
};