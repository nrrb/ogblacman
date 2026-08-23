<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  slideCount: { type: Number, required: true },
  dotLabel: { type: String, required: true },
  previousLabel: { type: String, required: true },
  nextLabel: { type: String, required: true },
})

const active = ref(0)
let touchX = 0
let touchY = 0
let wheelLocked = false
let wheelTimer

function show(index) {
  active.value = (index + props.slideCount) % props.slideCount
}

function slideAttributes(index) {
  const visible = index === active.value
  return {
    'aria-hidden': String(!visible),
    inert: visible ? undefined : '',
    style: { transform: `translate3d(${-active.value * 100}%, 0, 0)` },
  }
}

function label(index) {
  return props.dotLabel
    .replace('{current}', String(index + 1))
    .replace('{total}', String(props.slideCount))
}

function touchStart(event) {
  touchX = event.touches[0].clientX
  touchY = event.touches[0].clientY
}

function touchEnd(event) {
  const dx = event.changedTouches[0].clientX - touchX
  const dy = event.changedTouches[0].clientY - touchY
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return
  if (Math.abs(dy) >= Math.abs(dx)) show(active.value + (dy < 0 ? 1 : -1))
  else show(active.value + (dx < 0 ? 1 : -1))
}

function wheel(event) {
  if (wheelLocked || Math.abs(event.deltaY) < 18) return
  event.preventDefault()
  wheelLocked = true
  show(active.value + (event.deltaY > 0 ? 1 : -1))
  wheelTimer = window.setTimeout(() => { wheelLocked = false }, 320)
}

function keydown(event) {
  if (window.innerWidth > 767) return
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') show(active.value + 1)
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') show(active.value - 1)
}

onMounted(() => document.addEventListener('keydown', keydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', keydown)
  window.clearTimeout(wheelTimer)
})
</script>

<template>
  <div
    class="site site--mobile mobile-slider"
    @touchstart.passive="touchStart"
    @touchend.passive="touchEnd"
    @wheel="wheel"
  >
    <div class="mobile-slider__track">
      <slot :slide-attributes="slideAttributes" />
    </div>
    <div class="slider-arrow slider-arrow--previous" role="button" tabindex="0" :aria-label="previousLabel" @click="show(active - 1)" />
    <div class="slider-arrow slider-arrow--next" role="button" tabindex="0" :aria-label="nextLabel" @click="show(active + 1)" />
    <div class="slider-nav">
      <div
        v-for="index in slideCount"
        :key="index"
        :class="['slider-dot', { 'is-active': index - 1 === active }]"
        role="button"
        tabindex="0"
        :aria-label="label(index - 1)"
        :aria-current="index - 1 === active ? 'true' : 'false'"
        @click="show(index - 1)"
        @keydown.enter.prevent="show(index - 1)"
        @keydown.space.prevent="show(index - 1)"
      />
    </div>
  </div>
</template>
