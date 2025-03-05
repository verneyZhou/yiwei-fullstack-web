module.exports = {
    /**
     * 接口成功输出
     * @param {*} ctx 上下文对象
     * @param {*} data 返回结果
     * @param {*} code 返回状态码
     */
    success(ctx, data = '', code = 200) {
        ctx.body = {
            code,
            data,
            message: 'success',
        };
    },
    /**
     * 接口失败输出
     * @param {*} ctx 上下文对象
     * @param {*} message 返回信息
     * @param {*} code 返回状态码
     */
    fail(ctx, message = '', code = -1, data = '') {
        ctx.body = {
            code,
            data: this.isNotEmpty(data) ? data : null,
            message,
        };
    },
    /**
     * 判断是否为空
     * @param {*} val 判断值
     * @returns
     */
    isNotEmpty(val) {
        if (val === undefined || val == null || val === '') {
            return false;
        } else if (typeof val === 'string') {
            if (val.trim() === '') {
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    },
    /**
     * 判断是否为数字
     * @param {*} val 判断值
     * @returns
     */
    isNumber(val) {
        const isTrue = this.isNotEmpty(val);
        return isTrue && (typeof val === 'number' || isNaN(val) === false);
    },
    isObject(o) {
        return Object.prototype.toString.call(o) === '[object Object]';
    },

    /**
     * 随机生成字符串
     */
    randomString(prefix = '', len) {
        let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; // 默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
        let maxPos = $chars.length;
        let pwd = '';
        for (let i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return `${prefix}${pwd}`;
    },
};
