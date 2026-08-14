<script setup lang="ts">
import BlackBuddha from '@/components/BlackBuddha.vue'
import OGAmp from '@/components/OGAmp.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import SiteHeader from '@/components/SiteHeader.vue'
</script>

<template>
  <a class="skip-link" href="#main-content">Skip to content</a>
  <SiteHeader />
  <main id="main-content">
    <RouterView />
  </main>
  <SiteFooter />
  <BlackBuddha />
  <OGAmp />
</template>
