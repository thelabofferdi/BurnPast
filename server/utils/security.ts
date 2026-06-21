import { createHash, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

export const safeStringEqual = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) return false
  return timingSafeEqual(leftBuffer, rightBuffer)
}

export const hashJson = (value: unknown): string => {
  return createHash('sha256').update(JSON.stringify(value)).digest('base64url')
}

export const assertRequestBodySize = (event: H3Event, maxBytes: number): void => {
  const rawLength = getHeader(event, 'content-length')
  if (!rawLength) return

  const length = Number(rawLength)

  if (!Number.isFinite(length) || length < 0 || length > maxBytes) {
    throw createError({ statusCode: 413, message: `Request body is too large. Maximum size is ${maxBytes} bytes.` })
  }
}

export const readLimitedJsonBody = async <T>(
  event: H3Event,
  maxBytes: number
): Promise<Partial<T>> => {
  assertRequestBodySize(event, maxBytes)

  const rawBody = await readRawBody(event, 'utf8')
  if (!rawBody) return {}

  if (Buffer.byteLength(rawBody, 'utf8') > maxBytes) {
    throw createError({ statusCode: 413, message: `Request body is too large. Maximum size is ${maxBytes} bytes.` })
  }

  const contentType = getHeader(event, 'content-type') || ''
  if (!contentType.toLowerCase().includes('application/json')) {
    throw createError({ statusCode: 415, message: 'Request body must be JSON' })
  }

  try {
    return JSON.parse(rawBody) as Partial<T>
  } catch {
    throw createError({ statusCode: 400, message: 'Request body is malformed JSON' })
  }
}

export const setNoStoreHeaders = (event: H3Event): void => {
  setHeader(event, 'Cache-Control', 'no-store, max-age=0')
  setHeader(event, 'Pragma', 'no-cache')
  setHeader(event, 'Expires', '0')
  setHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
}
