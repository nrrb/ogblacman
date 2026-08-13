<script setup lang="ts">
import { ArrowLeft, ArrowUpRight, Play } from '@lucide/vue'
import { useHead } from '@unhead/vue'

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

function playRelease() {
  const index = player.playlist.findIndex((item) => item.slug === props.releaseSlug)
  if (index >= 0) player.selectTrack(index, true)
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
          <div class="release-page__actions">
            <button class="button button--dark" type="button" :disabled="!release.audioUrl" @click="playRelease">
              <Play :size="18" fill="currentColor" aria-hidden="true" />
              {{ release.audioUrl ? 'Play in OGAmp' : 'Audio coming soon' }}
            </button>
            <a
              v-for="platform in release.platformLinks"
              :key="platform.label"
              class="button button--outline"
              :href="platform.url"
              target="_blank"
              rel="noopener noreferrer"
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
