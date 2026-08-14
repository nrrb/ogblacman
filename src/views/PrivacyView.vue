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
        This site uses Google Analytics 4 to count page views and a small set of interactions, such as
        playing a song, opening a release, completing the Tree Hugging game, and clicking through to an
        external music, ticketing, or merchandise platform. These events record what was interacted with,
        never who interacted with it.
      </p>
      <p>
        Analytics is only active when a measurement ID is configured for the environment you are viewing.
        No names, email addresses, or other personally identifying details are sent to Google Analytics.
      </p>
      <p>
        Mailing-list information is processed by Kit and is never sent to analytics providers. Signing up
        records only that a signup succeeded, not the details you submitted.
      </p>
      <p>Contact and policy details will be added before production launch.</p>
    </div>
  </article>
</template>
