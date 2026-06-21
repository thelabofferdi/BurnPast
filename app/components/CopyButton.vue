<script setup lang="ts">
const props = defineProps<{
  text: string
}>()

const { copied, copy } = useClipboard()

const handleCopy = async () => {
  await copy(props.text)
}
</script>

<template>
  <button type="button" class="secondary-action" @click="handleCopy">
    <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-copy'" class="size-4" />
    <span>{{ copied ? 'Copied' : 'Copy' }}</span>
  </button>
</template>
