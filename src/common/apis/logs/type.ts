export interface LogListParams {
  startTime: string
  endTime: string
  pageNumber?: number
  pageSize?: number
}

export interface LogRecord {
  id: number
  operateTime: string
  operateType: string
}

export interface LogSummary {
  sendTotal: number
  captureNumber: number
  sendSuccess: number
  userTotal: number
}

export type LogListResponseData = ApiResponseData<{
  list: LogRecord[]
  total: number
  summary: LogSummary
}>
