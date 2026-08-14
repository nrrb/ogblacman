<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ListMusic, Pause, Play, SkipBack, SkipForward, X } from '@lucide/vue'

import { formatPlaybackTime } from '@/features/player/playerLogic'
import { usePlayerStore } from '@/stores/player'

const player = usePlayerStore()
const playlistOpen = ref(false)

const elapsed = computed(() => formatPlaybackTime(player.currentTime))
const total = computed(() => formatPlaybackTime(player.duration))
const playerStatus = computed(() => {
  if (player.errorMessage) return player.errorMessage
  if (player.status === 'loading') return 'Loading audio...'
  return `${elapsed.value} / ${total.value}`
})

function selectTrack(index: number) {
  player.selectTrack(index, true)
  playlistOpen.value = false
}

function seek(event: Event) {
  player.seek(Number((event.target as HTMLInputElement).value))
}

onMounted(player.initialize)
</script>

<template>
  <aside class="ogamp" aria-label="OGAmp music player">
    <section v-if="playlistOpen" id="ogamp-playlist" class="ogamp__playlist" aria-label="Playlist">
      <header>
        <div>
          <span>OGAmp queue</span>
          <small>{{ player.playlist.length }} tracks</small>
        </div>
        <button class="icon-button" type="button" aria-label="Close playlist" title="Close playlist" @click="playlistOpen = false">
          <X :size="18" aria-hidden="true" />
        </button>
      </header>
      <ol>
        <li v-for="(track, index) in player.playlist" :key="track.slug">
          <button
            type="button"
            :class="{ 'is-current': index === player.currentIndex }"
            :data-track-slug="track.slug"
            :aria-current="index === player.currentIndex ? 'true' : undefined"
            @click="selectTrack(index)"
          >
            <span class="ogamp__track-number">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="ogamp__playlist-title">
              <strong>{{ track.title }}</strong>
              <small>{{ track.artist }}</small>
            </span>
            <span>{{ formatPlaybackTime(track.durationSeconds) }}</span>
          </button>
        </li>
      </ol>
    </section>

    <div class="ogamp__identity" aria-hidden="true">
      <span>OG</span>
      <small>AMP</small>
    </div>

    <div class="ogamp__track">
      <div class="ogamp__track-copy">
        <strong>{{ player.currentTrack?.title || 'No track selected' }}</strong>
        <span :class="{ 'is-error': player.status === 'error' }">{{ playerStatus }}</span>
      </div>
      <input
        class="ogamp__timeline"
        type="range"
        min="0"
        :max="player.duration || 0"
        step="0.1"
        :value="player.currentTime"
        :disabled="!player.isReady"
        aria-label="Seek current track"
        @input="seek"
      />
    </div>

    <div class="ogamp__controls">
      <button class="icon-button" type="button" aria-label="Previous track" title="Previous track" @click="player.previous">
        <SkipBack :size="18" aria-hidden="true" />
      </button>
      <button
        class="icon-button icon-button--primary"
        type="button"
        :disabled="!player.canPlay"
        :aria-label="player.isPlaying ? 'Pause' : 'Play'"
        :title="player.isPlaying ? 'Pause' : 'Play'"
        @click="player.toggle"
      >
        <Pause v-if="player.isPlaying" :size="20" fill="currentColor" aria-hidden="true" />
        <Play v-else :size="20" fill="currentColor" aria-hidden="true" />
      </button>
      <button class="icon-button" type="button" aria-label="Next track" title="Next track" @click="player.next()">
        <SkipForward :size="18" aria-hidden="true" />
      </button>
      <button
        class="icon-button"
        type="button"
        :aria-expanded="playlistOpen"
        aria-controls="ogamp-playlist"
        aria-label="Open playlist"
        title="Open playlist"
        @click="playlistOpen = !playlistOpen"
      >
        <ListMusic :size="18" aria-hidden="true" />
      </button>
    </div>
  </aside>
</template>
