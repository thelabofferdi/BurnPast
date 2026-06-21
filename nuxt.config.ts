// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  future: { compatibilityVersion: 4 },

  modules: ['@nuxt/ui', '@nuxt/icon', '@nuxt/fonts'],

  fonts: {
    families: [
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 500] }
    ]
  },

  runtimeConfig: {
    redisUrl: process.env.REDIS_URL || '',
    upstashRedisUrl: process.env.UPSTASH_REDIS_URL || '',
    upstashRedisToken: process.env.UPSTASH_REDIS_TOKEN || '',
    allowMemoryStorage: process.env.ALLOW_MEMORY_STORAGE === 'true' || process.env.NODE_ENV !== 'production',
    trustProxy: process.env.TRUST_PROXY === 'true',
    maxRequestBodySize: parseInt(process.env.MAX_REQUEST_BODY_SIZE || '262144'),
    maxPasteSize: parseInt(process.env.MAX_PASTE_SIZE || '102400'),
    rateLimitRequests: parseInt(process.env.RATE_LIMIT_REQUESTS || '10'),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '3600'),
    public: {
      siteUrl: process.env.SITE_URL || 'http://localhost:3000'
    }
  },

  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'no-referrer',
          'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
          'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
        }
      },
      '/api/**': {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Robots-Tag': 'noindex, nofollow'
        }
      }
    }
  }
})
