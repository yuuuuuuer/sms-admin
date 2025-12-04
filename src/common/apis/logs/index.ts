import type * as Logs from "./type"
import { request } from "@/http/axios"

/** 根据时间范围查询操作记录 */
export function getLogsApi(params: Logs.LogListParams) {
  return request<Logs.LogListResponseData>({
    url: "logs/list",
    method: "get",
    params
  })
}
