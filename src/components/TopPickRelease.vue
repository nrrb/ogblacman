<script setup>
import AppLink from './AppLink.vue'
import ResponsiveImage from './ResponsiveImage.vue'

defineProps({ release: { type: Object, required: true } })
</script>

<template>
  <div class="top-pick-release">
    <ResponsiveImage :image="release.image" class="top-pick-release__art" loading="lazy" />
    <div class="top-pick-release__listen">
      <iframe
        class="top-pick-release__player"
        :src="release.player.embed_url"
        :title="release.player.title"
        loading="lazy"
        allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
      />
      <div class="streaming-links" aria-label="Listen to the featured song">
        <AppLink
          v-for="link in release.streaming_links"
          :key="link.id"
          :link="link"
          class="streaming-link"
        />
      </div>
    </div>
  </div>
</template>
