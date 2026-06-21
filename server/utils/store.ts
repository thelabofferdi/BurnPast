import { Redis as UpstashRedis } from '@upstash/redis'
import { createClient } from '@redis/client'
import type { DeveloperIdentity, StoredDeveloperMessage } from '~/types/dev'
import type { StoredPaste } from '~/types/paste'

type StoredValue<T> = {
  value: T
  expiresAt: number
}

type GlobalState = {
  pastes: Map<string, StoredValue<StoredPaste>>
  identities: Map<string, DeveloperIdentity>
  developerMessages: Map<string, StoredValue<StoredDeveloperMessage>>
  inboxes: Map<string, Set<string>>
  counters: Map<string, StoredValue<number>>
}

type Store = {
  putPaste: (id: string, data: StoredPaste, ttlSeconds: number) => Promise<void>
  getPaste: (id: string) => Promise<StoredPaste | null>
  consumePaste: (id: string) => Promise<StoredPaste | null>
  deletePaste: (id: string) => Promise<void>
  putIdentityIfAbsent: (identity: DeveloperIdentity) => Promise<boolean>
  getIdentity: (alias: string) => Promise<DeveloperIdentity | null>
  putDeveloperMessage: (message: StoredDeveloperMessage, ttlSeconds: number) => Promise<void>
  getDeveloperMessage: (id: string) => Promise<StoredDeveloperMessage | null>
  consumeDeveloperMessage: (id: string) => Promise<StoredDeveloperMessage | null>
  deleteDeveloperMessage: (id: string) => Promise<void>
  listDeveloperMessages: (alias: string, limit: number) => Promise<StoredDeveloperMessage[]>
  increment: (key: string, ttlSeconds: number) => Promise<number>
}

let redisStore: Store | null = null
let localRedisStore: Store | null = null
let memoryStore: Store | null = null

const getGlobalState = (): GlobalState => {
  const globalKey = '__burnpastStore'
  const globalScope = globalThis as typeof globalThis & Record<string, GlobalState | undefined>

  if (!globalScope[globalKey]) {
    globalScope[globalKey] = {
      pastes: new Map(),
      identities: new Map(),
      developerMessages: new Map(),
      inboxes: new Map(),
      counters: new Map()
    }
  }

  return globalScope[globalKey]
}

const isExpired = (expiresAt: number) => Date.now() > expiresAt

const createMemoryStore = (): Store => {
  const state = getGlobalState()

  return {
    async putPaste(id, data, ttlSeconds) {
      state.pastes.set(id, {
        value: data,
        expiresAt: Date.now() + ttlSeconds * 1000
      })
    },

    async getPaste(id) {
      const item = state.pastes.get(id)
      if (!item) return null

      if (isExpired(item.expiresAt)) {
        state.pastes.delete(id)
        return null
      }

      return item.value
    },

    async deletePaste(id) {
      state.pastes.delete(id)
    },

    async consumePaste(id) {
      const item = state.pastes.get(id)
      if (!item) return null

      state.pastes.delete(id)

      if (isExpired(item.expiresAt)) return null
      return item.value
    },

    async putIdentityIfAbsent(identity) {
      if (state.identities.has(identity.alias)) return false
      state.identities.set(identity.alias, identity)
      return true
    },

    async getIdentity(alias) {
      return state.identities.get(alias) || null
    },

    async putDeveloperMessage(message, ttlSeconds) {
      state.developerMessages.set(message.id, {
        value: message,
        expiresAt: Date.now() + ttlSeconds * 1000
      })

      if (!state.inboxes.has(message.recipient)) {
        state.inboxes.set(message.recipient, new Set())
      }

      state.inboxes.get(message.recipient)?.add(message.id)
    },

    async getDeveloperMessage(id) {
      const item = state.developerMessages.get(id)
      if (!item) return null

      if (isExpired(item.expiresAt)) {
        state.developerMessages.delete(id)
        state.inboxes.get(item.value.recipient)?.delete(id)
        return null
      }

      return item.value
    },

    async deleteDeveloperMessage(id) {
      const item = state.developerMessages.get(id)
      if (item) {
        state.inboxes.get(item.value.recipient)?.delete(id)
      }

      state.developerMessages.delete(id)
    },

    async consumeDeveloperMessage(id) {
      const item = state.developerMessages.get(id)
      if (!item) return null

      state.developerMessages.delete(id)
      state.inboxes.get(item.value.recipient)?.delete(id)

      if (isExpired(item.expiresAt)) return null
      return item.value
    },

    async listDeveloperMessages(alias, limit) {
      const ids = Array.from(state.inboxes.get(alias) || []).reverse()
      const messages: StoredDeveloperMessage[] = []

      for (const id of ids) {
        const message = await this.getDeveloperMessage(id)
        if (message) messages.push(message)
        if (messages.length >= limit) break
      }

      return messages
    },

    async increment(key, ttlSeconds) {
      const item = state.counters.get(key)

      if (!item || isExpired(item.expiresAt)) {
        state.counters.set(key, {
          value: 1,
          expiresAt: Date.now() + ttlSeconds * 1000
        })
        return 1
      }

      item.value += 1
      return item.value
    }
  }
}

const createUpstashRedisStore = (redis: UpstashRedis): Store => ({
  async putPaste(id, data, ttlSeconds) {
    await redis.set(`paste:${id}`, data, { ex: ttlSeconds })
  },

  async getPaste(id) {
    return await redis.get<StoredPaste>(`paste:${id}`)
  },

  async deletePaste(id) {
    await redis.del(`paste:${id}`)
  },

  async consumePaste(id) {
    return await redis.getdel<StoredPaste>(`paste:${id}`)
  },

  async putIdentityIfAbsent(identity) {
    const result = await redis.set(`dev:identity:${identity.alias}`, identity, { nx: true })
    return result === 'OK'
  },

  async getIdentity(alias) {
    return await redis.get<DeveloperIdentity>(`dev:identity:${alias}`)
  },

  async putDeveloperMessage(message, ttlSeconds) {
    await redis.set(`dev:message:${message.id}`, message, { ex: ttlSeconds })
    await redis.lpush(`dev:inbox:${message.recipient}`, message.id)
    await redis.expire(`dev:inbox:${message.recipient}`, 30 * 24 * 60 * 60)
  },

  async getDeveloperMessage(id) {
    return await redis.get<StoredDeveloperMessage>(`dev:message:${id}`)
  },

  async deleteDeveloperMessage(id) {
    const message = await redis.get<StoredDeveloperMessage>(`dev:message:${id}`)
    await redis.del(`dev:message:${id}`)

    if (message) {
      await redis.lrem(`dev:inbox:${message.recipient}`, 0, id)
    }
  },

  async consumeDeveloperMessage(id) {
    const message = await redis.getdel<StoredDeveloperMessage>(`dev:message:${id}`)

    if (message) {
      await redis.lrem(`dev:inbox:${message.recipient}`, 0, id)
    }

    return message
  },

  async listDeveloperMessages(alias, limit) {
    const ids = await redis.lrange<string>(`dev:inbox:${alias}`, 0, Math.max(limit * 3, limit) - 1)
    const messages: StoredDeveloperMessage[] = []

    for (const id of ids) {
      const message = await redis.get<StoredDeveloperMessage>(`dev:message:${id}`)
      if (message) messages.push(message)
      if (messages.length >= limit) break
    }

    return messages
  },

  async increment(key, ttlSeconds) {
    const redisKey = `rate:${key}`
    const count = await redis.incr(redisKey)

    if (count === 1) {
      await redis.expire(redisKey, ttlSeconds)
    }

    return count
  }
})

const parseJson = <T>(value: string | null): T | null => {
  if (!value) return null
  return JSON.parse(value) as T
}

const createLocalRedisStore = (url: string): Store => {
  const client = createClient({ url })
  let connectPromise: ReturnType<typeof client.connect> | null = null

  client.on('error', (error) => {
    console.error('[burnpast] Redis connection error:', error instanceof Error ? error.message : error)
  })

  const getClient = async () => {
    if (client.isOpen) return client

    connectPromise ||= client.connect().catch((error) => {
      connectPromise = null
      throw error
    })
    await connectPromise

    return client
  }

  return {
    async putPaste(id, data, ttlSeconds) {
      const redis = await getClient()
      await redis.set(`paste:${id}`, JSON.stringify(data), { EX: ttlSeconds })
    },

    async getPaste(id) {
      const redis = await getClient()
      return parseJson<StoredPaste>(await redis.get(`paste:${id}`))
    },

    async deletePaste(id) {
      const redis = await getClient()
      await redis.del(`paste:${id}`)
    },

    async consumePaste(id) {
      const redis = await getClient()
      const value = await redis.sendCommand(['GETDEL', `paste:${id}`])
      return parseJson<StoredPaste>(value as string | null)
    },

    async putIdentityIfAbsent(identity) {
      const redis = await getClient()
      const result = await redis.set(`dev:identity:${identity.alias}`, JSON.stringify(identity), { NX: true })
      return result === 'OK'
    },

    async getIdentity(alias) {
      const redis = await getClient()
      return parseJson<DeveloperIdentity>(await redis.get(`dev:identity:${alias}`))
    },

    async putDeveloperMessage(message, ttlSeconds) {
      const redis = await getClient()
      await redis.set(`dev:message:${message.id}`, JSON.stringify(message), { EX: ttlSeconds })
      await redis.lPush(`dev:inbox:${message.recipient}`, message.id)
      await redis.expire(`dev:inbox:${message.recipient}`, 30 * 24 * 60 * 60)
    },

    async getDeveloperMessage(id) {
      const redis = await getClient()
      return parseJson<StoredDeveloperMessage>(await redis.get(`dev:message:${id}`))
    },

    async deleteDeveloperMessage(id) {
      const redis = await getClient()
      const message = parseJson<StoredDeveloperMessage>(await redis.get(`dev:message:${id}`))
      await redis.del(`dev:message:${id}`)

      if (message) {
        await redis.lRem(`dev:inbox:${message.recipient}`, 0, id)
      }
    },

    async consumeDeveloperMessage(id) {
      const redis = await getClient()
      const value = await redis.sendCommand(['GETDEL', `dev:message:${id}`])
      const message = parseJson<StoredDeveloperMessage>(value as string | null)

      if (message) {
        await redis.lRem(`dev:inbox:${message.recipient}`, 0, id)
      }

      return message
    },

    async listDeveloperMessages(alias, limit) {
      const redis = await getClient()
      const ids = await redis.lRange(`dev:inbox:${alias}`, 0, Math.max(limit * 3, limit) - 1)
      const messages: StoredDeveloperMessage[] = []

      for (const id of ids) {
        const message = parseJson<StoredDeveloperMessage>(await redis.get(`dev:message:${id}`))
        if (message) messages.push(message)
        if (messages.length >= limit) break
      }

      return messages
    },

    async increment(key, ttlSeconds) {
      const redis = await getClient()
      const redisKey = `rate:${key}`
      const count = await redis.incr(redisKey)

      if (count === 1) {
        await redis.expire(redisKey, ttlSeconds)
      }

      return count
    }
  }
}

export const getStore = (): Store => {
  const config = useRuntimeConfig()
  const redisUrl = runtimeString(config.redisUrl, ['REDIS_URL', 'NUXT_REDIS_URL'])
  const upstashRedisUrl = runtimeString(config.upstashRedisUrl, ['UPSTASH_REDIS_URL', 'NUXT_UPSTASH_REDIS_URL'])
  const upstashRedisToken = runtimeString(config.upstashRedisToken, ['UPSTASH_REDIS_TOKEN', 'NUXT_UPSTASH_REDIS_TOKEN'])
  const allowMemoryStorage = runtimeBoolean(config.allowMemoryStorage, ['ALLOW_MEMORY_STORAGE', 'NUXT_ALLOW_MEMORY_STORAGE'])

  if (redisUrl) {
    if (!localRedisStore) {
      localRedisStore = createLocalRedisStore(redisUrl)
    }

    return localRedisStore
  }

  if (upstashRedisUrl && upstashRedisToken) {
    if (!redisStore) {
      redisStore = createUpstashRedisStore(new UpstashRedis({
        url: upstashRedisUrl,
        token: upstashRedisToken
      }))
    }

    return redisStore
  }

  if (!allowMemoryStorage) {
    throw createError({ statusCode: 503, message: 'Persistent storage is not configured' })
  }

  if (!memoryStore) {
    memoryStore = createMemoryStore()
  }

  return memoryStore
}
