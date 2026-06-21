import type { RegisterIdentityRequest, RegisterIdentityResponse } from '~/types/dev'

export default defineEventHandler(async (event): Promise<RegisterIdentityResponse> => {
  const config = useRuntimeConfig()
  const maxRequestBodySize = Number(config.maxRequestBodySize)

  if (await isRateLimited(event, 'dev-identity', 20, Number(config.rateLimitWindow))) {
    throw createError({ statusCode: 429, message: 'Too many identity requests. Try again later.' })
  }

  const body = await readLimitedJsonBody<RegisterIdentityRequest>(event, maxRequestBodySize)
  const alias = normalizeDeveloperAlias(body.alias)
  const publicKey = assertPublicKey(body.publicKey)
  const publicKeyFingerprint = getPublicKeyFingerprint(publicKey)

  const token = createDeveloperToken()
  const identity = {
    alias,
    publicKey,
    publicKeyFingerprint,
    createdAt: Date.now(),
    tokenHash: hashDeveloperToken(token)
  }

  const created = await getStore().putIdentityIfAbsent(identity)

  if (!created) {
    throw createError({ statusCode: 409, message: 'Developer alias is already registered' })
  }

  setNoStoreHeaders(event)

  return {
    ...toPublicDeveloperIdentity(identity),
    token
  }
})
