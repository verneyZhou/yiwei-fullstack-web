
import {get, post, postJSON} from './axios';


// ai chat接口
export const _aiChat = (params: any) => {
  return postJSON('/api/ai/chat', params);
};

// 查询ai模型列表
export const _aiModels = () => {
  return get('/api/ai/models');
};

// 查询余额
export const _aiBalance = () => {
  return get('/api/ai/balance');
};

// 保存对话
export const _aiSaveChat = (params: any) => {
  return postJSON('/api/ai/saveChat', params);
};

// 获取对话列表
export const _aiChatList = () => {
  return get('/api/ai/getChat');
};
// 删除对话
export const _aiDeleteChat = (params: any) => {
  return postJSON('/api/ai/deleteChat', params);
};






