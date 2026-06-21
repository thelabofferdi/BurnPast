import { nanoid } from 'nanoid'
import type { CreatePasteRequest, CreatePasteResponse, StoredPaste } from '~/types/paste'

export default defineEventHandler(async (event): Promise<CreatePasteResponse> => {
  const config = useRuntimeConfig()
  const maxPasteSize = Number(config.maxPasteSize)
  const rateLimitRequests = Number(config.rateLimitRequests)
  const rateLimitWindow = Number(config.rateLimitWindow)
  const maxRequestBodySize = Number(config.maxRequestBodySize)

  if (await isRateLimited(event, 'create', rateLimitRequests, rateLimitWindow)) {
    throw createError({ statusCode: 429, message: 'Too many secrets created. Try again later.' })
  }

  const body = await readLimitedJsonBody<CreatePasteRequest>(event, maxRequestBodySize)
  assertValidEncryptedPayload(body.encryptedContent, body.iv)
  assertPasswordFields(body.passwordHash, body.passwordSalt)

  const ttlSeconds = normalizeTtl(body.expiresIn)
  const size = getPayloadSize(body.encryptedContent, body.iv)

  if (size > maxPasteSize) {
    throw createError({ statusCode: 413, message: `Secret is too large. Maximum size is ${maxPasteSize} bytes.` })
  }

  const id = nanoid(21)
  const now = Date.now()
  const expiresAt = now + ttlSeconds * 1000
  const passwordProtected = Boolean(body.passwordHash && body.passwordSalt)

  const paste: StoredPaste = {
    id,
    encryptedContent: body.encryptedContent,
    iv: body.iv,
    createdAt: now,
    expiresAt,
    burnAfterReading: body.burnAfterReading !== false,
    passwordProtected,
    passwordHash: passwordProtected ? body.passwordHash : undefined,
    passwordSalt: passwordProtected ? body.passwordSalt : undefined,
    size
  }

  await getStore().putPaste(id, paste, ttlSeconds)
  setNoStoreHeaders(event)

  return {
    id,
    url: `${config.public.siteUrl}/${id}`,
    expiresAt
  }
})
