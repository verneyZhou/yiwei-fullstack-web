import { request } from "@/http/axios"

// 获取俄罗斯方块用户成绩列表
export function getTetrisScoreListApi(params: any) {
  return request({
    url: "/game/tetrisScore/list",
    method: "get",
    params
  })
}

// 删除俄罗斯方块用户成绩
export function deleteTetrisScoreApi(data: any) {
  return request({
    url: `/game/tetrisScore/delete`,
    method: "post",
    data
  })
}

// 获取贪吃蛇用户成绩列表
export function getSnakeScoreListApi(params: any) {
  return request({
    url: "/game/snakeScore/list",
    method: "get",
    params
  })
}
// 删除贪吃蛇用户成绩
export function deleteSnakeScoreApi(data: any) {
  return request({
    url: `/game/snakeScore/delete`,
    method: "post",
    data
  })
}
