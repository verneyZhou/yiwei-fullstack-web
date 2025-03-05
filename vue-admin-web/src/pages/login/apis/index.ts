import type * as Login from "./type"
import { request } from "@/http/axios"

/** 获取登录验证码 */
export function getLoginCodeApi() {
  return request<Login.LoginCodeResponseData>({
    url: "/auth/code",
    method: "get"
  })
}

/** 登录并返回 Token */
export function loginApi(data: Login.LoginRequestData) {
  return request<Login.LoginResponseData>({
    url: "/auth/login",
    method: "post",
    data
  })
}

/** 获取用户信息 */
export function getUserInfoApi() {
  return request({
    url: "/user/info",
    method: "get"
  })
}

// 注册
export function registerApi(data: any) {
  return request({
    url: "/auth/register",
    method: "post",
    data
  })
}
