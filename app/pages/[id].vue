<script setup lang="ts">
import type { PasteMetadata } from '~/types/paste'

const route = useRoute()
const { getPasteMetadata } = usePaste()

const loading = ref(true)
const error = ref('')
const metadata = ref<PasteMetadata | null>(null)
const encryptionKey = ref('')

const loadSecret = async () => {
  const id = route.params.id as string

  try {
    const hash = window.location.hash.slice(1)

    if (!hash) {
      error.value = 'Missing encryption key.'
      return
    }

    encryptionKey.value = hash
    metadata.value = await getPasteMetadata(id)
  } catch (err: any) {
    const status = err?.statusCode || err?.response?.status

    if (status === 410) {
      error.value = 'This secret has already burned or expired.'
    } else if (status === 400) {
      error.value = 'Invalid secret link.'
    } else {
      error.value = 'Unable to load this secret.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadSecret)

useHead({
  title: 'View Secret - BurnPast',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<template>
  <div class="reader-page">
    <div v-if="loading" class="state-panel">
      <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary" />
      <p>Loading secret</p>
    </div>

    <div v-else-if="error" class="state-panel error-state">
      <UIcon name="i-lucide-ban" class="size-9 text-danger" />
      <h1>Unavailable</h1>
      <p>{{ error }}</p>
      <NuxtLink to="/" class="secondary-action">
        <UIcon name="i-lucide-plus" class="size-4" />
        <span>New secret</span>
      </NuxtLink>
    </div>

    <PasteViewer
      v-else-if="metadata && encryptionKey"
      :metadata="metadata"
      :encryption-key="encryptionKey"
      @cancel="navigateTo('/')"
    />
  </div>
</template>
