const mysql2 = require('mysql2'); // https://sidorares.github.io/node-mysql2/zh-CN/docs
const config = require('../config');

const pool = mysql2.createPool({
  host: config.DATABASE_HOST,
  port: config.DATABASE_PORT,
  user: config.DATABASE_USER,
  password: config.DATABASE_PASSWORD,
  database: config.DATABASE_NAME,
  dateStrings: true,
});

module.exports = pool.promise();


