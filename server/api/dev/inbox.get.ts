import type { DeveloperInboxResponse } from '~/types/dev'

export default defineEventHandler(async (event): Promise<DeveloperInboxResponse> => {
  const config = useRuntimeConfig()
  const identity = await authenticateDeveloper(event)
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100)
  const rateLimitWindow = runtimeNumber(config.rateLimitWindow, ['RATE_LIMIT_WINDOW', 'NUXT_RATE_LIMIT_WINDOW'], 3600)

  if (await isRateLimited(event, 'dev-inbox', 1200, rateLimitWindow)) {
    throw createError({ statusCode: 429, message: 'Too many inbox requests. Try again later.' })
  }

  const messages = await getStore().listDeveloperMessages(identity.alias, limit)
  setNoStoreHeaders(event)

  return {
    messages: messages
      .filter((message) => Date.now() <= message.expiresAt)
      .map(toDeveloperMessageMetadata)
  }
})
