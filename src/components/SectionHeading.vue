<script setup>
import { computed } from 'vue'
import { GoldenText } from '@beautifullife/golden-text/vue'
import { PRESETS } from '@beautifullife/golden-text/presets'

const props = defineProps({
  heading: { type: Object, required: true },
  wrapperClass: { type: String, required: true },
  titleClass: { type: String, required: true },
  titleId: { type: String, default: undefined },
})

const headingPreset = PRESETS.find((preset) => preset.name === 'Wide banner') ?? PRESETS[0]
const heroHeadingPreset = {
  ...headingPreset,
  name: 'Hero heading',
  camera: {
    ...headingPreset.camera,
    position: [0, 0.05, 8.5],
  },
}

const glitchOnEnter = {
  threshold: 0.1,
  duration: 300,
  cooldown: 1400,
  strength: 1,
}

const activeHeadingPreset = computed(() => (
  ['heading-title--desktop-hero', 'heading-title--mobile-hero'].includes(props.titleClass)
    ? heroHeadingPreset
    : headingPreset
))

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
    <div :id="titleId" :class="['display-heading__title', titleClass, 'golden-heading']">
      <span class="golden-heading__label">{{ heading.title }}</span>
      <GoldenText :preset="activeHeadingPreset" :lines="titleLines" :glitch="glitchOnEnter" />
    </div>
  </div>
</template>
