<script setup lang="ts">
const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  create: [data: { content: string; expiresIn: number; burnAfterReading: boolean; password?: string }]
}>()

const expirationOptions = [
  { label: '5 min', value: 300 },
  { label: '1 hour', value: 3600 },
  { label: '1 day', value: 86400 },
  { label: '7 days', value: 604800 },
  { label: '30 days', value: 2592000 }
]

const content = ref('')
const expiresIn = ref(3600)
const burnAfterReading = ref(true)
const password = ref('')
const showPassword = ref(false)

const contentBytes = computed(() => new TextEncoder().encode(content.value).length)
const lineCount = computed(() => Math.max(10, content.value.split('\n').length))
const canSubmit = computed(() => content.value.trim().length > 0 && contentBytes.value <= 75000 && !props.loading)

const handleSubmit = () => {
  if (!canSubmit.value) return

  emit('create', {
    content: content.value,
    expiresIn: expiresIn.value,
    burnAfterReading: burnAfterReading.value,
    password: password.value.trim() || undefined
  })
}
</script>

<template>
  <form class="secret-shell" @submit.prevent="handleSubmit">
    <div class="editor-frame">
      <div class="editor-topbar">
        <div class="editor-title">
          <UIcon name="i-lucide-lock-keyhole" class="size-4 text-primary" />
          <span>New secret</span>
        </div>
        <div class="editor-count" :class="contentBytes > 75000 ? 'text-danger' : 'text-muted'">
          {{ contentBytes.toLocaleString() }} bytes
        </div>
      </div>

      <div class="editor-body">
        <div class="line-rail" aria-hidden="true">
          <span v-for="line in lineCount" :key="line">{{ line }}</span>
        </div>
        <textarea
          v-model="content"
          class="secret-input"
          placeholder="Paste secret text"
          spellcheck="false"
          autocomplete="off"
          autocapitalize="off"
        />
      </div>
    </div>

    <div class="controls-grid">
      <section class="control-panel">
        <label class="control-label">
          <UIcon name="i-lucide-timer" class="size-4" />
          Expiration
        </label>
        <div class="segmented-control" role="radiogroup" aria-label="Expiration">
          <button
            v-for="option in expirationOptions"
            :key="option.value"
            type="button"
            class="segment-button"
            :class="expiresIn === option.value ? 'is-active' : ''"
            :aria-pressed="expiresIn === option.value"
            @click="expiresIn = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </section>

      <section class="control-panel compact-panel">
        <label class="toggle-row">
          <span class="control-label m-0">
            <UIcon name="i-lucide-flame" class="size-4" />
            Burn after reveal
          </span>
          <input v-model="burnAfterReading" type="checkbox" class="toggle-input" />
        </label>
      </section>

      <section class="control-panel password-panel">
        <label class="control-label" for="password">
          <UIcon name="i-lucide-shield" class="size-4" />
          Password
        </label>
        <div class="password-field">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="text-field"
            placeholder="Optional"
            autocomplete="new-password"
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
      </section>

      <button type="submit" class="primary-action" :disabled="!canSubmit">
        <UIcon v-if="loading" name="i-lucide-loader-2" class="size-5 animate-spin" />
        <UIcon v-else name="i-lucide-send" class="size-5" />
        <span>{{ loading ? 'Creating' : 'Create link' }}</span>
      </button>
    </div>
  </form>
</template>
