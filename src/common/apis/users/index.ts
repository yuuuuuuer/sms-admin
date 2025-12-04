import type * as Users from "./type"
import { request } from "@/http/axios"

/** 获取当前登录用户详情（兼容旧逻辑） */
export function getCurrentUserApi() {
  return request<Users.CurrentUserResponseData>({
    url: "users/me",
    method: "get"
  })
}

/** 分页查询用户列表 */
export function getUserListApi(params: Users.UserListParams) {
  return request<Users.UserListResponseData>({
    url: "user/listAll",
    method: "get",
    params
  })
}

/** 新增用户 */
export function createUserApi(data: Users.CreateUserRequestData) {
  return request({
    url: "user/create",
    method: "post",
    data,
    meta: { encrypted: true }
  })
}

/** 更新用户（包含角色/状态/密码） */
export function updateUserApi(data: Users.UpdateUserRequestData) {
  return request({
    url: "user/update",
    method: "put",
    data,
    meta: { encrypted: true }
  })
}

/** 切换用户状态 */
export function toggleUserStatusApi(id: number, snType: 0 | 1) {
  return request({
    url: "user/status",
    method: "patch",
    data: { id, snType },
    meta: { encrypted: true }
  })
}

/** 重置密码 */
export function resetUserPasswordApi(id: number, password = "123456") {
  return request({
    url: "user/resetPassword",
    method: "patch",
    data: { id, password },
    meta: { encrypted: true }
  })
}

/** 更新用户所属部门 */
export function updateUserDepartmentApi(data: Users.UpdateDepartmentRequestData) {
  return request({
    url: "user/department",
    method: "patch",
    data,
    meta: { encrypted: true }
  })
}
