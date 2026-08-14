import { computed, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import type Webamp from 'webamp'

import { tracks } from '@/content/tracks'
import { getAdjacentTrackIndex } from '@/features/player/playerLogic'

const STORAGE_KEY = 'ogamp-player'

interface PersistedPlayerState {
  currentTrackSlug: string
  currentTime: number
}

interface PendingSelection {
  index: number
  autoplay: boolean
}

type PlayerStatus = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'error'

export const usePlayerStore = defineStore('player', () => {
  const playlist = tracks
  const currentIndex = ref(0)
  const currentTime = ref(0)
  const duration = ref(playlist[0]?.durationSeconds ?? 0)
  const status = ref<PlayerStatus>('idle')
  const errorMessage = ref('')
  const webamp = shallowRef<Webamp | null>(null)

  let unsubscribeState: (() => void) | null = null
  let unsubscribeTrack: (() => void) | null = null
  let syncTimer = 0
  let pendingSelection: PendingSelection | null = null
  let pendingRestoreTime = 0
  let isAttaching = false
  let playbackAllowed = false

  const currentTrack = computed(() => playlist[currentIndex.value] ?? null)
  const isPlaying = computed(() => status.value === 'playing')
  const isReady = computed(() => ['ready', 'playing', 'paused'].includes(status.value))
  const canPlay = computed(() => Boolean(currentTrack.value?.audioUrl && webamp.value))

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
      if (storedIndex >= 0) {
        currentIndex.value = storedIndex
        if (typeof stored.currentTime === 'number' && Number.isFinite(stored.currentTime) && stored.currentTime >= 0) {
          currentTime.value = stored.currentTime
          pendingRestoreTime = stored.currentTime
        }
      }
      duration.value = currentTrack.value?.durationSeconds ?? 0
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }

  function syncFromWebamp() {
    if (!webamp.value) return
    const mediaStatus = webamp.value.getPlayerMediaStatus()
    if (mediaStatus === 'PLAYING' && !playbackAllowed) {
      webamp.value.pause()
    }
    if (isAttaching || !playbackAllowed) status.value = 'ready'
    else if (mediaStatus === 'PLAYING') status.value = 'playing'
    else if (mediaStatus === 'PAUSED') status.value = 'paused'
    else if (mediaStatus === 'CLOSED') status.value = 'idle'
    else status.value = 'ready'

    const elapsed = webamp.value.media.timeElapsed()
    const loadedDuration = webamp.value.media.duration()
    if (Number.isFinite(elapsed) && elapsed >= 0) currentTime.value = elapsed
    if (Number.isFinite(loadedDuration) && loadedDuration > 0) duration.value = loadedDuration
    persist()
  }

  function attach(instance: Webamp) {
    detach()
    webamp.value = instance
    status.value = 'loading'
    errorMessage.value = ''
    restore()
    isAttaching = true
    playbackAllowed = Boolean(pendingSelection?.autoplay)

    unsubscribeTrack = instance.onTrackDidChange((trackInfo) => {
      if (!trackInfo || typeof window === 'undefined') return
      const trackUrl = new URL(trackInfo.url, window.location.href).href
      const index = playlist.findIndex((track) => new URL(track.audioUrl, window.location.href).href === trackUrl)
      if (index >= 0) {
        if (index !== currentIndex.value) currentTime.value = 0
        currentIndex.value = index
        duration.value = playlist[index]?.durationSeconds ?? 0
      }
      if (pendingRestoreTime > 0) {
        instance.seekToTime(pendingRestoreTime)
        currentTime.value = pendingRestoreTime
        pendingRestoreTime = 0
      }
      persist()
    })

    unsubscribeState = instance.__onStateChange(syncFromWebamp)
    syncTimer = window.setInterval(syncFromWebamp, 1_000)

    if (pendingSelection) {
      const selection = pendingSelection
      pendingSelection = null
      isAttaching = false
      selectTrack(selection.index, selection.autoplay)
      return
    }

    instance.stop()
    instance.setCurrentTrack(currentIndex.value)
    instance.pause()
    isAttaching = false
    syncFromWebamp()
  }

  function detach(instance?: Webamp) {
    if (instance && webamp.value !== instance) return
    unsubscribeState?.()
    unsubscribeTrack?.()
    unsubscribeState = null
    unsubscribeTrack = null
    if (typeof window !== 'undefined') window.clearInterval(syncTimer)
    syncTimer = 0
    webamp.value = null
    playbackAllowed = false
    status.value = 'idle'
  }

  function fail(message: string) {
    errorMessage.value = message
    status.value = 'error'
  }

  function play() {
    if (!webamp.value || !canPlay.value) return
    playbackAllowed = true
    webamp.value.play()
    syncFromWebamp()
  }

  function allowPlayback() {
    playbackAllowed = true
  }

  function pause() {
    webamp.value?.pause()
    syncFromWebamp()
  }

  function toggle() {
    if (isPlaying.value) pause()
    else play()
  }

  function selectTrack(index: number, autoplay = false) {
    if (index < 0 || index >= playlist.length) return
    currentIndex.value = index
    currentTime.value = 0
    duration.value = playlist[index]?.durationSeconds ?? 0
    if (!webamp.value) {
      pendingSelection = { index, autoplay }
      persist()
      return
    }

    const wasPlaying = isPlaying.value
    if (!autoplay && !wasPlaying) webamp.value.pause()
    webamp.value.setCurrentTrack(index)
    if (autoplay || wasPlaying) {
      playbackAllowed = true
      webamp.value.play()
    }
    persist()
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
    if (!webamp.value || !isReady.value || !Number.isFinite(value)) return
    const nextTime = Math.min(Math.max(value, 0), duration.value)
    webamp.value.seekToTime(nextTime)
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
    attach,
    detach,
    fail,
    allowPlayback,
    play,
    pause,
    toggle,
    selectTrack,
    previous,
    next,
    seek,
  }
})
