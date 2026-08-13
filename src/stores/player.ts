import { computed, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'

import { tracks } from '@/content/tracks'
import { getAdjacentTrackIndex } from '@/features/player/playerLogic'

const STORAGE_KEY = 'ogamp-player'

interface PersistedPlayerState {
  currentTrackSlug: string
  currentTime: number
}

type PlayerStatus = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'error'

export const usePlayerStore = defineStore('player', () => {
  const playlist = tracks
  const currentIndex = ref(0)
  const currentTime = ref(0)
  const duration = ref(playlist[0]?.durationSeconds ?? 0)
  const status = ref<PlayerStatus>('idle')
  const errorMessage = ref('')
  const audio = shallowRef<HTMLAudioElement | null>(null)

  const currentTrack = computed(() => playlist[currentIndex.value] ?? null)
  const isPlaying = computed(() => status.value === 'playing')
  const isReady = computed(() => ['ready', 'playing', 'paused'].includes(status.value))
  const canPlay = computed(() => Boolean(currentTrack.value?.audioUrl))

  function persist() {
    if (typeof window === 'undefined' || !currentTrack.value) return
    const state: PersistedPlayerState = {
      currentTrackSlug: currentTrack.value.slug,
      currentTime: currentTime.value,
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  function restore() {
    if (typeof window === 'undefined') return
    try {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '') as Partial<PersistedPlayerState>
      const storedIndex = playlist.findIndex((track) => track.slug === stored.currentTrackSlug)
      if (storedIndex >= 0) currentIndex.value = storedIndex
      if (typeof stored.currentTime === 'number' && Number.isFinite(stored.currentTime) && stored.currentTime >= 0) {
        currentTime.value = stored.currentTime
      }
      duration.value = currentTrack.value?.durationSeconds ?? 0
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }

  function describeMediaError() {
    const code = audio.value?.error?.code
    if (code === MediaError.MEDIA_ERR_ABORTED) return 'Playback was interrupted.'
    if (code === MediaError.MEDIA_ERR_NETWORK) return 'The audio file could not be loaded.'
    if (code === MediaError.MEDIA_ERR_DECODE) return 'This audio file could not be decoded.'
    if (code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) return 'This audio format is not supported.'
    return 'Audio is temporarily unavailable.'
  }

  function loadCurrentTrack() {
    if (!audio.value || !currentTrack.value) return
    errorMessage.value = ''
    status.value = 'loading'
    duration.value = currentTrack.value.durationSeconds
    audio.value.src = currentTrack.value.audioUrl
    audio.value.load()
  }

  function initialize() {
    if (typeof window === 'undefined' || audio.value) return
    restore()
    audio.value = new Audio()
    audio.value.preload = 'metadata'
    audio.value.addEventListener('loadedmetadata', () => {
      const loadedDuration = audio.value?.duration
      if (loadedDuration && Number.isFinite(loadedDuration)) duration.value = loadedDuration
      if (audio.value) {
        audio.value.currentTime = currentTime.value < duration.value ? currentTime.value : 0
        currentTime.value = audio.value.currentTime
      }
      status.value = audio.value?.paused === false ? 'playing' : 'ready'
    })
    audio.value.addEventListener('timeupdate', () => {
      currentTime.value = audio.value?.currentTime || 0
      persist()
    })
    audio.value.addEventListener('play', () => {
      status.value = 'playing'
      errorMessage.value = ''
    })
    audio.value.addEventListener('pause', () => {
      if (status.value !== 'loading' && status.value !== 'error') status.value = 'paused'
      persist()
    })
    audio.value.addEventListener('error', () => {
      status.value = 'error'
      errorMessage.value = describeMediaError()
    })
    audio.value.addEventListener('ended', () => next(true))
    loadCurrentTrack()
  }

  async function play() {
    initialize()
    if (!audio.value || !canPlay.value) return
    try {
      await audio.value.play()
    } catch (error) {
      status.value = 'error'
      errorMessage.value = error instanceof Error ? error.message : 'Playback could not start.'
    }
  }

  function pause() {
    audio.value?.pause()
  }

  async function toggle() {
    if (isPlaying.value) {
      pause()
      return
    }
    await play()
  }

  function selectTrack(index: number, autoplay = false) {
    if (index < 0 || index >= playlist.length) return
    initialize()
    const wasPlaying = isPlaying.value
    currentIndex.value = index
    currentTime.value = 0
    loadCurrentTrack()
    persist()
    if (autoplay || wasPlaying) void play()
  }

  function previous() {
    const index = getAdjacentTrackIndex(currentIndex.value, playlist.length, -1)
    selectTrack(index, isPlaying.value)
  }

  function next(autoplay = isPlaying.value) {
    const index = getAdjacentTrackIndex(currentIndex.value, playlist.length, 1)
    selectTrack(index, autoplay)
  }

  function seek(value: number) {
    if (!audio.value || !isReady.value || !Number.isFinite(value)) return
    const nextTime = Math.min(Math.max(value, 0), duration.value)
    audio.value.currentTime = nextTime
    currentTime.value = nextTime
    persist()
  }

  return {
    playlist,
    currentTrack,
    currentIndex,
    currentTime,
    duration,
    status,
    errorMessage,
    isPlaying,
    isReady,
    canPlay,
    initialize,
    play,
    pause,
    toggle,
    selectTrack,
    previous,
    next,
    seek,
  }
})
