import type * as Auth from "./type"
import { request } from "@/http/axios"

/** 登录，返回 Token 及角色信息 */
export function loginAppApi(data: Auth.LoginRequestData) {
  return request<Auth.LoginResponseData>({
    url: "loginApp",
    method: "post",
    data,
    meta: { encrypted: true }
  })
}

/** 获取当前登录用户信息 */
export function getProfileApi() {
  return request<Auth.ProfileResponseData>({
    url: "auth/profile",
    method: "get"
  })
}
