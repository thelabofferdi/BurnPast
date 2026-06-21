<script setup lang="ts">
useHead({
  title: 'Secret unavailable - BurnPast',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<template>
  <div class="reader-page">
    <section class="state-panel error-state">
      <UIcon name="i-lucide-ban" class="size-9 text-danger" />
      <h1>Secret unavailable</h1>
      <p>It has been revealed, deleted, or expired.</p>
      <NuxtLink to="/" class="secondary-action">
        <UIcon name="i-lucide-plus" class="size-4" />
        <span>New secret</span>
      </NuxtLink>
    </section>
  </div>
</template>
