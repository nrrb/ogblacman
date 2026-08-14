<script setup lang="ts">
import { ArrowLeft, ArrowUpRight, Play } from '@lucide/vue'
import { useHead } from '@unhead/vue'

import { trackEvent } from '@/analytics'
import { getRelease } from '@/content/releases'
import { artist, siteUrl } from '@/content/site'
import { usePageMeta } from '@/composables/usePageMeta'
import { usePlayerStore } from '@/stores/player'

const props = defineProps<{
  releaseSlug: string
}>()

const release = getRelease(props.releaseSlug)
const player = usePlayerStore()

if (!release) throw new Error(`Unknown release: ${props.releaseSlug}`)

const previewTrackSlug = release.previewTrackSlug
const releaseSlug = release.slug

usePageMeta({
  title: release.seo.title,
  description: release.seo.description,
  path: `/music/${release.slug}`,
  image: release.seo.image,
  noindex: release.provisional,
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'MusicRecording',
        name: release.title,
        byArtist: {
          '@type': 'MusicGroup',
          name: artist.name,
          url: siteUrl,
        },
        image: new URL(release.artwork, siteUrl).toString(),
      }),
    },
  ],
})

trackEvent('release_view', { release_slug: release.slug, release_title: release.title })

function playRelease() {
  const index = player.playlist.findIndex((item) => item.slug === previewTrackSlug)
  if (index >= 0) player.selectTrack(index, true)
}

// Video destinations report separately from audio streaming platforms.
const VIDEO_PLATFORMS = ['youtube', 'vevo', 'vimeo']

function trackPlatformClick(label: string) {
  const isVideo = VIDEO_PLATFORMS.some((platform) => label.toLowerCase().includes(platform))
  const params = { platform: label, release_slug: releaseSlug }
  trackEvent(isVideo ? 'video_click' : 'streaming_click', params)
}
</script>

<template>
  <article class="release-page">
    <div class="container release-page__inner">
      <RouterLink class="back-link" to="/#music">
        <ArrowLeft :size="17" aria-hidden="true" />
        All music
      </RouterLink>

      <div class="release-page__layout">
        <div class="release-page__art">
          <picture>
            <source v-if="release.artworkOptimized" :srcset="release.artworkOptimized" type="image/webp" />
            <img :src="release.artwork" :alt="release.artworkAlt" width="1254" height="1254" />
          </picture>
        </div>
        <div class="release-page__content">
          <p class="eyebrow">{{ release.featured ? 'Featured release' : 'Release' }}</p>
          <h1>{{ release.title }}</h1>
          <p class="release-page__description">{{ release.description }}</p>
          <div class="release-page__actions" data-buddha-avoid>
            <button class="button button--dark" type="button" :disabled="!release.previewTrackSlug" @click="playRelease">
              <Play :size="18" fill="currentColor" aria-hidden="true" />
              {{ release.previewTrackSlug ? 'Play It In OGAmp' : 'Audio Not Up Yet' }}
            </button>
            <a
              v-for="platform in release.platformLinks"
              :key="platform.label"
              class="button button--outline"
              :href="platform.url"
              target="_blank"
              rel="noopener noreferrer"
              @click="trackPlatformClick(platform.label)"
            >
              {{ platform.label }}
              <ArrowUpRight :size="18" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
