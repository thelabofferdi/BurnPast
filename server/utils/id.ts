import { customAlphabet } from 'nanoid'

const createReadableId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 21)

export const createSecretId = (): string => createReadableId()
