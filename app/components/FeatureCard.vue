<script setup lang="ts">
defineProps<{
  title: string
  description: string
  icon: string
  color?: 'primary' | 'success' | 'secondary'
}>()

const colorClasses = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  secondary: 'bg-warning/10 text-warning'
}
</script>

<template>
  <div class="p-6 rounded-lg bg-surface border border-border transition-colors duration-200 hover:border-primary/40">
    <div
      class="w-11 h-11 rounded-lg flex items-center justify-center mb-5"
      :class="colorClasses[color || 'primary']"
    >
      <UIcon :name="icon" class="text-xl" />
    </div>
    <h3 class="text-lg font-bold mb-3 text-text-primary">{{ title }}</h3>
    <p class="text-text-secondary text-sm leading-relaxed">{{ description }}</p>
  </div>
</template>
