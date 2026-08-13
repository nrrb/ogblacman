<script setup lang="ts">
import { usePageMeta } from '@/composables/usePageMeta'

usePageMeta({
  title: 'Privacy | OG Blacman',
  description: 'Privacy information for the official OG Blacman website.',
  path: '/privacy',
})
</script>

<template>
  <article class="text-page">
    <div class="container text-page__inner">
      <p class="eyebrow">Legal</p>
      <h1>Privacy</h1>
      <p>
        This site will document analytics and mailing-list data practices before those services are enabled.
        Mailing-list information will be processed by Kit and will not be sent to analytics providers.
      </p>
      <p>Contact and policy details will be added before production launch.</p>
    </div>
  </article>
</template>
