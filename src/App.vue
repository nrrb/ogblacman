<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import referenceMarkup from './reference-body.html?raw'

const root = ref(null)
const cleanup = []

function listen(target, event, handler, options) {
  target.addEventListener(event, handler, options)
  cleanup.push(() => target.removeEventListener(event, handler, options))
}

onMounted(() => {
  const host = root.value
  const marquee = host.querySelector('.js-logo-marquee')
  if (marquee) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        marquee.classList.add('is-marquee-active')
        observer.disconnect()
      }
    })
    observer.observe(marquee)
    cleanup.push(() => observer.disconnect())
  }
  const mobile = host.querySelector('.js-mobile-slider')
  const mask = mobile?.querySelector('.js-slider-track')
  const slides = [...(mask?.querySelectorAll('.js-mobile-slide') ?? [])]
  const nav = mobile?.querySelector('.js-slider-nav')
  const previous = mobile?.querySelector('.js-slider-previous')
  const next = mobile?.querySelector('.js-slider-next')
  let active = 0
  let touchX = 0
  let touchY = 0
  let wheelLocked = false

  const dots = slides.map((_, index) => {
    const dot = document.createElement('div')
    dot.className = 'slider-dot'
    dot.setAttribute('role', 'button')
    dot.setAttribute('tabindex', '0')
    dot.setAttribute('aria-label', `Show slide ${index + 1} of ${slides.length}`)
    listen(dot, 'click', () => show(index))
    listen(dot, 'keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') show(index)
    })
    nav?.append(dot)
    return dot
  })

  function show(index) {
    active = (index + slides.length) % slides.length
    slides.forEach((slide, slideIndex) => {
      slide.style.transform = `translate3d(${-active * 100}%, 0, 0)`
      const visible = slideIndex === active
      slide.setAttribute('aria-hidden', String(!visible))
      slide.toggleAttribute('inert', !visible)
    })
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === active)
      dot.setAttribute('aria-current', dotIndex === active ? 'true' : 'false')
    })
  }

  if (slides.length) {
    show(0)
    if (previous) listen(previous, 'click', () => show(active - 1))
    if (next) listen(next, 'click', () => show(active + 1))
    listen(mobile, 'touchstart', event => {
      touchX = event.touches[0].clientX
      touchY = event.touches[0].clientY
    }, { passive: true })
    listen(mobile, 'touchend', event => {
      const dx = event.changedTouches[0].clientX - touchX
      const dy = event.changedTouches[0].clientY - touchY
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return
      if (Math.abs(dy) >= Math.abs(dx)) show(active + (dy < 0 ? 1 : -1))
      else show(active + (dx < 0 ? 1 : -1))
    }, { passive: true })
    listen(mobile, 'wheel', event => {
      if (wheelLocked || Math.abs(event.deltaY) < 18) return
      event.preventDefault()
      wheelLocked = true
      show(active + (event.deltaY > 0 ? 1 : -1))
      window.setTimeout(() => { wheelLocked = false }, 320)
    }, { passive: false })
    listen(document, 'keydown', event => {
      if (window.innerWidth > 479) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') show(active + 1)
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') show(active - 1)
    })
  }

  host.querySelectorAll('.js-contact-form form').forEach(form => {
    listen(form, 'submit', event => {
      event.preventDefault()
      if (!form.reportValidity()) return
      form.style.display = 'none'
      const success = form.parentElement?.querySelector('.js-form-success')
      if (success) success.style.display = 'block'
    })
  })

  host.querySelectorAll('video').forEach(video => {
    video.muted = true
    video.playsInline = true
    video.play().catch(() => {})
  })
})

onBeforeUnmount(() => cleanup.splice(0).forEach(remove => remove()))
</script>

<template>
  <main ref="root" v-html="referenceMarkup" />
</template>
