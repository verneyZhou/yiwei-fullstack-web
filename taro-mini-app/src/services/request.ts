import Taro from '@tarojs/taro';
import {SUCC_LIST} from '@/configs/index';
import axios from 'axios';

const IS_MOCK = process.env.TARO_APP_ENV === "mock";


/**
 * Taro.request: https://docs.taro.zone/docs/apis/network/request/
 */



// host拦截器 处理url拼接等
function urlInterceptor(chain) {
const requestParams = chain.requestParams;
  const { url } = requestParams;
  // 如果传入url自带域名则不做处理 否则加上对应的域名
  if (!(url.startsWith('https://') || url.startsWith('http://'))) {
    requestParams.url = `${process.env.TARO_APP_SERVE_URL}${url}`;
  }
  return chain.proceed(requestParams);
}
// 添加拦截器
const getInterceptors = () => {
  return [
    // urlInterceptor,
    Taro.interceptors.logInterceptor,
    Taro.interceptors.timeoutInterceptor,
  ];
};
getInterceptors().forEach(interceptorItem =>
  Taro.addInterceptor(interceptorItem)
);


// 请求参数配置
interface IRequestConfig {
	url: string
	data?: any
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'UPLOAD'
	[key: string]: any
}

async function request({
  url,
  data,
  method,
  header = {
    'Content-Type': 'application/json',
  },
  dataType = 'json',
  responseType = 'text',
  jsonp = false
}: IRequestConfig): Promise<any> {
  // UPLOAD方法特殊处理
  if (method === 'UPLOAD') {
    return new Promise((resolve, reject) => {
      return Taro.uploadFile({
        url: `${url}`,
        filePath: data,
        name: 'file',
        withCredentials: true,
        formData: {},
        success(res) {
          const resultData = res.data;

          console.log('uploadFile success', resultData);
          console.log('uploadFile success', JSON.parse(resultData));
          const result = JSON.parse(resultData);
          if (SUCC_LIST.includes(result.code)) {
            resolve(result);
          } else {
            Taro.showToast({
              title: result.msg,
              mask: true,
              duration: 2000,
              icon: 'none',
            });
            reject(result);
          }
        },
        fail(err) {
          console.log('uploadFile err', err);
          reject(err);
        },
      });
    });
  } else {
    console.log('request', {url, data, method, header, dataType, responseType, jsonp});
    if (IS_MOCK) {
      return axios({
        url,
        method,
      })
    }
    return Taro.request({
      url,
      data,
      method,
      header,
      dataType,
      responseType,
      jsonp,
    });
  }
}


async function get(url: string, data: any, header?: any): Promise<Response> {
  const payload = { url, data, header};
  return request({
    method: 'GET',
    ...payload,
  });
}

async function post(url: string, data: any, header?: any): Promise<Response> {
  const payload = { url, data, header};
  return request({
    method: 'POST',
    ...payload,
  });
}

async function put(url: string, data: any, header?: any): Promise<Response> {
  const payload = { url, data, header};
  return request({
    method: 'PUT',
    ...payload,
  });
}

async function del(url: string, data: any, header?: any): Promise<Response> {
  const payload = { url, data, header};
  return request({
    method: 'DELETE',
    ...payload,
  });
}

// 上传文件
async function upload(url: string, data: any): Promise<Response> {
  const payload = { url, data};
  return request({
    method: 'UPLOAD',
    ...payload,
  });
}


export {
  get,
  post,
  put,
  del,
  upload,
  request,
};
