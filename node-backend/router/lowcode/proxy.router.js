const Router = require('@koa/router');
const request = require('../../utils/request');
const util = require('../../utils/util');
const router = new Router({ prefix: '/api/lowcode' });

// 接口转发(get)
router.get('/admin/proxy', proxyRequest);
router.get('/web/proxy', proxyRequest);
router.post('/admin/proxy', proxyPostRequest);
router.post('/web/proxy', proxyPostRequest);

async function proxyRequest(ctx) {
    try {
        const {
            query,
            headers: { host, origin, proxyapi, ...headers },
        } = ctx.request;
        console.log('====headers', headers);
        let response = await request.get(proxyapi, query || {}, {
            headers,
        });
        console.log('====response', response);
        if (response.data) {
            const res = JSON.parse(response.data);
            ctx.body = res;
        } else {
            ctx.body = response.data;
        }
    } catch (error) {
        util.fail(ctx, 500, error.message);
    }
}

// 接口转发(post)
async function proxyPostRequest(ctx) {
    try {
        const {
            body,
            headers: { host, origin, proxyapi, ...headers },
        } = ctx.request;
        console.log('====headers', headers);
        const response = await request.post(
            proxyapi,
            JSON.stringify(body || {}),
            {
                headers,
            }
        );
        if (response.data) {
            const res = JSON.parse(response.data);
            ctx.body = res;
        } else {
            ctx.body = response.data;
        }
    } catch (error) {
        util.fail(ctx, 500, error.message);
    }
}
module.exports = router;
