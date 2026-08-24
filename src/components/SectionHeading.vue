<script setup>
defineProps({
  heading: { type: Object, required: true },
  wrapperClass: { type: String, required: true },
  titleClass: { type: String, required: true },
  titleId: { type: String, default: undefined },
})
</script>

<template>
  <div :class="['display-heading', wrapperClass]">
    <div
      :id="titleId"
      :class="['display-heading__title', titleClass, 'outlined-heading']"
    >
      {{ heading.title }}
    </div>
  </div>
</template>
