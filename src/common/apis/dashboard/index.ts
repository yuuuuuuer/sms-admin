import type * as Dashboard from "./type"
import { request } from "@/http/axios"

/** 获取仪表盘基础统计 */
export function getDashboardSummaryApi() {
  return request<Dashboard.DashboardSummaryResponseData>({
    url: "dashboard/summary",
    method: "get"
  })
}

/** 获取部门统计（仅 superadmin 可访问） */
export function getDeptSummaryApi() {
  return request<Dashboard.DeptSummaryResponseData>({
    url: "dashboard/dept-summary",
    method: "get"
  })
}
