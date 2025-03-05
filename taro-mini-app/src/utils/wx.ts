import {ObjTy} from '@/types/common';
/**
 * 实现一个 wx 异步函数转成 promise 的工具函数
 * @param original function wx 异步函数
 * @returns 
 * 
 * 使用方法
promisify(wx.getStorage)({key: 'key'}).then(value => {
  // success
}).catch(reason => {
  // fail
})
 */
export const promisify = (original: any) => {
  return function(opt?: ObjTy) {
    return new Promise((resolve, reject) => {
      opt = Object.assign({
        success: resolve,
        fail: reject
      }, opt || {})
      original(opt)
    })
  }
}

