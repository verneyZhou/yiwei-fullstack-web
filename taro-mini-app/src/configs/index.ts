/**
 * 导出常量
 */
const Constants = {
  /**
	 * token字段
	 */
  MASK_TOKEN: 'maskToken',
  /**
	 * 最后一次登录失效的时间戳
	 */
  LOGIN_FAILURE_TIMESTAMP: 'loginFailureTimeStamp',
  /**
	 * 拦截器自定义头部key
	 */
  INTERCEPTOR_HEADER: 'interceptor-custom-header',
};

/**
 * 网络链接
 */
const HOSTS = {
  /**
	 * 接口请求base
	 */
  TARO_API_BASE: 'TARO_API_BASE',
};


// 成功code
const SUCC_LIST = ['0', '00000', '10000'];

// 登录失效code
const LOGIN_FAILURE_LIST = ['99999', '40000', '40001'];

export {
  Constants,
  HOSTS,
  SUCC_LIST,
  LOGIN_FAILURE_LIST
};
