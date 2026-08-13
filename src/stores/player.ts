import { computed, shallowRef } from 'vue'
import { defineStore } from 'pinia'

import { releases } from '@/content/releases'
import { getAdjacentTrackIndex } from '@/features/player/playerLogic'

const STORAGE_KEY = 'ogamp-player'

interface PersistedPlayerState {
  currentIndex: number
  currentTime: number
}

export const usePlayerStore = defineStore('player', () => {
  const playlist = releases
  const currentIndex = shallowRef(0)
  const currentTime = shallowRef(0)
  const duration = shallowRef(0)
  const isPlaying = shallowRef(false)
  const isReady = shallowRef(false)
  const audio = shallowRef<HTMLAudioElement | null>(null)

  const currentTrack = computed(() => playlist[currentIndex.value] ?? null)
  const canPlay = computed(() => Boolean(currentTrack.value?.audioUrl))

  function persist() {
    if (typeof window === 'undefined') return
    const state: PersistedPlayerState = {
      currentIndex: currentIndex.value,
      currentTime: currentTime.value,
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  function restore() {
    if (typeof window === 'undefined') return
    try {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '') as PersistedPlayerState
      if (stored.currentIndex >= 0 && stored.currentIndex < playlist.length) {
        currentIndex.value = stored.currentIndex
      }
      if (Number.isFinite(stored.currentTime) && stored.currentTime >= 0) {
        currentTime.value = stored.currentTime
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }

  function loadCurrentTrack() {
    if (!audio.value || !currentTrack.value?.audioUrl) return
    audio.value.src = currentTrack.value.audioUrl
    audio.value.load()
  }

  function initialize() {
    if (typeof window === 'undefined' || audio.value) return
    restore()
    audio.value = new Audio()
    audio.value.preload = 'metadata'
    audio.value.addEventListener('loadedmetadata', () => {
      duration.value = audio.value?.duration || 0
      if (audio.value && currentTime.value < duration.value) {
        audio.value.currentTime = currentTime.value
      }
      isReady.value = true
    })
    audio.value.addEventListener('timeupdate', () => {
      currentTime.value = audio.value?.currentTime || 0
      persist()
    })
    audio.value.addEventListener('play', () => {
      isPlaying.value = true
    })
    audio.value.addEventListener('pause', () => {
      isPlaying.value = false
      persist()
    })
    audio.value.addEventListener('ended', next)
    loadCurrentTrack()
  }

  async function toggle() {
    initialize()
    if (!audio.value || !canPlay.value) return
    if (audio.value.paused) {
      await audio.value.play()
    } else {
      audio.value.pause()
    }
  }

  function selectTrack(index: number, autoplay = false) {
    if (index < 0 || index >= playlist.length) return
    currentIndex.value = index
    currentTime.value = 0
    isReady.value = false
    loadCurrentTrack()
    persist()
    if (autoplay && audio.value && canPlay.value) {
      void audio.value.play()
    }
  }

  function previous() {
    const index = getAdjacentTrackIndex(currentIndex.value, playlist.length, -1)
    selectTrack(index, isPlaying.value)
  }

  function next() {
    const index = getAdjacentTrackIndex(currentIndex.value, playlist.length, 1)
    selectTrack(index, isPlaying.value)
  }

  function seek(value: number) {
    if (!audio.value || !isReady.value) return
    audio.value.currentTime = value
    currentTime.value = value
    persist()
  }

  return {
    playlist,
    currentTrack,
    currentIndex,
    currentTime,
    duration,
    isPlaying,
    isReady,
    canPlay,
    initialize,
    toggle,
    selectTrack,
    previous,
    next,
    seek,
  }
})
