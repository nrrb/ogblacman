<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import DesktopExperience from './components/DesktopExperience.vue'
import MobileExperience from './components/MobileExperience.vue'
import { siteContent } from './content/loadContent.js'

const mobileBreakpoint = '(max-width: 767px)'
const canMatchViewport = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
const isMobile = ref(canMatchViewport && window.matchMedia(mobileBreakpoint).matches)
let viewportQuery

const styleVariables = computed(() => ({
  '--image-grain-overlay': `url("${siteContent.shared.style_images.grain_overlay}")`,
  '--image-grain-background': `url("${siteContent.shared.style_images.grain_background}")`,
  '--color-heading-outline': siteContent.theme.heading_outline_color,
  '--heading-outline-width': siteContent.theme.heading_outline_width,
}))

function updateExperience(event) {
  isMobile.value = event.matches
}

onMounted(() => {
  if (!canMatchViewport) return
  viewportQuery = window.matchMedia(mobileBreakpoint)
  isMobile.value = viewportQuery.matches
  viewportQuery.addEventListener('change', updateExperience)
})

onBeforeUnmount(() => {
  viewportQuery?.removeEventListener('change', updateExperience)
})
</script>

<template>
  <main :style="styleVariables">
    <div class="grain-overlay" />
    <MobileExperience v-if="isMobile" :content="siteContent" />
    <DesktopExperience v-else :content="siteContent" />
  </main>
</template>
