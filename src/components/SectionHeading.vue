<script setup>
defineProps({
  heading: { type: Object, required: true },
  wrapperClass: { type: String, required: true },
  titleClass: { type: String, required: true },
  accentClass: { type: String, required: true },
  accentFirst: { type: Boolean, default: false },
  titleId: { type: String, default: undefined },
})
</script>

<template>
  <div :class="['display-heading', wrapperClass]">
    <template v-if="accentFirst">
      <div :class="['display-heading__accent', accentClass]">{{ heading.accent }}</div>
      <div :id="titleId" :class="['display-heading__title', titleClass, 'metallic-text']">{{ heading.title }}</div>
    </template>
    <template v-else>
      <div :id="titleId" :class="['display-heading__title', titleClass, 'metallic-text']">{{ heading.title }}</div>
      <div :class="['display-heading__accent', accentClass]">{{ heading.accent }}</div>
    </template>
  </div>
</template>
