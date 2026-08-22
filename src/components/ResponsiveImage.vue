<script setup>
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })
const props = defineProps({ image: { type: Object, required: true } })
const attrs = useAttrs()
const srcset = computed(() => props.image.sources?.map(source => `${source.src} ${source.width}w`).join(', '))
</script>

<template>
  <img
    v-bind="attrs"
    :src="image.src"
    :srcset="srcset || undefined"
    :sizes="image.sizes || undefined"
    :alt="image.alt"
  />
</template>
