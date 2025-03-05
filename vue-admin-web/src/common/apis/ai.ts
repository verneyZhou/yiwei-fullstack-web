import { request } from "@/http/axios"

/** 获取模型list */
export function getAIModelListApi(params: any) {
  return request({
    url: "/ai/model/list",
    method: "get",
    params
  })
}

// 新增模型
export function addAIModelApi(data: any) {
  return request({
    url: "/ai/model/create",
    method: "post",
    data
  })
}

// 删除模型
export function deleteAIModelApi(data: any) {
  return request({
    url: `/ai/model/delete`,
    method: "post",
    data
  })
}

// 修改模型
export function updateAIModelApi(data: any) {
  return request({
    url: "/ai/model/update",
    method: "post",
    data
  })
}

// 更改模型状态
export function updateAIModelStatusApi(data: any) {
  return request({
    url: "/ai/model/status",
    method: "post",
    data
  })
}

// 获取用户list
export function getAIUserListApi(params: any) {
  return request({
    url: "/ai/user/list",
    method: "get",
    params
  })
}

// 获取对话列表
export function getAIChatListApi(params: any) {
  return request({
    url: "/ai/chat/list",
    method: "get",
    params
  })
}

// 删除对话
export function deleteAIChatApi(data: any) {
  return request({
    url: `/ai/chat/delete`,
    method: "post",
    data
  })
}
