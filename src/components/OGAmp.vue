<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { FastForward, ListMusic, Pause, Play, Rewind } from '@lucide/vue'

import { formatPlaybackTime } from '@/features/player/playerLogic'
import { usePlayerStore } from '@/stores/player'

const player = usePlayerStore()
const playlistOpen = ref(false)

const elapsed = computed(() => formatPlaybackTime(player.currentTime))
const total = computed(() => formatPlaybackTime(player.duration))
const statusLabel = computed(() => {
  if (player.status === 'error') return 'SIGNAL LOST'
  if (player.status === 'loading') return 'TUNING IN'
  if (player.isPlaying) return 'NOW PLAYING'
  return 'READY'
})

function selectTrack(index: number) {
  player.selectTrack(index, true)
}

function seek(event: Event) {
  player.seek(Number((event.target as HTMLInputElement).value))
}

onMounted(player.initialize)
</script>

<template>
  <aside
    class="ogamp"
    :class="{ 'ogamp--playlist-open': playlistOpen }"
    aria-label="OGAmp music player"
    :data-player-status="player.status"
  >
    <div class="ogamp__main">
      <header class="ogamp__heading">
        <span>OGAMP&nbsp; // &nbsp;{{ statusLabel }}</span>
        <span aria-hidden="true">CHICAGO TRANSMISSION</span>
      </header>

      <h2>{{ player.currentTrack?.title || 'No signal' }}</h2>

      <div
        class="ogamp__spectrum"
        :class="{ 'is-playing': player.isPlaying }"
        data-testid="ogamp-spectrum"
        role="img"
        :aria-label="player.isPlaying ? 'Animated audio spectrum' : 'Audio spectrum waiting for playback'"
      >
        <span
          v-for="(level, index) in player.spectrumLevels"
          :key="index"
          class="ogamp__spectrum-bar"
          :data-level="level.toFixed(3)"
          :style="{ transform: `scaleY(${level})` }"
        ></span>
      </div>

      <div class="ogamp__readout" aria-live="polite">
        <span :class="{ 'is-error': player.status === 'error' }">
          {{ player.errorMessage || `${elapsed} / ${total}` }}
        </span>
        <span>{{ player.playlist.length }} TRACKS QUEUED</span>
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

      <div class="ogamp__controls">
        <button
          class="ogamp__control ogamp__control--primary"
          type="button"
          :disabled="!player.canPlay"
          :aria-label="player.isPlaying ? 'Pause' : 'Play'"
          :title="player.isPlaying ? 'Pause' : 'Play'"
          @click="player.toggle"
        >
          <Pause v-if="player.isPlaying" :size="28" fill="currentColor" aria-hidden="true" />
          <Play v-else :size="28" fill="currentColor" aria-hidden="true" />
        </button>
        <button class="ogamp__control" type="button" aria-label="Previous track" title="Previous track" @click="player.previous">
          <Rewind :size="28" fill="currentColor" aria-hidden="true" />
        </button>
        <button class="ogamp__control" type="button" aria-label="Next track" title="Next track" @click="player.next()">
          <FastForward :size="28" fill="currentColor" aria-hidden="true" />
        </button>
        <button
          class="ogamp__control"
          type="button"
          :aria-expanded="playlistOpen"
          aria-controls="ogamp-playlist"
          :aria-label="playlistOpen ? 'Hide playlist' : 'Open playlist'"
          :title="playlistOpen ? 'Hide playlist' : 'Open playlist'"
          @click="playlistOpen = !playlistOpen"
        >
          <ListMusic :size="26" aria-hidden="true" />
        </button>
      </div>
    </div>

    <Transition name="ogamp-playlist">
      <section v-if="playlistOpen" id="ogamp-playlist" class="ogamp__playlist" aria-label="Playlist">
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
              <span class="ogamp__playlist-title">{{ track.title }}</span>
              <span class="ogamp__leader" aria-hidden="true"></span>
              <span>{{ formatPlaybackTime(track.durationSeconds) }}</span>
            </button>
          </li>
        </ol>
      </section>
    </Transition>
  </aside>
</template>
