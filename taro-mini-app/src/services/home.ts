
import {get, post, upload} from './request';


export const getHome = (params: any) => {
  return get('/home', params);
};


export const getHomeList = (params: any) => {
  return get('/home/list', params);
};

export const postHomeDetail = (params: any) => {
  return post('/home/detail', params);
};


export const uploadFile = (params: any) => {
  return upload('/upload/file', params);
};



