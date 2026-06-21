import type { RevealPasteRequest, RevealPasteResponse } from '~/types/paste'

export default defineEventHandler(async (event): Promise<RevealPasteResponse> => {
  const config = useRuntimeConfig()
  const id = assertValidPasteId(getRouterParam(event, 'id'))
  const maxRequestBodySize = Number(config.maxRequestBodySize)

  if (await isRateLimited(event, 'reveal', 60, Number(config.rateLimitWindow))) {
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
