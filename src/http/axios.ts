import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios"
import { getToken } from "@@/utils/cache/cookies"
import { decryptPayload, encryptPayload, isEncryptedPayload } from "@@/utils/crypto/aes"
import axios from "axios"
import { get, merge } from "lodash-es"
import { useUserStore } from "@/pinia/stores/user"

interface RequestMeta {
  encrypted?: boolean
}

type RequestConfig = AxiosRequestConfig & { meta?: RequestMeta }

/** 退出登录并强制刷新页面（会重定向到登录页） */
function logout() {
  useUserStore().logout()
  location.reload()
}

/** 创建请求实例 */
function createInstance() {
  // 创建一个 axios 实例命名为 instance
  const instance = axios.create()
  // 请求拦截器
  instance.interceptors.request.use(
    // 发送之前
    config => config,
    // 发送失败
    error => Promise.reject(error)
  )
  // 响应拦截器（可根据具体业务作出相应的调整）
  instance.interceptors.response.use(
    response => handleBusinessResponse(response),
    (error) => {
      // status 是 HTTP 状态码
      const status = get(error, "response.status")
      const message = get(error, "response.data.message")
      switch (status) {
        case 400:
          error.message = "请求错误"
          break
        case 401:
          // Token 过期时
          error.message = message || "未授权"
          logout()
          break
        case 403:
          error.message = message || "拒绝访问"
          break
        case 404:
          error.message = "请求地址出错"
          break
        case 408:
          error.message = "请求超时"
          break
        case 500:
          error.message = "服务器内部错误"
          break
        case 501:
          error.message = "服务未实现"
          break
        case 502:
          error.message = "网关错误"
          break
        case 503:
          error.message = "服务不可用"
          break
        case 504:
          error.message = "网关超时"
          break
        case 505:
          error.message = "HTTP 版本不受支持"
          break
      }
      ElMessage.error(error.message)
      return Promise.reject(error)
    }
  )
  return instance
}

/** 创建请求方法 */
function createRequest(instance: AxiosInstance) {
  return <T>(config: RequestConfig): Promise<T> => {
    const token = getToken()
    // 默认配置
    const defaultConfig: RequestConfig = {
      // 接口地址
      baseURL: import.meta.env.VITE_BASE_URL,
      // 请求头
      headers: {
        // 携带 Token
        "Authorization": token ? `Bearer ${token}` : undefined,
        "Content-Type": "application/json"
      },
      // 请求超时
      timeout: 5000,
      // 跨域请求时是否携带 Cookies
      withCredentials: false
    }
    // 将默认配置 defaultConfig 和传入的自定义配置 config 进行合并成为 mergeConfig
    const mergeConfig = merge({}, defaultConfig, config) as RequestConfig
    if (mergeConfig.meta?.encrypted && mergeConfig.data) {
      mergeConfig.data = encryptPayload(mergeConfig.data)
    }
    return instance(mergeConfig)
  }
}

function handleBusinessResponse(response: AxiosResponse) {
  const responseType = response.config.responseType
  if (responseType === "blob" || responseType === "arraybuffer") return response.data
  let payload = response.data
  if (isEncryptedPayload(payload)) {
    payload = decryptPayload(payload)
  }
  if (payload?.msg && isEncryptedPayload(payload.msg)) {
    payload.msg = decryptPayload(payload.msg)
  }
  const code = payload?.code
  if (code === 401) {
    return logout()
  }
  if (code === undefined) {
    ElMessage.error("非本系统的接口")
    return Promise.reject(new Error("非本系统的接口"))
  }
  const successCodes = [0, 200]
  if (successCodes.includes(code)) {
    return payload
  }
  ElMessage.error(payload.message || payload.msg || "业务请求失败")
  return Promise.reject(new Error(payload.message || payload.msg || "业务请求失败"))
}

/** 用于请求的实例 */
const instance = createInstance()

/** 用于请求的方法 */
export const request = createRequest(instance)
