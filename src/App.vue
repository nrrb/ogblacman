<script setup>
import { computed } from 'vue'
import DesktopExperience from './components/DesktopExperience.vue'
import MobileExperience from './components/MobileExperience.vue'
import { siteContent } from './content/loadContent.js'

const styleVariables = computed(() => ({
  '--image-grain-overlay': `url("${siteContent.shared.style_images.grain_overlay}")`,
  '--image-grain-background': `url("${siteContent.shared.style_images.grain_background}")`,
}))
</script>

<template>
  <main :style="styleVariables">
    <div class="grain-overlay" />
    <DesktopExperience :content="siteContent" />
    <MobileExperience :content="siteContent" />
  </main>
</template>
