export type UserRole = "superadmin" | "admin" | "user"

export interface CurrentUserResponse {
  username: string
  roles: string[]
  department: string
}

export type CurrentUserResponseData = ApiResponseData<CurrentUserResponse>

export interface UserListParams {
  pageNumber: number
  pageSize: number
  keyword?: string
}

export interface UserListItem {
  id: number
  username: string
  department: string
  role: UserRole
  snType: 0 | 1
  onlineMinutes?: number
  createdAt: string
}

export type UserListResponseData = ApiResponseData<{
  list: UserListItem[]
  total: number
}>

export interface CreateUserRequestData {
  username: string
  password: string
  department: string
  role: UserRole
  snType: 0 | 1
}

export interface UpdateUserRequestData {
  id: number
  password?: string
  department?: string
  role?: UserRole
  snType?: 0 | 1
}

export interface UpdateDepartmentRequestData {
  id: number
  department: string
}

export interface ResetPasswordRequestData {
  id: number
  password?: string
}
