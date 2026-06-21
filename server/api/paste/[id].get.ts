import type { PasteMetadata } from '~/types/paste'

export default defineEventHandler(async (event): Promise<PasteMetadata> => {
  const config = useRuntimeConfig()
  const id = assertValidPasteId(getRouterParam(event, 'id'))
  const rateLimitWindow = runtimeNumber(config.rateLimitWindow, ['RATE_LIMIT_WINDOW', 'NUXT_RATE_LIMIT_WINDOW'], 3600)

  if (await isRateLimited(event, 'metadata', 120, rateLimitWindow)) {
    throw createError({ statusCode: 429, message: 'Too many requests. Try again later.' })
  }

  const paste = await assertNotExpired(await getStore().getPaste(id), id)
  setNoStoreHeaders(event)

  return toMetadata(paste)
})
