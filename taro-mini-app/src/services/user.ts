
import {get, post, upload} from './axios';


// 小程序登录
export const _wxLogin = (params: any) => {
  return post('/api/wx/login', params);
};

// 获取用户信息
// user_type: user_type= account 注册账号信息，wechat 微信账号信息
export const _getUserInfo = (user_type = 'account') => {
  return get(`/api/mobile/userinfo?user_type=${user_type}`);
};
// 更新用户信息
export const _updateUserInfo = (params: any) => {
  return post('/api/wx/updateUserInfo', params);
};


// 获取图片验证码
export const _getCaptchaCode = () => {
  return get('/api/captcha/code');
};

// 账号+密码+验证码登录
export const _captchaLogin = (params: any) => {
  return post('/api/captcha/login', params);
};

// 账号+密码+验证码注册
export const _captchaRegister = (params: any) => {
  return post('/api/captcha/register', params);
};






