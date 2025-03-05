const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { JWT_PRIVATE_KEY, JWT_EXPIRES_IN } = require('../config');

// MD5加密方法
function md5(s) {
    // 注意参数需要为 String 类型，否则会出错
    return crypto.createHash('md5').update(String(s)).digest('hex');
}

// jwt动态解析token
function decodeToken(ctx) {
    try {
        const authorization = ctx.get('Authorization');
        if (!authorization) {
            throw {
                code: 401,
                message: 'token is not provided',
            };
        }
        let token = '';
        if (authorization.indexOf('Bearer') >= 0) {
            token = authorization.replace('Bearer ', '');
        } else {
            token = authorization;
        }
        return jwt.verify(token, JWT_PRIVATE_KEY);
    } catch (err) {
        const _error = {
            code: 400,
            message: 'Access denied',
        };
        return ctx.throw(Object.assign(_error, err || {}));
    }

    /**
    jwt.verify(token, config.jwt.secret, (err, payload) => {
        if (err) {
            console.error(err);
            return res.send({
                ...errcode.AUTH.UNAUTHORIZED,
            });
        }
        // token是否和权限符合
        if (payload.roleName !== authority.role) {
            return res.send({
                ...errcode.AUTH.FORBIDDEN,
            });
        }

        // 将user信息存在本次请求内存中
        req.currentUser = payload;

        // 执行权转交后续中间件
        next();
    });
     */
}

// jwt生成token
function createToken(payload) {
    // const { openid } = payload;
    const token = jwt.sign(
        // { openid },
        payload,
        JWT_PRIVATE_KEY,
        {
            expiresIn: JWT_EXPIRES_IN,
            // algorithm: "HS256", // 签名的算法，默认 HS256
            // header: { alg: "HS256", sign_type: "SIGN" }
        }
    );
    return token;
}

module.exports = {
    md5,
    decodeToken,
    createToken,
};
