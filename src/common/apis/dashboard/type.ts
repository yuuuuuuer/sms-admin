export interface DashboardSummary {
  userTotal: number
  smsConfigTotal: number
  logTotal: number
  lastLoginTime: string
  role: string
  username: string
}

export type DashboardSummaryResponseData = ApiResponseData<DashboardSummary>

export interface DeptSummary {
  deptTotal: number
}

export type DeptSummaryResponseData = ApiResponseData<DeptSummary>
