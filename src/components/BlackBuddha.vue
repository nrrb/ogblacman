<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ArrowUpRight, X } from '@lucide/vue'
import { useRoute } from 'vue-router'

import { useBlackBuddhaStore } from '@/stores/blackBuddha'
import { usePlayerStore } from '@/stores/player'

const INITIAL_PROMPT_DELAY_MS = 1_400
const INACTIVITY_DELAY_MS = 45_000
const SECTION_TRIGGER_DWELL_MS = 800

const route = useRoute()
const assistant = useBlackBuddhaStore()
const player = usePlayerStore()
const shouldAvoidBottomControls = ref(false)
const hasMounted = ref(false)
const visibleAvoidTargets = new Set<Element>()

let initialTimer = 0
let inactivityTimer = 0
let storyTimer = 0
let sectionObserver: IntersectionObserver | null = null
let isStoryVisible = false
let hasUserIntent = false

const placementClass = computed(() => ({
  'black-buddha--avoid-controls': shouldAvoidBottomControls.value,
  'black-buddha--open': assistant.isOpen,
}))

function scheduleInactivityPrompt() {
  window.clearTimeout(inactivityTimer)
  inactivityTimer = window.setTimeout(() => {
    assistant.trigger('inactivity')
  }, INACTIVITY_DELAY_MS)
}

function registerUserIntent() {
  hasUserIntent = true
  scheduleInactivityPrompt()
}

function handleRoute() {
  if (!hasMounted.value) return
  if (route.hash) window.clearTimeout(initialTimer)
  if (String(route.name ?? '').startsWith('release-')) {
    window.clearTimeout(initialTimer)
    assistant.trigger('release-open')
  }
  void observePageTargets()
  scheduleInactivityPrompt()
}

async function observePageTargets() {
  await nextTick()
  sectionObserver?.disconnect()
  window.clearTimeout(storyTimer)
  isStoryVisible = false
  visibleAvoidTargets.clear()
  shouldAvoidBottomControls.value = false
  for (const target of document.querySelectorAll('#story, [data-buddha-avoid]')) {
    sectionObserver?.observe(target)
  }
}

function handleAction() {
  assistant.dismiss()
}

watch(
  () => player.isPlaying,
  (isPlaying) => {
    if (hasMounted.value && isPlaying) assistant.trigger('first-song-play')
  },
)

watch(() => route.fullPath, handleRoute)

onMounted(() => {
  hasMounted.value = true
  handleRoute()

  if (!String(route.name ?? '').startsWith('release-') && !route.hash) {
    initialTimer = window.setTimeout(() => assistant.trigger('initial-visit'), INITIAL_PROMPT_DELAY_MS)
  }

  sectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.target.id === 'story') {
          isStoryVisible = entry.isIntersecting
          window.clearTimeout(storyTimer)
          if (entry.isIntersecting) {
            storyTimer = window.setTimeout(() => {
              if (isStoryVisible && (route.hash === '#story' || hasUserIntent)) {
                assistant.trigger('story-section')
              }
            }, SECTION_TRIGGER_DWELL_MS)
          }
        }
        if (entry.target.hasAttribute('data-buddha-avoid')) {
          if (entry.isIntersecting) visibleAvoidTargets.add(entry.target)
          else visibleAvoidTargets.delete(entry.target)
        }
      }
      shouldAvoidBottomControls.value = visibleAvoidTargets.size > 0
    },
    { threshold: 0.22 },
  )

  void observePageTargets()
  for (const eventName of ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const) {
    window.addEventListener(eventName, registerUserIntent, { passive: true })
  }
  window.addEventListener('scroll', scheduleInactivityPrompt, { passive: true })
  scheduleInactivityPrompt()
})

onBeforeUnmount(() => {
  window.clearTimeout(initialTimer)
  window.clearTimeout(inactivityTimer)
  window.clearTimeout(storyTimer)
  sectionObserver?.disconnect()
  for (const eventName of ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const) {
    window.removeEventListener(eventName, registerUserIntent)
  }
  window.removeEventListener('scroll', scheduleInactivityPrompt)
})
</script>

<template>
  <aside class="black-buddha" :class="placementClass" aria-label="Black Buddha assistant">
    <section
      v-if="assistant.isOpen && assistant.currentDialogue"
      id="black-buddha-dialogue"
      class="black-buddha__dialogue"
      role="status"
      aria-live="polite"
    >
      <header>
        <div>
          <small>Black Buddha // transmission</small>
          <strong>{{ assistant.currentDialogue.label }}</strong>
        </div>
        <button type="button" aria-label="Dismiss Black Buddha" title="Dismiss" @click="assistant.dismiss()">
          <X :size="17" aria-hidden="true" />
        </button>
      </header>
      <p>{{ assistant.currentDialogue.message }}</p>
      <RouterLink
        v-if="assistant.currentDialogue.action"
        :to="assistant.currentDialogue.action.href"
        @click="handleAction"
      >
        {{ assistant.currentDialogue.action.label }}
        <ArrowUpRight :size="15" aria-hidden="true" />
      </RouterLink>
    </section>

    <button
      class="black-buddha__character"
      type="button"
      :aria-expanded="assistant.isOpen"
      aria-controls="black-buddha-dialogue"
      :aria-label="assistant.isOpen ? 'Close Black Buddha' : 'Open Black Buddha'"
      :title="assistant.isOpen ? 'Black Buddha' : 'Open Black Buddha'"
      @click="assistant.isOpen ? assistant.dismiss() : assistant.open()"
    >
      <span class="black-buddha__pixel" aria-hidden="true">
        <i class="black-buddha__halo"></i>
        <i class="black-buddha__head"></i>
        <i class="black-buddha__eyes"></i>
        <i class="black-buddha__robe"></i>
      </span>
      <span class="black-buddha__badge" aria-hidden="true">BB</span>
    </button>
  </aside>
</template>
