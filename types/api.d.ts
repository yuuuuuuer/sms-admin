interface ApiResponseData<T = unknown> {
  code: number
  data?: T
  message?: string
  msg?: string
}

interface ApiEncryptedData {
  s: string
  t: string
}
