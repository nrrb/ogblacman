<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { HandHeart, RotateCcw } from '@lucide/vue'

import { projectImages } from '@/content/site'
import { calculateGrowthScore, createTargetScore, getGrowthStage } from '@/features/tree-game/gameLogic'

const HOLD_DURATION_MS = 4200

const progress = ref(0)
const targetScore = ref(createTargetScore())
const isHugging = ref(false)
const hasStarted = ref(false)
const lastFrame = ref<number | null>(null)
let animationFrame = 0

const stage = computed(() => getGrowthStage(progress.value))
const score = computed(() => calculateGrowthScore(progress.value, targetScore.value))
const progressPercent = computed(() => Math.round(progress.value * 100))
const isComplete = computed(() => progress.value >= 1)
const formattedScore = computed(() => `$${score.value.toLocaleString('en-US')}`)
const sceneStyle = computed(() => ({ '--growth-progress': progress.value }))

function advance(timestamp: number) {
  if (!isHugging.value || isComplete.value) return
  if (lastFrame.value !== null) {
    progress.value = Math.min(1, progress.value + (timestamp - lastFrame.value) / HOLD_DURATION_MS)
  }
  lastFrame.value = timestamp
  if (isComplete.value) {
    stopHugging()
    return
  }
  animationFrame = window.requestAnimationFrame(advance)
}

function startHugging(event?: PointerEvent) {
  if (isComplete.value || isHugging.value) return
  if (event) (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  hasStarted.value = true
  isHugging.value = true
  lastFrame.value = null
  animationFrame = window.requestAnimationFrame(advance)
}

function stopHugging() {
  isHugging.value = false
  lastFrame.value = null
  window.cancelAnimationFrame(animationFrame)
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key !== ' ' && event.key !== 'Enter') return
  event.preventDefault()
  startHugging()
}

function handleKeyUp(event: KeyboardEvent) {
  if (event.key !== ' ' && event.key !== 'Enter') return
  event.preventDefault()
  stopHugging()
}

function resetGame() {
  stopHugging()
  progress.value = 0
  hasStarted.value = false
  targetScore.value = createTargetScore()
}

onUnmounted(stopHugging)
</script>

<template>
  <div class="tree-game" :class="`tree-game--stage-${stage}`" :data-complete="isComplete">
    <header class="tree-game__heading">
      <div>
        <p class="eyebrow eyebrow--light">Tree Hugging</p>
        <h2>{{ isComplete ? 'Deep roots. Big energy.' : 'Put down roots.' }}</h2>
      </div>
      <button class="icon-button tree-game__reset" type="button" aria-label="Reset game" title="Reset game" @click="resetGame">
        <RotateCcw :size="20" aria-hidden="true" />
      </button>
    </header>

    <div
      class="tree-game__scene"
      :style="sceneStyle"
      role="group"
      :aria-label="isComplete ? 'OG Blacman beside a giant happy fruit-bearing tree in Chicago' : `A tree at growth stage ${stage + 1} of 5`"
    >
      <img
        class="tree-game__final-art"
        :src="projectImages.treeOptimized"
        alt=""
        width="1254"
        height="1254"
        aria-hidden="true"
      />
      <div class="tree-game__skyline" aria-hidden="true">
        <span v-for="building in 7" :key="building"></span>
      </div>
      <div class="tree-game__score" aria-live="polite">
        <small>HUG VALUE</small>
        <strong>{{ formattedScore }}</strong>
      </div>

      <div class="pixel-tree" aria-hidden="true">
        <div class="pixel-tree__crown">
          <span class="pixel-tree__leaf pixel-tree__leaf--1"></span>
          <span class="pixel-tree__leaf pixel-tree__leaf--2"></span>
          <span class="pixel-tree__leaf pixel-tree__leaf--3"></span>
          <span class="pixel-tree__leaf pixel-tree__leaf--4"></span>
          <span v-for="fruit in 7" :key="fruit" class="pixel-tree__fruit"></span>
          <div class="pixel-tree__face">
            <span></span><span></span><i></i>
          </div>
        </div>
        <div class="pixel-tree__trunk"></div>
      </div>

      <div v-if="isComplete" class="tree-game__final-face" aria-hidden="true">
        <span></span><span></span><i></i>
      </div>

      <div class="pixel-og" :class="{ 'pixel-og--hugging': isHugging }" aria-hidden="true">
        <span class="pixel-og__head"></span>
        <span class="pixel-og__body">OG</span>
        <span class="pixel-og__legs"></span>
        <span class="pixel-og__arms"></span>
      </div>

      <div v-if="isComplete" class="tree-game__complete">
        <span>OG BLACMAN</span>
        <strong>ROOTED IN CHICAGO</strong>
      </div>
    </div>

    <div class="tree-game__controls">
      <div class="tree-game__progress-row">
        <span>{{ hasStarted ? `${progressPercent}% grown` : 'Ready to grow' }}</span>
        <span>Stage {{ stage + 1 }} / 5</span>
      </div>
      <div
        class="tree-game__progress"
        role="progressbar"
        aria-label="Tree growth"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="progressPercent"
      >
        <span :style="{ width: `${progressPercent}%` }"></span>
      </div>
      <button
        class="tree-game__hug"
        type="button"
        :disabled="isComplete"
        @pointerdown="startHugging"
        @pointerup="stopHugging"
        @pointerleave="stopHugging"
        @pointercancel="stopHugging"
        @keydown="handleKeyDown"
        @keyup="handleKeyUp"
        @blur="stopHugging"
      >
        <HandHeart :size="28" aria-hidden="true" />
        {{ isComplete ? 'ROOTED' : isHugging ? 'HUGGING' : 'HUG' }}
      </button>
      <p class="sr-only" role="status" aria-live="polite">
        {{ isComplete ? `Tree complete with a final value of ${formattedScore}.` : `Tree is ${progressPercent}% grown.` }}
      </p>
    </div>
  </div>
</template>
