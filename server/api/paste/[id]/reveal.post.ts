import type { RevealPasteRequest, RevealPasteResponse } from '~/types/paste'

export default defineEventHandler(async (event): Promise<RevealPasteResponse> => {
  const config = useRuntimeConfig()
  const id = assertValidPasteId(getRouterParam(event, 'id'))
  const maxRequestBodySize = runtimeNumber(config.maxRequestBodySize, ['MAX_REQUEST_BODY_SIZE', 'NUXT_MAX_REQUEST_BODY_SIZE'], 262144)
  const rateLimitWindow = runtimeNumber(config.rateLimitWindow, ['RATE_LIMIT_WINDOW', 'NUXT_RATE_LIMIT_WINDOW'], 3600)

  if (await isRateLimited(event, 'reveal', 60, rateLimitWindow)) {
    throw createError({ statusCode: 429, message: 'Too many requests. Try again later.' })
  }

  const body = await readLimitedJsonBody<RevealPasteRequest>(event, maxRequestBodySize)
  let paste = await assertNotExpired(await getStore().getPaste(id), id)

  if (paste.passwordProtected) {
    if (!body.passwordHash) {
      throw createError({
        statusCode: 401,
        message: 'Password required',
        data: { passwordRequired: true, passwordSalt: paste.passwordSalt }
      })
    }

    if (!safeStringEqual(body.passwordHash, paste.passwordHash || '')) {
      throw createError({ statusCode: 403, message: 'Invalid password' })
    }
  }

  if (paste.burnAfterReading) {
    paste = await assertNotExpired(await getStore().consumePaste(id), id)

    if (paste.passwordProtected && !safeStringEqual(body.passwordHash || '', paste.passwordHash || '')) {
      throw createError({ statusCode: 403, message: 'Invalid password' })
    }
  }

  setNoStoreHeaders(event)

  return {
    encryptedContent: paste.encryptedContent,
    iv: paste.iv,
    metadata: toMetadata(paste)
  }
})
