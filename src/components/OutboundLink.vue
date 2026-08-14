<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue'

import type { ExternalProviderLink } from '@/types/content'

defineProps<{
  link: ExternalProviderLink
  analyticsEvent: 'merch_click' | 'ticket_click'
}>()
</script>

<template>
  <a
    :href="link.url"
    target="_blank"
    rel="noopener noreferrer"
    :data-analytics-event="analyticsEvent"
    :data-provider="link.providerId"
  >
    <slot>{{ link.label }}</slot>
    <ArrowUpRight :size="17" aria-hidden="true" />
  </a>
</template>
