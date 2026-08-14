import { computed, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'

import { tracks } from '@/content/tracks'
import { getAdjacentTrackIndex } from '@/features/player/playerLogic'

const STORAGE_KEY = 'ogamp-player'
const SPECTRUM_BAND_COUNT = 14
const IDLE_SPECTRUM = [0.26, 0.48, 0.34, 0.66, 0.18, 0.42, 0.29, 0.57, 0.21, 0.39, 0.32, 0.61, 0.24, 0.46]

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
  const spectrumLevels = ref([...IDLE_SPECTRUM])
  const audio = shallowRef<HTMLAudioElement | null>(null)

  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let frequencyData: Uint8Array<ArrayBuffer> | null = null
  let spectrumFrame = 0
  let lastSpectrumUpdate = 0

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
      if (storedIndex >= 0) {
        currentIndex.value = storedIndex
        if (typeof stored.currentTime === 'number' && Number.isFinite(stored.currentTime) && stored.currentTime >= 0) {
          currentTime.value = stored.currentTime
        }
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

  function resetSpectrum() {
    spectrumLevels.value = [...IDLE_SPECTRUM]
  }

  function stopSpectrum() {
    if (typeof window !== 'undefined') window.cancelAnimationFrame(spectrumFrame)
    spectrumFrame = 0
    lastSpectrumUpdate = 0
    resetSpectrum()
  }

  function updateSpectrum(timestamp: number) {
    if (!analyser || !frequencyData || !isPlaying.value) {
      stopSpectrum()
      return
    }

    if (timestamp - lastSpectrumUpdate >= 40) {
      analyser.getByteFrequencyData(frequencyData)
      const highestBin = Math.max(2, Math.floor(frequencyData.length * 0.46))
      const rawLevels = Array.from({ length: SPECTRUM_BAND_COUNT }, (_, index) => {
        const startRatio = index / SPECTRUM_BAND_COUNT
        const endRatio = (index + 1) / SPECTRUM_BAND_COUNT
        const start = 1 + Math.floor(Math.pow(startRatio, 1.7) * (highestBin - 1))
        const end = Math.max(start + 1, 1 + Math.floor(Math.pow(endRatio, 1.7) * (highestBin - 1)))
        let peak = 0
        for (let bin = start; bin < end; bin += 1) peak = Math.max(peak, frequencyData?.[bin] ?? 0)
        return peak
      })
      const framePeak = Math.max(1, ...rawLevels)
      const frameEnergy = Math.min(1, framePeak / 190)
      spectrumLevels.value = rawLevels.map((value, index) => {
        const signal = 0.08 + Math.pow(value / framePeak, 0.68) * 0.92
        const reactiveFloor = (IDLE_SPECTRUM[index] ?? 0.2) * (0.4 + frameEnergy * 0.42)
        return Math.min(1, Math.max(0.08, signal, reactiveFloor))
      })
      lastSpectrumUpdate = timestamp
    }

    spectrumFrame = window.requestAnimationFrame(updateSpectrum)
  }

  function startSpectrum() {
    if (typeof window === 'undefined') return
    window.cancelAnimationFrame(spectrumFrame)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      spectrumLevels.value = IDLE_SPECTRUM.map((level) => Math.max(0.18, level * 0.72))
      return
    }
    spectrumFrame = window.requestAnimationFrame(updateSpectrum)
  }

  function initializeSpectrum() {
    if (typeof window === 'undefined' || !audio.value || analyser) return
    try {
      audioContext = new AudioContext()
      analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.78
      frequencyData = new Uint8Array(analyser.frequencyBinCount)
      const source = audioContext.createMediaElementSource(audio.value)
      source.connect(analyser)
      analyser.connect(audioContext.destination)
    } catch {
      audioContext = null
      analyser = null
      frequencyData = null
      resetSpectrum()
    }
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
      startSpectrum()
    })
    audio.value.addEventListener('pause', () => {
      if (status.value !== 'loading' && status.value !== 'error') status.value = 'paused'
      stopSpectrum()
      persist()
    })
    audio.value.addEventListener('error', () => {
      status.value = 'error'
      errorMessage.value = describeMediaError()
      stopSpectrum()
    })
    audio.value.addEventListener('ended', () => next(true))
    loadCurrentTrack()
  }

  async function play() {
    initialize()
    if (!audio.value || !canPlay.value) return
    try {
      initializeSpectrum()
      if (audioContext?.state === 'suspended') await audioContext.resume()
      await audio.value.play()
    } catch (error) {
      status.value = 'error'
      errorMessage.value = error instanceof Error ? error.message : 'Playback could not start.'
      stopSpectrum()
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
    spectrumLevels,
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
