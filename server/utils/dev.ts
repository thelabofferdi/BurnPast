import { createHash, randomBytes } from 'node:crypto'
import type { H3Event } from 'h3'
import type {
  DeveloperIdentity,
  DeveloperMessageMetadata,
  PublicDeveloperIdentity,
  StoredDeveloperMessage
} from '~/types/dev'

const ALIAS_PATTERN = /^@[a-zA-Z0-9][a-zA-Z0-9_-]{1,31}$/
const ID_PATTERN = /^[a-zA-Z0-9_-]{12,32}$/
const BASE64_URL_PATTERN = /^[a-zA-Z0-9_-]+$/
const MIN_TTL_SECONDS = 60
const MAX_TTL_SECONDS = 30 * 24 * 60 * 60

export const normalizeDeveloperAlias = (alias: unknown): string => {
  if (typeof alias !== 'string') {
    throw createError({ statusCode: 400, message: 'Developer alias is required' })
  }

  let decoded: string

  try {
    decoded = decodeURIComponent(alias).trim()
  } catch {
    throw createError({ statusCode: 400, message: 'Invalid developer alias' })
  }

  const normalized = decoded.startsWith('@') ? decoded : `@${decoded}`

  if (!ALIAS_PATTERN.test(normalized)) {
    throw createError({ statusCode: 400, message: 'Invalid developer alias' })
  }

  return normalized.toLowerCase()
}

export const assertValidDeveloperMessageId = (id: string | undefined): string => {
  if (!id || !ID_PATTERN.test(id)) {
    throw createError({ statusCode: 400, message: 'Invalid message ID' })
  }

  return id
}

export const normalizeDeveloperTtl = (expiresIn: unknown): number => {
  const ttl = Number(expiresIn)

  if (!Number.isInteger(ttl) || ttl < MIN_TTL_SECONDS || ttl > MAX_TTL_SECONDS) {
    throw createError({ statusCode: 400, message: 'Invalid expiration' })
  }

  return ttl
}

export const assertBase64Url = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || value.length === 0 || !BASE64_URL_PATTERN.test(value)) {
    throw createError({ statusCode: 400, message: `${field} is malformed` })
  }

  return value
}

export const assertPublicKey = (publicKey: unknown): JsonWebKey => {
  if (!publicKey || typeof publicKey !== 'object') {
    throw createError({ statusCode: 400, message: 'Public key is required' })
  }

  const jwk = publicKey as JsonWebKey

  if (
    jwk.kty !== 'RSA' ||
    jwk.alg !== 'RSA-OAEP-256' ||
    !jwk.key_ops?.includes('encrypt') ||
    typeof jwk.n !== 'string' ||
    typeof jwk.e !== 'string' ||
    !BASE64_URL_PATTERN.test(jwk.n) ||
    !BASE64_URL_PATTERN.test(jwk.e)
  ) {
    throw createError({ statusCode: 400, message: 'Public key must be an RSA-OAEP-256 JWK' })
  }

  const modulusBytes = Buffer.from(jwk.n, 'base64url').length
  if (modulusBytes < 256) {
    throw createError({ statusCode: 400, message: 'Public key modulus must be at least 2048 bits' })
  }

  return {
    kty: 'RSA',
    n: jwk.n,
    e: jwk.e,
    alg: 'RSA-OAEP-256',
    key_ops: ['encrypt'],
    ext: true
  }
}

export const getPublicKeyFingerprint = (publicKey: JsonWebKey): string => {
  return hashJson({ kty: publicKey.kty, alg: publicKey.alg, n: publicKey.n, e: publicKey.e }).slice(0, 32)
}

export const createDeveloperToken = (): string => randomBytes(32).toString('base64url')

export const hashDeveloperToken = (token: string): string => {
  return createHash('sha256').update(token).digest('base64url')
}

export const authenticateDeveloper = async (event: H3Event): Promise<DeveloperIdentity> => {
  const alias = normalizeDeveloperAlias(getHeader(event, 'x-burnpast-alias') || getHeader(event, 'x-burnpaste-alias'))
  const token = getHeader(event, 'x-burnpast-token') || getHeader(event, 'x-burnpaste-token')

  if (!token) {
    throw createError({ statusCode: 401, message: 'Developer token is required' })
  }

  const identity = await getStore().getIdentity(alias)

  if (!identity || !safeStringEqual(identity.tokenHash, hashDeveloperToken(token))) {
    throw createError({ statusCode: 401, message: 'Invalid developer credentials' })
  }

  return identity
}

export const toPublicDeveloperIdentity = (identity: DeveloperIdentity): PublicDeveloperIdentity => ({
  alias: identity.alias,
  publicKey: identity.publicKey,
  publicKeyFingerprint: identity.publicKeyFingerprint || getPublicKeyFingerprint(identity.publicKey),
  createdAt: identity.createdAt
})

export const toDeveloperMessageMetadata = (message: StoredDeveloperMessage): DeveloperMessageMetadata => ({
  id: message.id,
  sender: message.sender,
  recipient: message.recipient,
  createdAt: message.createdAt,
  expiresAt: message.expiresAt,
  burnAfterReading: message.burnAfterReading,
  size: message.size
})

export const assertDeveloperMessageNotExpired = async (
  message: StoredDeveloperMessage | null,
  id: string
): Promise<StoredDeveloperMessage> => {
  if (!message) {
    throw createError({ statusCode: 410, message: 'This developer secret has been burned or expired' })
  }

  if (Date.now() > message.expiresAt) {
    await getStore().deleteDeveloperMessage(id)
    throw createError({ statusCode: 410, message: 'This developer secret has expired' })
  }

  return message
}
