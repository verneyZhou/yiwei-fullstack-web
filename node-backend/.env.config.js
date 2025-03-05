const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({
    path: path.resolve(__dirname, '.env'),
});
