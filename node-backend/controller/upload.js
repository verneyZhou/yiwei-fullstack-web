const uploadService = require('../service/upload');
const util = require('../utils/util');

async function uploadFile(ctx) {
    try {
        const info = await uploadService.handleFileUpload(ctx);
        util.success(ctx, info);
    } catch (err) {
        console.error(err);
        util.fail(ctx, err.message);
    }
}

module.exports = {
    uploadFile,
};
