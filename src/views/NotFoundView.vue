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
      <h1>This ain't it</h1>
      <p>whatever you looking for it's not here</p>
      <RouterLink class="button button--dark" to="/">
        <ArrowLeft :size="18" aria-hidden="true" />
        Take Me Back
      </RouterLink>
    </div>
  </section>
</template>
