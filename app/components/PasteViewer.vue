<script setup lang="ts">
import type { PasteMetadata } from '~/types/paste'

const props = defineProps<{
  metadata: PasteMetadata
  encryptionKey: string
}>()

const emit = defineEmits<{
  cancel: []
}>()

const { revealPaste } = usePaste()
const { decrypt, fragmentToKey, derivePasswordMaterial, derivePasswordProtectedKey } = useCrypto()

const revealed = ref(false)
const loading = ref(false)
const error = ref('')
const password = ref('')
const showPassword = ref(false)
const decryptedContent = ref('')

const createdLabel = computed(() => new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short'
}).format(new Date(props.metadata.createdAt)))

const expiresLabel = computed(() => new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short'
}).format(new Date(props.metadata.expiresAt)))

const sizeLabel = computed(() => `${props.metadata.size.toLocaleString()} bytes`)

const revealSecret = async () => {
  if (props.metadata.passwordProtected && !password.value) {
    error.value = 'Password required.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const passwordMaterial = props.metadata.passwordProtected && props.metadata.passwordSalt
      ? await derivePasswordMaterial(password.value, props.metadata.passwordSalt)
      : undefined
    const passwordHash = passwordMaterial?.verifier
    const linkKey = await fragmentToKey(props.encryptionKey)
    const contentKey = passwordMaterial
      ? await derivePasswordProtectedKey(linkKey, passwordMaterial.contentKeySalt)
      : linkKey

    const response = await revealPaste(props.metadata.id, { passwordHash })

    decryptedContent.value = await decrypt(response.encryptedContent, response.iv, contentKey)
    revealed.value = true
  } catch (err: any) {
    const status = err?.statusCode || err?.response?.status

    if (status === 403) {
      error.value = 'Invalid password.'
    } else if (status === 410) {
      error.value = 'This secret has already burned or expired.'
    } else {
      error.value = 'Unable to reveal this secret.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="viewer-shell">
    <div v-if="!revealed" class="viewer-panel">
      <div class="viewer-header">
        <div class="viewer-mark">
          <UIcon name="i-lucide-lock-keyhole" class="size-6" />
        </div>
        <div>
          <h1>Locked secret</h1>
          <p>{{ metadata.burnAfterReading ? 'One-time reveal' : 'Timed access' }}</p>
        </div>
      </div>

      <dl class="metadata-grid">
        <div>
          <dt>Created</dt>
          <dd>{{ createdLabel }}</dd>
        </div>
        <div>
          <dt>Expires</dt>
          <dd>{{ expiresLabel }}</dd>
        </div>
        <div>
          <dt>Payload</dt>
          <dd>{{ sizeLabel }}</dd>
        </div>
        <div>
          <dt>Password</dt>
          <dd>{{ metadata.passwordProtected ? 'Required' : 'None' }}</dd>
        </div>
      </dl>

      <div v-if="metadata.passwordProtected" class="password-field reveal-password">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          class="text-field"
          placeholder="Password"
          autocomplete="current-password"
          @keyup.enter="revealSecret"
        />
        <button
          type="button"
          class="icon-button"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          @click="showPassword = !showPassword"
        >
          <UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="size-4" />
        </button>
      </div>

      <div v-if="error" class="alert error-alert" role="alert">
        <UIcon name="i-lucide-circle-alert" class="size-5" />
        <span>{{ error }}</span>
      </div>

      <div class="viewer-actions">
        <button type="button" class="secondary-action" @click="emit('cancel')">
          <UIcon name="i-lucide-x" class="size-4" />
          <span>Cancel</span>
        </button>
        <button type="button" class="primary-action" :disabled="loading" @click="revealSecret">
          <UIcon v-if="loading" name="i-lucide-loader-2" class="size-5 animate-spin" />
          <UIcon v-else name="i-lucide-unlock-keyhole" class="size-5" />
          <span>{{ loading ? 'Revealing' : 'Reveal' }}</span>
        </button>
      </div>
    </div>

    <div v-else class="revealed-panel">
      <div class="revealed-header">
        <div>
          <p class="eyebrow">Secret revealed</p>
          <h1>{{ metadata.burnAfterReading ? 'Burned on server' : 'Still available until expiry' }}</h1>
        </div>
        <CopyButton :text="decryptedContent" />
      </div>

      <pre class="secret-output">{{ decryptedContent }}</pre>
    </div>
  </section>
</template>
