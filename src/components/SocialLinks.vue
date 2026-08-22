<script setup>
import AppLink from './AppLink.vue'
import ResponsiveImage from './ResponsiveImage.vue'

defineProps({ links: { type: Array, required: true } })
</script>

<template>
  <div class="social-links">
    <AppLink v-for="item in links" :key="item.id" :link="item" class="social-link">
      <ResponsiveImage :image="item.icon" class="social-icon" loading="lazy" />
    </AppLink>
  </div>
</template>
