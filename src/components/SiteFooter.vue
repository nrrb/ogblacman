<script setup lang="ts">
import { artist } from '@/content/site'
</script>

<template>
  <footer class="site-footer">
    <div class="container site-footer__inner">
      <strong>{{ artist.name }}</strong>
      <p>&copy; {{ new Date().getFullYear() }} {{ artist.name }}</p>
      <RouterLink to="/privacy">Privacy</RouterLink>
    </div>
  </footer>
</template>
