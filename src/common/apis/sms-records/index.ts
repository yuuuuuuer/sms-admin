import type * as Sms from "./type"
import { request } from "@/http/axios"

/** 查询短信配置列表 */
export function getSmsRecordListApi(params?: Sms.SmsRecordListParams) {
  return request<Sms.SmsRecordListResponseData>({
    url: "sms/list",
    method: "get",
    params
  })
}

/** 新增短信配置 */
export function createSmsRecordApi(data: Sms.SmsRecordPayload) {
  return request({
    url: "sms/create",
    method: "post",
    data,
    meta: { encrypted: true }
  })
}

/** 更新短信配置 */
export function updateSmsRecordApi(data: Sms.SmsRecordPayload) {
  return request({
    url: "sms/update",
    method: "put",
    data,
    meta: { encrypted: true }
  })
}

/** 删除短信配置 */
export function deleteSmsRecordApi(id: number) {
  return request({
    url: `sms/${id}`,
    method: "delete"
  })
}
