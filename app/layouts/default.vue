<template>
  <div class="app-shell">
    <header class="app-header">
      <NuxtLink to="/" class="brand-link" aria-label="BurnPast home">
        <img src="/logo.png" alt="" class="brand-logo" />
        <span>BurnPast</span>
      </NuxtLink>

      <div class="header-status">
        <span class="status-dot" />
        <span>Private session</span>
      </div>
    </header>

    <main class="app-main">
      <slot />
    </main>
  </div>
</template>
