<script setup lang="ts">
const { createPaste } = usePaste()
const { generateKey, keyToFragment, encrypt, generatePasswordSalt, derivePasswordMaterial, derivePasswordProtectedKey } = useCrypto()
const { copy, copied } = useClipboard()

const loading = ref(false)
const createdLink = ref('')
const createdExpiresAt = ref<number | null>(null)
const error = ref('')

const expiryLabel = computed(() => {
  if (!createdExpiresAt.value) return ''

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(createdExpiresAt.value))
})

const handleCreatePaste = async (data: { content: string; expiresIn: number; burnAfterReading: boolean; password?: string }) => {
  loading.value = true
  error.value = ''

  try {
    const key = await generateKey()
    const passwordSalt = data.password ? generatePasswordSalt() : undefined
    const passwordMaterial = data.password && passwordSalt
      ? await derivePasswordMaterial(data.password, passwordSalt)
      : undefined
    const contentKey = passwordMaterial
      ? await derivePasswordProtectedKey(key, passwordMaterial.contentKeySalt)
      : key
    const encrypted = await encrypt(data.content, contentKey)
    const passwordHash = passwordMaterial?.verifier

    const response = await createPaste({
      encryptedContent: encrypted.encryptedContent,
      iv: encrypted.iv,
      expiresIn: data.expiresIn,
      burnAfterReading: data.burnAfterReading,
      passwordHash,
      passwordSalt
    })

    const fragment = await keyToFragment(key)
    createdLink.value = `${window.location.origin}/${response.id}#${fragment}`
    createdExpiresAt.value = response.expiresAt
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Unable to create secret.'
  } finally {
    loading.value = false
  }
}

const copyLink = async () => {
  await copy(createdLink.value)
}

const reset = () => {
  createdLink.value = ''
  createdExpiresAt.value = null
  error.value = ''
}

useHead({
  title: 'BurnPast',
  meta: [
    { name: 'description', content: 'Encrypted one-time secret sharing.' }
  ]
})
</script>

<template>
  <div class="workspace-grid">
    <section class="workspace-main">
      <div class="page-heading">
        <p class="eyebrow">BurnPast</p>
        <h1>Secure paste</h1>
        <p>Client-side encrypted secret links with timed expiry.</p>
      </div>

      <div v-if="error" class="alert error-alert" role="alert">
        <UIcon name="i-lucide-circle-alert" class="size-5" />
        <span>{{ error }}</span>
      </div>

      <Transition name="fade" mode="out-in">
        <section v-if="createdLink" key="created" class="result-panel">
          <div class="result-header">
            <div class="success-mark">
              <UIcon name="i-lucide-check" class="size-6" />
            </div>
            <div>
              <h2>Link created</h2>
              <p v-if="expiryLabel">Expires {{ expiryLabel }}</p>
            </div>
          </div>

          <div class="link-box">
            <input :value="createdLink" readonly class="link-input" />
            <button type="button" class="icon-button copy-action" :aria-label="copied ? 'Copied' : 'Copy link'" @click="copyLink">
              <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-copy'" class="size-5" />
            </button>
          </div>

          <div class="result-actions">
            <button type="button" class="secondary-action" @click="reset">
              <UIcon name="i-lucide-plus" class="size-4" />
              <span>New secret</span>
            </button>
          </div>
        </section>

        <PasteForm v-else key="form" :loading="loading" @create="handleCreatePaste" />
      </Transition>
    </section>

    <aside class="status-rail" aria-label="Security status">
      <div class="status-block">
        <span class="status-icon encrypted"><UIcon name="i-lucide-key-round" class="size-5" /></span>
        <div>
          <strong>Key</strong>
          <span>URL fragment</span>
        </div>
      </div>
      <div class="status-block">
        <span class="status-icon private"><UIcon name="i-lucide-eye-off" class="size-5" /></span>
        <div>
          <strong>Payload</strong>
          <span>AES-GCM</span>
        </div>
      </div>
      <div class="status-block">
        <span class="status-icon burn"><UIcon name="i-lucide-flame" class="size-5" /></span>
        <div>
          <strong>Reveal</strong>
          <span>Burn-ready</span>
        </div>
      </div>
    </aside>
  </div>
</template>
