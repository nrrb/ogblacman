<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { usePlayerStore } from '@/stores/player'

const BAND_COUNT = 14
const IDLE_LEVELS = [0.26, 0.48, 0.34, 0.66, 0.18, 0.42, 0.29, 0.57, 0.21, 0.39, 0.32, 0.61, 0.24, 0.46]
const BAR_COLORS = ['#bcff4f', '#e53db7', '#62d8ee']

const player = usePlayerStore()
const canvas = ref<HTMLCanvasElement | null>(null)
const frequencyData = new Uint8Array(player.spectrumBinCount)
const levels = new Float32Array(IDLE_LEVELS)
const bandStarts = new Uint16Array(BAND_COUNT)
const bandEnds = new Uint16Array(BAND_COUNT)

let animationFrame = 0
let motionPreference: MediaQueryList | null = null
let drawingContext: CanvasRenderingContext2D | null = null

const highestBin = Math.max(2, Math.floor(frequencyData.length * 0.46))
for (let index = 0; index < BAND_COUNT; index += 1) {
  const startRatio = index / BAND_COUNT
  const endRatio = (index + 1) / BAND_COUNT
  const start = 1 + Math.floor(Math.pow(startRatio, 1.7) * (highestBin - 1))
  bandStarts[index] = start
  bandEnds[index] = Math.max(
    start + 1,
    1 + Math.floor(Math.pow(endRatio, 1.7) * (highestBin - 1)),
  )
}

function drawSpectrum() {
  if (!drawingContext || !canvas.value) return

  const width = canvas.value.width
  const height = canvas.value.height
  const gap = 2
  const barWidth = (width - gap * (BAND_COUNT - 1)) / BAND_COUNT

  drawingContext.clearRect(0, 0, width, height)
  for (let index = 0; index < BAND_COUNT; index += 1) {
    const barHeight = Math.max(3, Math.round((levels[index] ?? 0.1) * height))
    drawingContext.fillStyle = BAR_COLORS[index % BAR_COLORS.length] ?? '#bcff4f'
    drawingContext.fillRect(Math.round(index * (barWidth + gap)), height - barHeight, Math.ceil(barWidth), barHeight)
  }
}

function drawIdle(reduced = false) {
  for (let index = 0; index < BAND_COUNT; index += 1) {
    const idleLevel = IDLE_LEVELS[index] ?? 0.2
    levels[index] = reduced ? Math.max(0.18, idleLevel * 0.72) : idleLevel
  }
  drawSpectrum()
}

function updateLevels(timestamp: number) {
  if (!player.readSpectrum(frequencyData)) return false

  let framePeak = 1
  for (let index = 0; index < BAND_COUNT; index += 1) {
    let peak = 0
    const start = bandStarts[index] ?? 0
    const end = bandEnds[index] ?? start + 1
    for (let bin = start; bin < end; bin += 1) {
      peak = Math.max(peak, frequencyData[bin] ?? 0)
    }
    levels[index] = peak
    framePeak = Math.max(framePeak, peak)
  }

  const frameEnergy = Math.min(1, framePeak / 180)
  for (let index = 0; index < BAND_COUNT; index += 1) {
    const signal = 0.08 + Math.pow(Math.min(1, (levels[index] ?? 0) / 185), 0.72) * 0.92
    const pulse = 0.84 + Math.sin(timestamp * 0.026 + index * 1.7) * 0.16
    const reactiveFloor = (IDLE_LEVELS[index] ?? 0.2) * (0.28 + frameEnergy * 0.44) * pulse
    levels[index] = Math.min(1, Math.max(0.08, signal, reactiveFloor))
  }
  return true
}

function cancelAnimation() {
  window.cancelAnimationFrame(animationFrame)
  animationFrame = 0
}

function renderFrame(timestamp: number) {
  animationFrame = 0
  if (!player.isPlaying || document.hidden) return
  if (updateLevels(timestamp)) drawSpectrum()
  animationFrame = window.requestAnimationFrame(renderFrame)
}

function startAnimation() {
  cancelAnimation()
  if (motionPreference?.matches) {
    drawIdle(true)
    return
  }
  animationFrame = window.requestAnimationFrame(renderFrame)
}

function stopAnimation() {
  cancelAnimation()
  drawIdle()
}

function handleVisibilityChange() {
  if (document.hidden) {
    cancelAnimation()
  } else if (player.isPlaying) {
    startAnimation()
  }
}

function handleMotionPreferenceChange() {
  if (player.isPlaying) startAnimation()
  else drawIdle()
}

watch(
  () => player.isPlaying,
  (playing) => {
    if (playing) startAnimation()
    else stopAnimation()
  },
)

onMounted(() => {
  drawingContext = canvas.value?.getContext('2d', { alpha: true }) ?? null
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionPreference.addEventListener('change', handleMotionPreferenceChange)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  drawIdle()
  if (player.isPlaying) startAnimation()
})

onBeforeUnmount(() => {
  cancelAnimation()
  drawingContext = null
  motionPreference?.removeEventListener('change', handleMotionPreferenceChange)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <canvas
    ref="canvas"
    class="ogamp__spectrum"
    :class="{ 'is-playing': player.isPlaying }"
    width="132"
    height="40"
    data-testid="ogamp-spectrum"
    role="img"
    :aria-label="player.isPlaying ? 'Animated audio spectrum' : 'Audio spectrum waiting for playback'"
  ></canvas>
</template>
