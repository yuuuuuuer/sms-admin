import type { UserRole } from "@@/apis/users/type"

export interface LoginRequestData {
  username: string
  password: string
}

export interface LoginResponseData {
  code: number
  msg?: string
  token: string
  offlineTime: number
  miniVersion: number
  userName: string
  role: UserRole
  department: string
}

export interface ProfileInfo {
  username: string
  roles: UserRole[]
  department: string
  loginTime: string
  snType: 0 | 1
}

export type ProfileResponseData = ApiResponseData<ProfileInfo>
