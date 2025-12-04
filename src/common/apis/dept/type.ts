export interface DeptItem {
  id: number
  name: string
}

export type DeptListResponseData = ApiResponseData<DeptItem[]>
