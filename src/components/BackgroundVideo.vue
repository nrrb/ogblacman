<script setup>
import { computed, onMounted, ref, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })
const props = defineProps({
  media: { type: Object, required: true },
  videoId: { type: String, default: undefined },
})
const attrs = useAttrs()
const video = ref(null)
const sourceList = computed(() => props.media.sources.map(source => source.src).join(','))
const posterStyle = computed(() => ({ backgroundImage: `url("${props.media.poster}")` }))

onMounted(() => {
  if (!video.value) return
  video.value.muted = true
  video.value.playsInline = true
  video.value.play().catch(() => {})
})
</script>

<template>
  <div
    v-bind="attrs"
    :data-poster-url="media.poster"
    :data-video-urls="sourceList"
    data-autoplay="true"
    data-loop="true"
  >
    <video
      :id="videoId"
      ref="video"
      autoplay
      loop
      muted
      playsinline
      :style="posterStyle"
      data-object-fit="cover"
    >
      <source v-for="source in media.sources" :key="source.src" :src="source.src" :type="source.type" />
    </video>
    <slot />
  </div>
</template>
