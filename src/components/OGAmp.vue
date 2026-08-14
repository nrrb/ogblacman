<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { FastForward, ListMusic, Pause, Play, Rewind } from '@lucide/vue'

import { formatPlaybackTime } from '@/features/player/playerLogic'
import OGSpectrum from '@/components/OGSpectrum.vue'
import { usePlayerStore } from '@/stores/player'

const player = usePlayerStore()
const playlistOpen = ref(false)
const root = ref<HTMLElement | null>(null)

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
  playlistOpen.value = false
}

function seek(event: Event) {
  player.seek(Number((event.target as HTMLInputElement).value))
}

function closePlaylist() {
  playlistOpen.value = false
}

// A pointer press anywhere outside the player dismisses the drawer. Using
// pointerdown rather than click means it closes on press instead of waiting
// for release, which matches how native sheets behave on touch.
function handlePointerDown(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) closePlaylist()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closePlaylist()
}

// Only window scroll closes the drawer; the queue's own overflow scrolling
// does not bubble here, so it stays open while the user browses it.
watch(playlistOpen, (open) => {
  if (open) {
    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('scroll', closePlaylist, { passive: true })
    window.addEventListener('keydown', handleKeydown)
    return
  }
  window.removeEventListener('pointerdown', handlePointerDown)
  window.removeEventListener('scroll', closePlaylist)
  window.removeEventListener('keydown', handleKeydown)
})

onMounted(player.initialize)

onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', handlePointerDown)
  window.removeEventListener('scroll', closePlaylist)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <aside
    ref="root"
    class="ogamp"
    :class="{ 'ogamp--playlist-open': playlistOpen }"
    aria-label="OGAmp music player"
    :data-player-status="player.status"
  >
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

    <div class="ogamp__bar">
      <OGSpectrum />

      <div class="ogamp__now">
        <p class="ogamp__title">{{ player.currentTrack?.title || 'No signal' }}</p>
        <p class="ogamp__readout" aria-live="polite">
          <span :class="{ 'is-error': player.status === 'error' }">
            {{ player.errorMessage || `${statusLabel} · ${elapsed} / ${total}` }}
          </span>
        </p>
      </div>

      <div class="ogamp__controls">
        <button
          class="ogamp__control ogamp__control--primary"
          type="button"
          :disabled="!player.canPlay"
          :aria-label="player.isPlaying ? 'Pause' : 'Play'"
          :title="player.isPlaying ? 'Pause' : 'Play'"
          @click="player.toggle"
        >
          <Pause v-if="player.isPlaying" :size="20" fill="currentColor" aria-hidden="true" />
          <Play v-else :size="20" fill="currentColor" aria-hidden="true" />
        </button>
        <button class="ogamp__control" type="button" aria-label="Previous track" title="Previous track" @click="player.previous">
          <Rewind :size="20" fill="currentColor" aria-hidden="true" />
        </button>
        <button class="ogamp__control" type="button" aria-label="Next track" title="Next track" @click="player.next()">
          <FastForward :size="20" fill="currentColor" aria-hidden="true" />
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
          <ListMusic :size="20" aria-hidden="true" />
        </button>
      </div>
    </div>
  </aside>
</template>
