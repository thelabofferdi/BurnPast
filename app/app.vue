<script setup lang="ts">
useHead({
  link: [
    { rel: 'icon', type: 'image/png', href: '/logo.png' }
  ]
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
@import './assets/css/main.css';
</style>
