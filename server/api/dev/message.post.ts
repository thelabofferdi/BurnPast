import { nanoid } from 'nanoid'
import type { SendDeveloperMessageRequest, SendDeveloperMessageResponse, StoredDeveloperMessage } from '~/types/dev'

export default defineEventHandler(async (event): Promise<SendDeveloperMessageResponse> => {
  const config = useRuntimeConfig()
  const maxRequestBodySize = runtimeNumber(config.maxRequestBodySize, ['MAX_REQUEST_BODY_SIZE', 'NUXT_MAX_REQUEST_BODY_SIZE'], 262144)
  const maxPasteSize = runtimeNumber(config.maxPasteSize, ['MAX_PASTE_SIZE', 'NUXT_MAX_PASTE_SIZE'], 102400)
  const rateLimitRequests = runtimeNumber(config.rateLimitRequests, ['RATE_LIMIT_REQUESTS', 'NUXT_RATE_LIMIT_REQUESTS'], 10)
  const rateLimitWindow = runtimeNumber(config.rateLimitWindow, ['RATE_LIMIT_WINDOW', 'NUXT_RATE_LIMIT_WINDOW'], 3600)
  const sender = await authenticateDeveloper(event)

  if (await isRateLimited(event, 'dev-send', rateLimitRequests, rateLimitWindow)) {
    throw createError({ statusCode: 429, message: 'Too many developer secrets sent. Try again later.' })
  }

  const body = await readLimitedJsonBody<SendDeveloperMessageRequest>(event, maxRequestBodySize)
  const recipient = normalizeDeveloperAlias(body.recipient)
  const recipientIdentity = await getStore().getIdentity(recipient)

  if (!recipientIdentity) {
    throw createError({ statusCode: 404, message: 'Recipient alias not found' })
  }

  const encryptedContent = assertBase64Url(body.encryptedContent, 'Encrypted content')
  const iv = assertBase64Url(body.iv, 'Encryption IV')
  const wrappedKey = assertBase64Url(body.wrappedKey, 'Wrapped key')
  const ttlSeconds = normalizeDeveloperTtl(body.expiresIn)
  const size = Number(body.size)

  if (!Number.isInteger(size) || size < 1 || size > maxPasteSize) {
    throw createError({ statusCode: 413, message: `Secret is too large. Maximum size is ${maxPasteSize} bytes.` })
  }

  const id = nanoid(21)
  const now = Date.now()
  const expiresAt = now + ttlSeconds * 1000
  const message: StoredDeveloperMessage = {
    id,
    sender: sender.alias,
    recipient,
    encryptedContent,
    iv,
    wrappedKey,
    createdAt: now,
    expiresAt,
    burnAfterReading: body.burnAfterReading !== false,
    size
  }

  await getStore().putDeveloperMessage(message, ttlSeconds)
  setNoStoreHeaders(event)

  return { id, expiresAt }
})
