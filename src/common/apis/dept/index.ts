import type * as Dept from "./type"
import { request } from "@/http/axios"

/** 查询所有部门（仅 superadmin 可调用） */
export function getDeptListApi() {
  return request<Dept.DeptListResponseData>({
    url: "dept/listAll",
    method: "get"
  })
}
