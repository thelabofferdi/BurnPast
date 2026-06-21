import type { PasteMetadata, StoredPaste } from '~/types/paste'

const ID_PATTERN = /^[a-zA-Z0-9_-]{12,32}$/
const BASE64_URL_PATTERN = /^[a-zA-Z0-9_-]+$/
const MIN_TTL_SECONDS = 60
const MAX_TTL_SECONDS = 30 * 24 * 60 * 60

export const assertValidPasteId = (id: string | undefined): string => {
  if (!id || !ID_PATTERN.test(id)) {
    throw createError({ statusCode: 400, message: 'Invalid secret ID' })
  }

  return id
}

export const assertValidEncryptedPayload = (encryptedContent: unknown, iv: unknown): void => {
  if (typeof encryptedContent !== 'string' || encryptedContent.length === 0) {
    throw createError({ statusCode: 400, message: 'Encrypted content is required' })
  }

  if (typeof iv !== 'string' || iv.length === 0) {
    throw createError({ statusCode: 400, message: 'Encryption IV is required' })
  }

  if (!BASE64_URL_PATTERN.test(encryptedContent) || !BASE64_URL_PATTERN.test(iv)) {
    throw createError({ statusCode: 400, message: 'Encrypted payload is malformed' })
  }
}

export const normalizeTtl = (expiresIn: unknown): number => {
  const ttl = Number(expiresIn)

  if (!Number.isInteger(ttl) || ttl < MIN_TTL_SECONDS || ttl > MAX_TTL_SECONDS) {
    throw createError({ statusCode: 400, message: 'Invalid expiration' })
  }

  return ttl
}

export const assertPasswordFields = (passwordHash?: unknown, passwordSalt?: unknown): void => {
  const hasHash = typeof passwordHash === 'string' && passwordHash.length > 0
  const hasSalt = typeof passwordSalt === 'string' && passwordSalt.length > 0

  if (hasHash !== hasSalt) {
    throw createError({ statusCode: 400, message: 'Password verifier is incomplete' })
  }

  if (hasHash && (!BASE64_URL_PATTERN.test(passwordHash as string) || !BASE64_URL_PATTERN.test(passwordSalt as string))) {
    throw createError({ statusCode: 400, message: 'Password verifier is malformed' })
  }
}

export const getPayloadSize = (encryptedContent: string, iv: string): number => {
  return new TextEncoder().encode(`${encryptedContent}.${iv}`).length
}

export const toMetadata = (paste: StoredPaste): PasteMetadata => ({
  id: paste.id,
  createdAt: paste.createdAt,
  expiresAt: paste.expiresAt,
  burnAfterReading: paste.burnAfterReading,
  passwordProtected: paste.passwordProtected,
  passwordSalt: paste.passwordSalt,
  size: paste.size
})

export const assertNotExpired = async (paste: StoredPaste | null, id: string): Promise<StoredPaste> => {
  if (!paste) {
    throw createError({ statusCode: 410, message: 'This secret has been burned or expired' })
  }

  if (Date.now() > paste.expiresAt) {
    await getStore().deletePaste(id)
    throw createError({ statusCode: 410, message: 'This secret has expired' })
  }

  return paste
}
