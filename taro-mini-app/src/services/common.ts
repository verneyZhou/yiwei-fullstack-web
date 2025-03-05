
// import {get, post} from './request';
import { get, post } from './axios';


export const getV1List = (params?: any) => {
  return get('/api/v1/list', params);
};


export const postV2List = (params?: any) => {
  return post('/api/v2/list', params);
};

export const getNews = (params?: any) => {
  return get('/api/news', params);
};


export const getUserList = (params?: any) => {
  return get('/api/user/getUserList', params);
};

export const getDouban = (params: any) => {
  return get('/douban/top250', params);
};
