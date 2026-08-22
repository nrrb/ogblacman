<script setup>
import { computed } from 'vue'

const props = defineProps({
  link: { type: Object, required: true },
})

const tag = computed(() => props.link.url ? 'a' : 'span')
const rel = computed(() => {
  if (props.link.rel) return props.link.rel
  return props.link.target === '_blank' ? 'noopener noreferrer' : undefined
})
</script>

<template>
  <component
    :is="tag"
    :href="link.url || undefined"
    :title="link.title || undefined"
    :target="link.target || undefined"
    :rel="rel"
  >
    <slot>{{ link.label }}</slot>
  </component>
</template>
