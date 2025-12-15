import { request } from "@/http/axios"
import { getToken } from "@@/utils/cache/cookies"

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

/**
 * 流式调用AI助手
 * @param question 问题
 * @param onData 数据回调
 * @param signal 取消信号
 * @param session_id 会话id
 * @param reset 是否重置历史记录
 */
export async function aiChatStramApi({ question, onData, signal, session_id, reset }: { question: string, onData: (chunk: string) => void, signal?: AbortSignal, session_id?: string, reset?: boolean }) {
  const base = (import.meta.env.VITE_BASE_URL || "").toString()
  const url = `${base}/ai/chat/stream`
  const token = getToken()
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token || "123"}` },
    body: JSON.stringify({ question, session_id, reset }),
    credentials: "include",
    signal
  })
  const ct = resp.headers.get("content-type") || ""
  // 报错处理
  if (!ct.includes("text/event-stream")) {
    let payload: any = null
    try {
      payload = ct.includes("application/json") ? await resp.json() : await resp.text()
    } catch {}
    const code = typeof payload === "object" && payload ? (payload as any).code : undefined
    const msg = typeof payload === "object" && payload ? ((payload as any).message || (payload as any).error) : (typeof payload === "string" ? payload : "")
    const err: any = new Error(msg || `HTTP ${resp.status} ${resp.statusText}`)
    err.status = code ?? resp.status
    err.payload = payload
    throw err
  }
  //////
  const reader = resp.body?.getReader() // 获取流读取器
  if (!reader) throw new Error("stream not available")
  const decoder = new TextDecoder("utf-8") // 文本解码器
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    const text = decoder.decode(value, { stream: true })
    const lines = text.split("\n")
    console.log("====lines", lines)
    for (const line of lines) {
      const s = line.trim()
      if (!s) continue
      if (s.startsWith("data: ")) {
        const payload = s.slice(6)
        if (payload === "end") continue
        onData(payload)
      }
    }
  }
}
