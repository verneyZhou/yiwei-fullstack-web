const Router = require('@koa/router');
const upload = require('../../controller/upload');
const router = new Router({ prefix: '/api/upload' });

router.post('/file', upload.uploadFile);

module.exports = router;
