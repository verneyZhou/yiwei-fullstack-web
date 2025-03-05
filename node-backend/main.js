require('./.env.config');
const app = require('./app');
const { SERVER_HOST, SERVER_PORT } = require('./config');

app.listen(SERVER_PORT, () => {
  console.log(`🚀🚀🚀🚀后端服务已启动===== ${SERVER_HOST}:${SERVER_PORT}`);
});
