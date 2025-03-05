const Router = require('@koa/router');
const wx = require('../../controller/wx');
const router = new Router({ prefix: '/api/wx' });

/**
 * wx router
 */
// 微信小程序登录接口
router.post('/login', wx.postAuthLogin);

// 获取用户信息
router.get('/userinfo', wx.getUserInfo);
// 更新用户信息
router.post('/updateUserInfo', wx.updateUserInfo);

router.get('/public/token', async (ctx, next) => {
    const token = jsonwebtoken.sign({ name: 'moyufed' }, secret, {
        expiresIn: '3h',
    }); // token 有效期为3小时
    ctx.cookies.set('token', token, {
        domain: 'localhost', // 设置 cookie 的域
        path: '/', // 设置 cookie 的路径
        maxAge: 3 * 60 * 60 * 1000, // cookie 的有效时间 ms
        expires: new Date('2021-12-30'), // cookie 的失效日期，如果设置了 maxAge，expires 将没有作用
        httpOnly: true, // 是否要设置 httpOnly
        overwrite: true, // 是否要覆盖已有的 cookie 设置
    });
    ctx.body = token;
});

module.exports = router;
