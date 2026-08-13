<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Pause, Play, SkipBack, SkipForward } from '@lucide/vue'

import { usePlayerStore } from '@/stores/player'
import { formatPlaybackTime } from '@/features/player/playerLogic'

const player = usePlayerStore()

const elapsed = computed(() => formatPlaybackTime(player.currentTime))
const total = computed(() => formatPlaybackTime(player.duration))

onMounted(player.initialize)
</script>

<template>
  <aside class="ogamp" aria-label="OGAmp music player">
    <div class="ogamp__identity" aria-hidden="true">
      <span>OG</span>
      <small>AMP</small>
    </div>

    <div class="ogamp__track">
      <strong>{{ player.currentTrack?.title || 'No track selected' }}</strong>
      <span>{{ player.canPlay ? `${elapsed} / ${total}` : 'Audio arriving soon' }}</span>
    </div>

    <div class="ogamp__controls">
      <button
        class="icon-button"
        type="button"
        :disabled="player.playlist.length < 2"
        aria-label="Previous track"
        title="Previous track"
        @click="player.previous"
      >
        <SkipBack :size="18" aria-hidden="true" />
      </button>
      <button
        class="icon-button icon-button--primary"
        type="button"
        :disabled="!player.canPlay"
        :aria-label="player.isPlaying ? 'Pause' : 'Play'"
        :title="player.canPlay ? (player.isPlaying ? 'Pause' : 'Play') : 'Audio arriving soon'"
        @click="player.toggle"
      >
        <Pause v-if="player.isPlaying" :size="20" fill="currentColor" aria-hidden="true" />
        <Play v-else :size="20" fill="currentColor" aria-hidden="true" />
      </button>
      <button
        class="icon-button"
        type="button"
        :disabled="player.playlist.length < 2"
        aria-label="Next track"
        title="Next track"
        @click="player.next"
      >
        <SkipForward :size="18" aria-hidden="true" />
      </button>
    </div>
  </aside>
</template>
