const mysql2 = require('mysql2'); // https://sidorares.github.io/node-mysql2/zh-CN/docs
const config = require('../config');

const {
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_USER,
    DATABASE_PASSWORD,
    DATABASE_LOCAL_HOST,
    DATABASE_LOCAL_USER,
    DATABASE_LOCAL_PASSWORD,
} = config;

const env = process.env.NODE_ENV;
console.log('====process.env', env);

const sqlParams =
    env === 'development'
        ? {
              host: DATABASE_LOCAL_HOST,
              user: DATABASE_LOCAL_USER,
              password: DATABASE_LOCAL_PASSWORD,
          }
        : {
              host: DATABASE_HOST,
              user: DATABASE_USER,
              password: DATABASE_PASSWORD,
          };

const pool = mysql2.createPool({
    port: DATABASE_PORT,
    ...sqlParams,
    // database: config.DATABASE_NAME,
    dateStrings: true,
});

module.exports = pool.promise();
