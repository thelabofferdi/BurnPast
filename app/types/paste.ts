export interface PasteMetadata {
  id: string
  createdAt: number
  expiresAt: number
  burnAfterReading: boolean
  passwordProtected: boolean
  passwordSalt?: string
  size: number
}

export interface StoredPaste extends PasteMetadata {
  encryptedContent: string
  iv: string
  passwordHash?: string
}

export interface CreatePasteRequest {
  encryptedContent: string
  iv: string
  expiresIn: number
  burnAfterReading: boolean
  passwordHash?: string
  passwordSalt?: string
}

export interface CreatePasteResponse {
  id: string
  url: string
  expiresAt: number
}

export interface RevealPasteRequest {
  passwordHash?: string
}

export interface RevealPasteResponse {
  encryptedContent: string
  iv: string
  metadata: PasteMetadata
}
