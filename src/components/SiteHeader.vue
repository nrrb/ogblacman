<script setup lang="ts">
import { ref } from 'vue'
import { Menu, X } from '@lucide/vue'

import { artist, primaryNavigation } from '@/content/site'

const menuOpen = ref(false)

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <RouterLink class="wordmark" to="/" aria-label="OG Blacman home" @click="closeMenu">
        <span class="wordmark__og">OG</span>
        <span>{{ artist.name.replace('OG ', '') }}</span>
      </RouterLink>

      <button
        class="icon-button nav-toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="primary-navigation"
        :aria-label="menuOpen ? 'Close navigation' : 'Open navigation'"
        @click="menuOpen = !menuOpen"
      >
        <X v-if="menuOpen" :size="22" aria-hidden="true" />
        <Menu v-else :size="22" aria-hidden="true" />
      </button>

      <nav id="primary-navigation" class="primary-nav" :class="{ 'primary-nav--open': menuOpen }">
        <a v-for="item in primaryNavigation" :key="item.label" :href="item.href" @click="closeMenu">
          {{ item.label }}
        </a>
      </nav>
    </div>
  </header>
</template>
