import { nanoid } from 'nanoid'
import type { SendDeveloperMessageRequest, SendDeveloperMessageResponse, StoredDeveloperMessage } from '~/types/dev'

export default defineEventHandler(async (event): Promise<SendDeveloperMessageResponse> => {
  const config = useRuntimeConfig()
  const maxRequestBodySize = Number(config.maxRequestBodySize)
  const sender = await authenticateDeveloper(event)

  if (await isRateLimited(event, 'dev-send', Number(config.rateLimitRequests), Number(config.rateLimitWindow))) {
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
  const maxPasteSize = Number(config.maxPasteSize)

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
