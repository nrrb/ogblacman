<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  slideCount: { type: Number, required: true },
  continuous: { type: Boolean, required: true },
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
  active.value = Math.min(Math.max(index, 0), props.slideCount - 1)
}

function slideAttributes(index) {
  if (props.continuous) return {}
  const visible = index === active.value
  return {
    'aria-hidden': String(!visible),
    inert: visible ? undefined : '',
    style: { transform: `translate3d(0, ${-active.value * 100}%, 0)` },
  }
}

const sliderClass = computed(() => [
  'site',
  'site--mobile',
  'mobile-slider',
  props.continuous ? 'mobile-slider--continuous' : 'mobile-slider--discrete',
])

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
  if (props.continuous) return
  const dx = event.changedTouches[0].clientX - touchX
  const dy = event.changedTouches[0].clientY - touchY
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return
  if (Math.abs(dy) < Math.abs(dx)) return
  show(active.value + (dy < 0 ? 1 : -1))
}

function wheel(event) {
  if (props.continuous || wheelLocked || Math.abs(event.deltaY) < 18) return
  event.preventDefault()
  wheelLocked = true
  show(active.value + (event.deltaY > 0 ? 1 : -1))
  wheelTimer = window.setTimeout(() => { wheelLocked = false }, 320)
}

function keydown(event) {
  if (props.continuous || window.innerWidth > 767) return
  if (event.key === 'ArrowDown') show(active.value + 1)
  if (event.key === 'ArrowUp') show(active.value - 1)
}

onMounted(() => {
  document.addEventListener('keydown', keydown)
  if (props.continuous) document.documentElement.classList.add('mobile-continuous-scroll')
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', keydown)
  document.documentElement.classList.remove('mobile-continuous-scroll')
  window.clearTimeout(wheelTimer)
})
</script>

<template>
  <div
    :class="sliderClass"
    @touchstart.passive="touchStart"
    @touchend.passive="touchEnd"
    @wheel="wheel"
  >
    <div class="mobile-slider__track">
      <slot :slide-attributes="slideAttributes" />
    </div>
    <div v-if="!continuous" class="slider-arrow slider-arrow--previous" role="button" tabindex="0" :aria-label="previousLabel" @click="show(active - 1)" />
    <div v-if="!continuous" class="slider-arrow slider-arrow--next" role="button" tabindex="0" :aria-label="nextLabel" @click="show(active + 1)" />
    <div v-if="!continuous" class="slider-nav">
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
