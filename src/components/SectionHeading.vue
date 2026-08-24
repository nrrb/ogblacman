<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  heading: { type: Object, required: true },
  wrapperClass: { type: String, required: true },
  titleClass: { type: String, required: true },
  titleId: { type: String, default: undefined },
})

const svgText = ref(null)
const viewBox = ref('0 0 1 1')
const svgWidth = ref(1)
const svgHeight = ref(1)
const isMeasured = ref(false)
let measureFrame

function measureHeading() {
  const text = svgText.value
  if (!text) return

  const bounds = text.getBBox()
  const strokeWidth = Number.parseFloat(getComputedStyle(text).strokeWidth) || 0
  const padding = Math.max(4, strokeWidth * 1.75)
  const width = Math.max(1, bounds.width + padding * 2)
  const height = Math.max(1, bounds.height + padding * 2)

  viewBox.value = [
    bounds.x - padding,
    bounds.y - padding,
    width,
    height,
  ].join(' ')
  svgWidth.value = width
  svgHeight.value = height
  isMeasured.value = true
}

function scheduleMeasurement() {
  window.cancelAnimationFrame(measureFrame)
  measureFrame = window.requestAnimationFrame(measureHeading)
}

onMounted(async () => {
  await nextTick()
  try {
    await document.fonts?.load(`400 ${getComputedStyle(svgText.value).fontSize} "Tajamuka Script"`)
  } catch {
    // The fallback measurement below still keeps the heading usable.
  }
  scheduleMeasurement()
  window.addEventListener('resize', scheduleMeasurement)
})

watch(() => props.heading.title, async () => {
  await nextTick()
  scheduleMeasurement()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', scheduleMeasurement)
  window.cancelAnimationFrame(measureFrame)
})
</script>

<template>
  <div :class="['display-heading', wrapperClass]">
    <div
      :id="titleId"
      :class="['display-heading__title', titleClass, 'outlined-heading']"
      role="heading"
      aria-level="2"
    >
      <svg
        class="display-heading__svg"
        :class="{ 'is-measured': isMeasured }"
        :viewBox="viewBox"
        :width="svgWidth"
        :height="svgHeight"
        aria-hidden="true"
        focusable="false"
      >
        <text ref="svgText" class="display-heading__svg-text" x="0" y="0">
          {{ heading.title }}
        </text>
      </svg>
      <span class="display-heading__accessible-title">{{ heading.title }}</span>
    </div>
  </div>
</template>
