import { get, post, postJSON } from './axios';

/** 测试接口 */
export const GetTest = (params) => get('test', params);

export const GetTest2 = (params) => post('test', params);

export const GetTest3 = (params) => postJSON('testJSON', params);

export const GetTest4 = () => postJSON('testError');
