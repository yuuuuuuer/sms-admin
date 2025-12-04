import CryptoJS from "crypto-js"

const KEY_PREFIX = "wqnmlgb"
const IV_PREFIX = "systime"
const TIMESTAMP_SLICE_LENGTH = 9
const AES_BLOCK_SIZE = 16

export interface EncryptedPayload {
  s: string
  t: string
}

function buildSecret(prefix: string, timestamp: string) {
  const ts = timestamp.slice(0, TIMESTAMP_SLICE_LENGTH)
  const candidate = `${prefix}${ts}`
  if (candidate.length !== AES_BLOCK_SIZE) {
    throw new Error(`密钥长度必须为 ${AES_BLOCK_SIZE}，当前为 ${candidate.length}`)
  }
  return CryptoJS.enc.Utf8.parse(candidate)
}

function doubleBase64Encode(wordArray: CryptoJS.lib.WordArray) {
  const first = CryptoJS.enc.Base64.stringify(wordArray)
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(first))
}

function doubleBase64Decode(data: string) {
  const first = CryptoJS.enc.Base64.parse(data)
  const firstStr = CryptoJS.enc.Utf8.stringify(first)
  return CryptoJS.enc.Base64.parse(firstStr)
}

function serializePayload(payload: unknown) {
  if (typeof payload === "string") return payload
  return JSON.stringify(payload ?? {})
}

function ensureTimestamp(input?: string) {
  if (input?.length) return input
  return `${Math.floor(Date.now() / 1000)}`
}

export function isEncryptedPayload(value: unknown): value is EncryptedPayload {
  return Boolean(value) && typeof value === "object" && "s" in (value as Record<string, unknown>) && "t" in (value as Record<string, unknown>)
}

export function encryptPayload(payload: unknown, timestamp?: string): EncryptedPayload {
  const t = ensureTimestamp(timestamp)
  const key = buildSecret(KEY_PREFIX, t)
  const iv = buildSecret(IV_PREFIX, t)
  const content = serializePayload(payload)
  const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(content), key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  return {
    s: doubleBase64Encode(encrypted.ciphertext),
    t
  }
}

export function decryptPayload<T = unknown>(payload: EncryptedPayload): T {
  const { t, s } = payload
  const key = buildSecret(KEY_PREFIX, t)
  const iv = buildSecret(IV_PREFIX, t)
  const decrypted = CryptoJS.AES.decrypt(
    CryptoJS.lib.CipherParams.create({ ciphertext: doubleBase64Decode(s) }),
    key,
    {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  )
  const text = CryptoJS.enc.Utf8.stringify(decrypted)
  try {
    return JSON.parse(text) as T
  } catch {
    return text as unknown as T
  }
}
