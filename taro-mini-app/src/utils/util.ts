import { ObjTy } from '@/types/common';

const enc = window.encodeURIComponent;
const dec = window.decodeURIComponent;


// 拷贝
export function merge(target: any) {
  for (let i = 1, j = arguments.length; i < j; i++) {
    const source = arguments[i];
    for (const prop in source) {
      if (source.hasOwnProperty(prop)) {
        const value = source[prop];
        if (value !== undefined) {
          target[prop] = value;
        }
      }
    }
  }
  return target;
}

// '?a=1&b=2'  => {a:1,b:2}
export function searchQuery (search: string) {
  const queryStr = search.split('?').pop();
  if (!queryStr) return {};
  return queryStr.split('&').reduce((prev, cur) => {
    const [key, value] = cur.split('=');
    return {
      ...prev,
      [key]: dec(value)
    };
  }, {});
}

// {a: 1, b: 2} => '?a=1&b=2'
export function queryToSearch (query: ObjTy) {
  return Object.keys(query).reduce((pre, cur) => {
    return pre + `${cur}=${query[cur]}&`;
  }, '?').slice(0, -1);
}

// eg: 'https://www.baidu.com?a=1&b=1'
//      getQueryString('a') => 1
export function getQueryString (name: string) {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  const regRewrite = new RegExp('(^|/)' + name + '/([^/]*)(/|$)', 'i');
  const r = window.location.search.substr(1).match(reg);
  const q = window.location.pathname.substr(1).match(regRewrite);
  if (r != null) {
    return decodeURIComponent(r[2]);
  } else if (q != null) {
    return decodeURIComponent(q[2]);
  } else {
    return null;
  }
}


/* 获取文本的长度，2个英文算一个长度 */
export function zhLength (str: string): number {
  let realLength = 0;
  str = str.replace(/(^[\s\n\r]*)|([\s\n\r]*$)/g, '');
  const len = str.length;
  let charCode = -1;
  for (let i = 0; i < len; i++) {
    charCode = str.charCodeAt(i);
    if (charCode > 255) {
      // 大于255的包括中文字、全角符号、特殊字
      realLength += 1;
    } else {
      realLength += 0.5;
    }
  }
  return Math.ceil(realLength);
}



/**
 * 防抖
 * @param fn 回调
 * @param delay 延迟时间 毫秒
 * @param now 是否需要立即执行
 * @returns 
 */
export function debounce (fn: any, delay: number, now?: boolean) {
  const context = this;
  let timer: any = null;
  let start = false;

  const res = function () {
    const args = arguments;
    // console.log(args);
    if (timer) clearTimeout(timer);
    if (now && !start) {
      fn.apply(context, args); // 立即执行
      start = true;
    }
    timer = setTimeout(function () {
      fn.apply(context, args);
      start = false;
    }, delay);
       
  };

  // 添加取消方法
  res.cancel = function() {
    clearTimeout(timer);
    timer = null;
    start = false;
  };

  return res; // 设置一个返回值
}




/**
 * 节流
 * @param fn 回调
 * @param wait 阈值
 * @returns 
 */
export function throttle(fn: any, wait: number) {
  const context = this;
  let timer: any = null;
  let previous = 0; // 保存上一次时间

  // 返回匿名函数
  return function () {
    const now = +new Date(); // 现在的时间
    if (!previous) previous = now; // 获取时间

    if (timer) clearTimeout(timer);
    if (now - previous > wait) { // 达到时间阈值，执行一次
      fn.apply(context, arguments); // 立即执行回调
      previous = now; // 更新时间
    } else { // 时间阈值内如果再次触发，设置延时器
      timer = setTimeout(() => {
        fn.apply(context, arguments); // 立即执行回调
      }, wait);
    }
  };
}




export function isEmptyValue(value: any, type: any): boolean {
  if (value === undefined || value === null) {
    return true;
  }
  if (type === 'array' && Array.isArray(value) && !value.length) {
    return true;
  }
  if (isNativeStringType(type) && typeof value === 'string' && !value) {
    return true;
  }
  return false;
}



export function isEmptyObject(obj: object): boolean {
  return Object.keys(obj).length === 0;
}



function isNativeStringType(type: string): boolean {
  return type === 'string' ||
    type === 'url' ||
    type === 'hex' ||
    type === 'email' ||
    type === 'pattern';
}


// 数组随机乱序
export function randomArr(arr: []) {
  const res = new Array(arr.length).fill(undefined);

  const getRandomIndex: any = () => {
    const index = (Math.random() * arr.length) >> 0;
    if (res[index] !== undefined) {
      return getRandomIndex();
    } else {
      return index;
    }
  };
  for(const v of arr) {
    const index = getRandomIndex();
    res[index] = v;
  }
  return res;
}


// 复制
export function copyToBoard(value = '') {
  return new Promise((resolve, reject) => {
    const element = document.createElement('textarea');
    document.body.appendChild(element);
    element.value = value;
    element.select();
    if (document.execCommand('copy')) {
      document.execCommand('copy');
      document.body.removeChild(element);
      resolve(true);
    } else {
      document.body.removeChild(element);
      reject(false);
    }
  });
}

