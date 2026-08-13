<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'

import { usePageMeta } from '@/composables/usePageMeta'

usePageMeta({
  title: 'Page Not Found | OG Blacman',
  description: 'The requested page could not be found.',
  path: '/404',
  noindex: true,
})
</script>

<template>
  <section class="text-page">
    <div class="container text-page__inner">
      <p class="eyebrow">404</p>
      <h1>Signal lost.</h1>
      <p>That page is not on this frequency.</p>
      <RouterLink class="button button--dark" to="/">
        <ArrowLeft :size="18" aria-hidden="true" />
        Return home
      </RouterLink>
    </div>
  </section>
</template>
