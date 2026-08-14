<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue'

import { trackEvent } from '@/analytics'
import type { ExternalProviderLink } from '@/types/content'

const props = defineProps<{
  link: ExternalProviderLink
  analyticsEvent: 'merch_click' | 'ticket_click'
  /** Slug of the product or event this link belongs to. */
  itemSlug?: string
}>()

function handleClick() {
  const slug = props.itemSlug ?? props.link.providerId
  if (props.analyticsEvent === 'merch_click') {
    trackEvent('merch_click', { provider_id: props.link.providerId, item_slug: slug })
    return
  }
  trackEvent('ticket_click', { provider_id: props.link.providerId, event_slug: slug })
}
</script>

<template>
  <a
    :href="link.url"
    target="_blank"
    rel="noopener noreferrer"
    :data-analytics-event="analyticsEvent"
    :data-provider="link.providerId"
    @click="handleClick"
  >
    <slot>{{ link.label }}</slot>
    <ArrowUpRight :size="17" aria-hidden="true" />
  </a>
</template>
