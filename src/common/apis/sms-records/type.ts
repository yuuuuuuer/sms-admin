export interface SmsRecordItem {
  id: number
  userId: number
  username: string
  department: string
  type: string
  smsNumber: string
  smsMsg: string
  createdAt: string
}

export interface SmsRecordListParams {
  pageNumber?: number
  pageSize?: number
}

export type SmsRecordListResponseData = ApiResponseData<{
  list: SmsRecordItem[]
  total: number
}>

export interface SmsRecordPayload {
  id?: number
  userId: number
  type: string
  smsNumber: string
  smsMsg: string
}
