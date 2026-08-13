<script setup lang="ts">
import { ArrowUpRight, Play } from '@lucide/vue'

import { usePlayerStore } from '@/stores/player'
import type { Release } from '@/types/content'

const props = defineProps<{
  release: Release
}>()

const player = usePlayerStore()

function playRelease() {
  const index = player.playlist.findIndex((track) => track.slug === props.release.previewTrackSlug)
  if (index >= 0) player.selectTrack(index, true)
}
</script>

<template>
  <article class="release-card">
    <RouterLink :to="`/music/${release.slug}`" class="release-card__art-link">
      <picture>
        <source v-if="release.artworkOptimized" :srcset="release.artworkOptimized" type="image/webp" />
        <img
          class="release-card__art"
          :src="release.artwork"
          :alt="release.artworkAlt"
          width="1254"
          height="1254"
          loading="lazy"
        />
      </picture>
    </RouterLink>
    <div class="release-card__body">
      <p class="eyebrow">{{ release.featured ? 'Featured release' : 'Release' }}</p>
      <h3>{{ release.title }}</h3>
      <p>{{ release.description }}</p>
      <div class="release-card__actions">
        <button
          class="button button--solid"
          type="button"
          :disabled="!release.previewTrackSlug"
          @click="playRelease"
        >
          <Play :size="17" fill="currentColor" aria-hidden="true" />
          {{ release.previewTrackSlug ? 'Play preview' : 'Coming soon' }}
        </button>
        <RouterLink class="button button--quiet" :to="`/music/${release.slug}`">
          Details
          <ArrowUpRight :size="17" aria-hidden="true" />
        </RouterLink>
      </div>
    </div>
  </article>
</template>
