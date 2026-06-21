import type { PublicDeveloperIdentity } from '~/types/dev'

export default defineEventHandler(async (event): Promise<PublicDeveloperIdentity> => {
  const config = useRuntimeConfig()
  const alias = normalizeDeveloperAlias(getRouterParam(event, 'alias'))
  const rateLimitWindow = runtimeNumber(config.rateLimitWindow, ['RATE_LIMIT_WINDOW', 'NUXT_RATE_LIMIT_WINDOW'], 3600)

  if (await isRateLimited(event, 'dev-identity-lookup', 120, rateLimitWindow)) {
    throw createError({ statusCode: 429, message: 'Too many requests. Try again later.' })
  }

  const identity = await getStore().getIdentity(alias)

  if (!identity) {
    throw createError({ statusCode: 404, message: 'Developer alias not found' })
  }

  setNoStoreHeaders(event)

  return toPublicDeveloperIdentity(identity)
})
