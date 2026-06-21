export interface DeveloperIdentity {
  alias: string
  publicKey: JsonWebKey
  publicKeyFingerprint: string
  createdAt: number
  tokenHash: string
}

export interface PublicDeveloperIdentity {
  alias: string
  publicKey: JsonWebKey
  publicKeyFingerprint: string
  createdAt: number
}

export interface RegisterIdentityRequest {
  alias: string
  publicKey: JsonWebKey
}

export interface RegisterIdentityResponse extends PublicDeveloperIdentity {
  token: string
}

export interface DeveloperMessageMetadata {
  id: string
  sender: string
  recipient: string
  createdAt: number
  expiresAt: number
  burnAfterReading: boolean
  size: number
}

export interface StoredDeveloperMessage extends DeveloperMessageMetadata {
  encryptedContent: string
  iv: string
  wrappedKey: string
}

export interface SendDeveloperMessageRequest {
  recipient: string
  encryptedContent: string
  iv: string
  wrappedKey: string
  expiresIn: number
  burnAfterReading: boolean
  size: number
}

export interface SendDeveloperMessageResponse {
  id: string
  expiresAt: number
}

export interface DeveloperInboxResponse {
  messages: DeveloperMessageMetadata[]
}

export interface RevealDeveloperMessageResponse {
  encryptedContent: string
  iv: string
  wrappedKey: string
  metadata: DeveloperMessageMetadata
}
