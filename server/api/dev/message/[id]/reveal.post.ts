import type { RevealDeveloperMessageResponse } from '~/types/dev'

export default defineEventHandler(async (event): Promise<RevealDeveloperMessageResponse> => {
  const config = useRuntimeConfig()
  const maxRequestBodySize = Number(config.maxRequestBodySize)
  const identity = await authenticateDeveloper(event)
  const id = assertValidDeveloperMessageId(getRouterParam(event, 'id'))

  if (await isRateLimited(event, 'dev-reveal', 120, Number(config.rateLimitWindow))) {
    throw createError({ statusCode: 429, message: 'Too many developer reveal requests. Try again later.' })
  }

  await readLimitedJsonBody(event, maxRequestBodySize)
  let message = await assertDeveloperMessageNotExpired(await getStore().getDeveloperMessage(id), id)

  if (message.recipient !== identity.alias) {
    throw createError({ statusCode: 403, message: 'This secret belongs to another developer inbox' })
  }

  if (message.burnAfterReading) {
    message = await assertDeveloperMessageNotExpired(await getStore().consumeDeveloperMessage(id), id)

    if (message.recipient !== identity.alias) {
      throw createError({ statusCode: 403, message: 'This secret belongs to another developer inbox' })
    }
  }

  setNoStoreHeaders(event)

  return {
    encryptedContent: message.encryptedContent,
    iv: message.iv,
    wrappedKey: message.wrappedKey,
    metadata: toDeveloperMessageMetadata(message)
  }
})
