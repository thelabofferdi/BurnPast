const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()
const PASSWORD_ITERATIONS = 210000

const bytesToBase64Url = (bytes: Uint8Array): string => {
  let binary = ''
  const chunkSize = 0x8000

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

const base64UrlToBytes = (value: string): Uint8Array => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }

  return bytes
}

export const useCrypto = () => {
  const generateKey = async (): Promise<CryptoKey> => {
    return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
  }

  const keyToFragment = async (key: CryptoKey): Promise<string> => {
    const exported = await crypto.subtle.exportKey('raw', key)
    return bytesToBase64Url(new Uint8Array(exported))
  }

  const fragmentToKey = async (fragment: string): Promise<CryptoKey> => {
    return crypto.subtle.importKey('raw', base64UrlToBytes(fragment), { name: 'AES-GCM', length: 256 }, true, ['decrypt'])
  }

  const encrypt = async (plaintext: string, key: CryptoKey): Promise<{ encryptedContent: string; iv: string }> => {
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, textEncoder.encode(plaintext))

    return {
      encryptedContent: bytesToBase64Url(new Uint8Array(encrypted)),
      iv: bytesToBase64Url(iv)
    }
  }

  const decrypt = async (encryptedContent: string, iv: string, key: CryptoKey): Promise<string> => {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64UrlToBytes(iv) },
      key,
      base64UrlToBytes(encryptedContent)
    )

    return textDecoder.decode(decrypted)
  }

  const generatePasswordSalt = (): string => {
    return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(16)))
  }

  const derivePasswordMaterial = async (password: string, salt: string): Promise<{
    verifier: string
    contentKeySalt: Uint8Array
  }> => {
    const keyMaterial = await crypto.subtle.importKey('raw', textEncoder.encode(password), 'PBKDF2', false, ['deriveBits'])
    const bits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt: base64UrlToBytes(salt),
        iterations: PASSWORD_ITERATIONS
      },
      keyMaterial,
      512
    )

    const bytes = new Uint8Array(bits)

    return {
      verifier: bytesToBase64Url(bytes.slice(0, 32)),
      contentKeySalt: bytes.slice(32, 64)
    }
  }

  const hashPassword = async (password: string, salt: string): Promise<string> => {
    return (await derivePasswordMaterial(password, salt)).verifier
  }

  const derivePasswordProtectedKey = async (baseKey: CryptoKey, contentKeySalt: Uint8Array): Promise<CryptoKey> => {
    const rawBaseKey = await crypto.subtle.exportKey('raw', baseKey)
    const hkdfKey = await crypto.subtle.importKey('raw', rawBaseKey, 'HKDF', false, ['deriveKey'])

    return await crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: contentKeySalt,
        info: textEncoder.encode('burnpast:v1:password-protected-content')
      },
      hkdfKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )
  }

  return {
    generateKey,
    keyToFragment,
    fragmentToKey,
    encrypt,
    decrypt,
    generatePasswordSalt,
    hashPassword,
    derivePasswordMaterial,
    derivePasswordProtectedKey
  }
}
