<script setup>
import AppLink from './AppLink.vue'
import ResponsiveImage from './ResponsiveImage.vue'

defineProps({
  cta: { type: Object, required: true },
  arrow: { type: Object, required: true },
  wrapperClass: { type: String, required: true },
  texture: { type: Object, default: null },
  arrowFirst: { type: Boolean, default: false },
})
</script>

<template>
  <div :class="['text-cta', wrapperClass]">
    <ResponsiveImage v-if="arrowFirst" :image="arrow" class="text-cta__arrow" loading="lazy" />
    <ResponsiveImage v-if="texture" :image="texture" class="text-cta__texture" loading="lazy" />
    <AppLink :link="cta" class="text-cta__label" />
    <ResponsiveImage v-if="!arrowFirst" :image="arrow" class="text-cta__arrow" loading="lazy" />
  </div>
</template>
