<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import skinUrl from '../../popcorn-player.wsz?url'

const props = defineProps({
  release: { type: Object, required: true },
  variant: { type: String, default: 'desktop' },
})

const frame = ref(null)
const mount = ref(null)
const status = ref('idle')
const errorMessage = ref('')
let webamp = null
let mediaQuery = null
let resizeObserver = null
let generation = 0

const nativeWidth = 550
const nativeHeight = 232

function isActiveVariant() {
  if (!mediaQuery) return props.variant === 'desktop'
  return props.variant === (mediaQuery.matches ? 'mobile' : 'desktop')
}

function fitPlayer() {
  if (!frame.value || !mount.value) return
  const availableWidth = frame.value.clientWidth || nativeWidth
  const scale = Math.min(1, availableWidth / nativeWidth)
  mount.value.style.transform = `scale(${scale})`
  frame.value.style.height = `${nativeHeight * scale}px`
}

function blockWebampMenu(event) {
  event.preventDefault()
  event.stopImmediatePropagation()
}

function disposePlayer() {
  generation += 1
  if (webamp) {
    webamp.stop()
    webamp.dispose()
    webamp = null
  }
  if (mount.value) mount.value.replaceChildren()
  status.value = 'idle'
}

async function renderPlayer() {
  if (!isActiveVariant() || webamp || !mount.value) return
  const currentGeneration = ++generation
  status.value = 'loading'
  errorMessage.value = ''

  try {
    const { default: Webamp } = await import('webamp')
    if (currentGeneration !== generation || !isActiveVariant() || !mount.value) return
    if (!Webamp.browserIsSupported()) throw new Error('This browser does not support Webamp playback.')

    const instance = new Webamp({
      initialTracks: [{
        url: props.release.player.track_src,
        metaData: {
          artist: props.release.player.artist,
          title: props.release.player.title,
        },
        duration: props.release.player.duration,
      }],
      initialSkin: { url: skinUrl },
      enableDoubleSizeMode: true,
      enableHotkeys: false,
      windowLayout: {
        main: {
          position: { top: 0, left: 0 },
          closed: false,
        },
      },
      zIndex: 1,
    })
    webamp = instance
    await instance.renderInto(mount.value)
    if (currentGeneration !== generation) {
      instance.stop()
      instance.dispose()
      return
    }

    for (const selector of ['#equalizer-button', '#playlist-button']) {
      const control = mount.value.querySelector(selector)
      control?.setAttribute('aria-disabled', 'true')
      control?.setAttribute('title', 'Disabled in this player')
    }
    status.value = 'ready'
    await nextTick()
    fitPlayer()
  } catch (error) {
    if (currentGeneration !== generation) return
    status.value = 'error'
    errorMessage.value = error instanceof Error ? error.message : 'The player could not be loaded.'
  }
}

function handleBreakpointChange() {
  if (isActiveVariant()) renderPlayer()
  else disposePlayer()
}

onMounted(() => {
  mediaQuery = window.matchMedia('(max-width: 767px)')
  mediaQuery.addEventListener('change', handleBreakpointChange)
  mount.value?.addEventListener('contextmenu', blockWebampMenu, { capture: true })
  resizeObserver = new ResizeObserver(fitPlayer)
  if (frame.value) resizeObserver.observe(frame.value)
  renderPlayer()
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', handleBreakpointChange)
  mount.value?.removeEventListener('contextmenu', blockWebampMenu, { capture: true })
  resizeObserver?.disconnect()
  disposePlayer()
})
</script>

<template>
  <div class="top-pick-release">
    <div
      class="webamp-player"
      :class="`webamp-player--${variant}`"
      :aria-busy="status === 'loading'"
      :aria-label="`${release.player.title} by ${release.player.artist}`"
    >
      <div ref="frame" class="webamp-player__frame">
        <div ref="mount" class="webamp-player__mount" />
      </div>
      <p v-if="status === 'error'" class="webamp-player__error" role="alert">{{ errorMessage }}</p>
    </div>
  </div>
</template>
