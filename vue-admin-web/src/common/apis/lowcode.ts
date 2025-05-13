import { request } from "@/http/axios"

// 获取低码页面列表
export function getLowcodePageListApi(params: any) {
  return request({
    url: "/lowcode/page/list",
    method: "get",
    params
  })
}

// 删除低码页面
export function deleteLowcodePageApi(data: any) {
  return request({
    url: `/lowcode/page/delete`,
    method: "post",
    data
  })
}

// 获取低码项目列表
export function getLowcodeProjectListApi(params: any) {
  return request({
    url: "/lowcode/project/list",
    method: "get",
    params
  })
}
// 删除低码项目
export function deleteLowcodeProjectApi(data: any) {
  return request({
    url: `/lowcode/project/delete`,
    method: "post",
    data
  })
}
