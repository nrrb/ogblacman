<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { subscribeToScroll } from '@beautifullife/golden-text'
import { GoldenText } from '@beautifullife/golden-text/vue'
import { PRESETS } from '@beautifullife/golden-text/presets'

const props = defineProps({
  heading: { type: Object, required: true },
  wrapperClass: { type: String, required: true },
  titleClass: { type: String, required: true },
  titleId: { type: String, default: undefined },
})

const headingPreset = PRESETS.find((preset) => preset.name === 'Wide banner') ?? PRESETS[0]
const desktopHeroHeadingPreset = {
  ...headingPreset,
  name: 'Desktop hero heading',
}
const mobileHeroHeadingPreset = {
  ...headingPreset,
  name: 'Mobile hero heading',
  camera: {
    ...headingPreset.camera,
    position: [0, 0.05, 8.5],
  },
}

const JIGGLE_THRESHOLD = 0.1
const JIGGLE_COOLDOWN = 500
const JIGGLE_DURATION = 600
const fastShine = { cycleSeconds: 8 }
const headingRef = ref(null)
const isJiggling = ref(false)
let isVisible = false
let currentScrollVelocity = 0
let lastJiggleAt = -Infinity
let jiggleTimer
let restartFrame
let visibilityObserver
let unsubscribeScroll

const activeHeadingPreset = computed(() => {
  if (props.titleClass === 'heading-title--desktop-hero') return desktopHeroHeadingPreset
  if (props.titleClass === 'heading-title--mobile-hero') return mobileHeroHeadingPreset
  return headingPreset
})
const isMobileHeading = computed(() => props.titleClass.startsWith('heading-title--mobile-'))

function jiggle() {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  const now = performance.now()
  if (now - lastJiggleAt < JIGGLE_COOLDOWN) return
  lastJiggleAt = now

  window.clearTimeout(jiggleTimer)
  window.cancelAnimationFrame(restartFrame)
  isJiggling.value = false
  restartFrame = window.requestAnimationFrame(() => {
    isJiggling.value = true
    jiggleTimer = window.setTimeout(() => { isJiggling.value = false }, JIGGLE_DURATION)
  })
}

onMounted(() => {
  const observeVisibility = ([entry]) => {
    const becameVisible = !isVisible && entry.isIntersecting
    isVisible = entry.isIntersecting
    if (becameVisible && isMobileHeading.value) jiggle()
    if (becameVisible && !isMobileHeading.value && currentScrollVelocity >= JIGGLE_THRESHOLD) jiggle()
  }

  if (typeof IntersectionObserver === 'undefined') {
    isVisible = true
    if (isMobileHeading.value) jiggle()
  } else {
    visibilityObserver = new IntersectionObserver(observeVisibility, { rootMargin: '150px' })
    visibilityObserver.observe(headingRef.value)
  }

  if (!isMobileHeading.value) {
    unsubscribeScroll = subscribeToScroll((velocity) => {
      currentScrollVelocity = velocity
      if (isVisible && velocity >= JIGGLE_THRESHOLD) jiggle()
    })
  }
})

onBeforeUnmount(() => {
  visibilityObserver?.disconnect()
  unsubscribeScroll?.()
  window.clearTimeout(jiggleTimer)
  window.cancelAnimationFrame(restartFrame)
})

const titleLines = computed(() => {
  const title = props.heading.title.trim()
  const words = title.split(/\s+/)

  if (words.length < 2 || title.length <= 10) return [title]

  let splitAt = 1
  let smallestDifference = Infinity

  for (let index = 1; index < words.length; index += 1) {
    const firstLine = words.slice(0, index).join(' ')
    const secondLine = words.slice(index).join(' ')
    const difference = Math.abs(firstLine.length - secondLine.length)

    if (difference < smallestDifference) {
      splitAt = index
      smallestDifference = difference
    }
  }

  return [words.slice(0, splitAt).join(' '), words.slice(splitAt).join(' ')]
})
</script>

<template>
  <div :class="['display-heading', wrapperClass]">
    <div
      :id="titleId"
      ref="headingRef"
      :class="['display-heading__title', titleClass, 'golden-heading', { 'is-jiggling': isJiggling }]"
    >
      <span class="golden-heading__label">{{ heading.title }}</span>
      <GoldenText
        :preset="activeHeadingPreset"
        :lines="titleLines"
        :shine="fastShine"
      />
    </div>
  </div>
</template>
