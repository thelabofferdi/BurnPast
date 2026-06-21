import { createHash } from 'node:crypto'
import type { H3Event } from 'h3'

export const getClientIP = (event: H3Event): string => {
  const config = useRuntimeConfig()
  const headers = getHeaders(event)
  const trustProxy = runtimeBoolean(config.trustProxy, ['TRUST_PROXY', 'NUXT_TRUST_PROXY'])

  if (trustProxy) {
    const forwarded = headers['x-forwarded-for']
    if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
    if (headers['x-real-ip']) return headers['x-real-ip']
  }

  return event.node.req.socket.remoteAddress || 'unknown'
}

export const isRateLimited = async (
  event: H3Event,
  action: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> => {
  const ipHash = createHash('sha256').update(getClientIP(event)).digest('hex').slice(0, 32)
  const window = Math.floor(Date.now() / (windowSeconds * 1000))
  const count = await getStore().increment(`${action}:${ipHash}:${window}`, windowSeconds * 2)

  return count > maxRequests
}
