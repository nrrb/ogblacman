<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AppLink from './AppLink.vue'
import ResponsiveImage from './ResponsiveImage.vue'

defineProps({ items: { type: Array, required: true } })
const track = ref(null)
let observer

onMounted(() => {
  if (!track.value) return
  observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      track.value?.classList.add('is-marquee-active')
      observer?.disconnect()
    }
  })
  observer.observe(track.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div class="logo-marquee">
    <section class="logo-marquee__section">
      <div class="logo-marquee__padding logo-marquee__padding--flush">
        <div class="logo-marquee__container">
          <div class="logo-marquee__spacing logo-marquee__spacing--large">
            <div ref="track" class="logo-marquee__track">
              <div v-for="item in items" :key="item.id" class="logo-marquee__item">
                <AppLink v-if="item.link?.url" :link="item.link" class="logo-marquee__link">
                  <ResponsiveImage :image="item.image" class="logo-marquee__image" loading="lazy" />
                </AppLink>
                <ResponsiveImage v-else :image="item.image" class="logo-marquee__image" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
