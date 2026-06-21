import type { CreatePasteRequest, CreatePasteResponse, StoredPaste } from '~/types/paste'

export default defineEventHandler(async (event): Promise<CreatePasteResponse> => {
  const config = useRuntimeConfig()
  const maxPasteSize = runtimeNumber(config.maxPasteSize, ['MAX_PASTE_SIZE', 'NUXT_MAX_PASTE_SIZE'], 102400)
  const rateLimitRequests = runtimeNumber(config.rateLimitRequests, ['RATE_LIMIT_REQUESTS', 'NUXT_RATE_LIMIT_REQUESTS'], 10)
  const rateLimitWindow = runtimeNumber(config.rateLimitWindow, ['RATE_LIMIT_WINDOW', 'NUXT_RATE_LIMIT_WINDOW'], 3600)
  const maxRequestBodySize = runtimeNumber(config.maxRequestBodySize, ['MAX_REQUEST_BODY_SIZE', 'NUXT_MAX_REQUEST_BODY_SIZE'], 262144)
  const siteUrl = runtimeString(config.public.siteUrl, ['SITE_URL', 'NUXT_PUBLIC_SITE_URL'], 'http://localhost:3000')

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

  const id = createSecretId()
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
    url: `${siteUrl}/${id}`,
    expiresAt
  }
})
