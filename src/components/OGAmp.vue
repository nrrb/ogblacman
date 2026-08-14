<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type Webamp from 'webamp'

import { tracks } from '@/content/tracks'
import { usePlayerStore } from '@/stores/player'

const player = usePlayerStore()
const mount = ref<HTMLElement | null>(null)
const isLoading = ref(true)
const loadError = ref('')

let webamp: Webamp | null = null
let unsubscribeClose: (() => void) | null = null
let unsubscribeWillClose: (() => void) | null = null
let unsubscribeStartupPlayback: (() => void) | null = null

const lockedControlSelector =
  '#close, #minimize, #shade, #option, #about, #playlist-button, #playlist-close-button, #playlist-shade-button'
const playbackControlSelector =
  '#play, #previous, #next, .playlist-play-button, .playlist-previous-button, .playlist-next-button'

function preventLockedControl(event: Event) {
  const target = event.target instanceof Element ? event.target.closest(lockedControlSelector) : null
  if (!target || !mount.value?.contains(target)) return
  event.preventDefault()
  event.stopImmediatePropagation()
}

function preventWebampContextMenu(event: Event) {
  if (!mount.value?.contains(event.target as Node)) return
  event.preventDefault()
  event.stopImmediatePropagation()
}

function preventWindowShade(event: Event) {
  const target = event.target instanceof Element ? event.target.closest('#title-bar, .playlist-top') : null
  if (!target || !mount.value?.contains(target)) return
  event.preventDefault()
  event.stopImmediatePropagation()
}

function allowWebampPlayback(event: Event) {
  const target = event.target instanceof Element ? event.target.closest(playbackControlSelector) : null
  if (!target || !mount.value?.contains(target)) return
  player.allowPlayback()
}

function allowPlaylistPlayback(event: Event) {
  const target = event.target instanceof Element ? event.target.closest('.track-cell') : null
  if (!target || !mount.value?.contains(target)) return
  player.allowPlayback()
}

onMounted(async () => {
  if (!mount.value) return
  mount.value.addEventListener('click', preventLockedControl, true)
  mount.value.addEventListener('auxclick', preventLockedControl, true)
  mount.value.addEventListener('contextmenu', preventWebampContextMenu, true)
  mount.value.addEventListener('dblclick', preventWindowShade, true)
  mount.value.addEventListener('click', allowWebampPlayback, true)
  mount.value.addEventListener('dblclick', allowPlaylistPlayback, true)

  try {
    const { default: WebampPlayer } = await import('webamp')
    if (!WebampPlayer.browserIsSupported()) {
      throw new Error('This browser does not support the Web Audio features OGAmp needs.')
    }

    webamp = new WebampPlayer({
      initialTracks: tracks.map((track) => ({
        url: track.audioUrl,
        defaultName: `${track.artist} - ${track.title}`,
        metaData: {
          artist: track.artist,
          title: track.title,
        },
        duration: track.durationSeconds,
      })),
      windowLayout: {
        main: { position: { top: 0, left: 0 } },
        playlist: {
          position: { top: 116, left: 0 },
          size: { extraHeight: 1, extraWidth: 0 },
        },
      },
      enableMediaSession: true,
      zIndex: 205,
    })

    unsubscribeWillClose = webamp.onWillClose((cancel) => cancel())
    unsubscribeClose = webamp.onClose(() => {
      webamp?.reopen()
    })
    unsubscribeStartupPlayback = webamp.__onStateChange(() => {
      if (webamp?.getPlayerMediaStatus() === 'PLAYING') webamp.pause()
    })
    webamp.stop()
    await webamp.renderInto(mount.value)
    webamp.stop()
    player.attach(webamp)
    unsubscribeStartupPlayback()
    unsubscribeStartupPlayback = null

    const renderedPlayer = mount.value.querySelector('#webamp')
    renderedPlayer?.setAttribute('role', 'application')
    renderedPlayer?.setAttribute('aria-label', 'OGAmp Webamp interface')
    for (const selector of lockedControlSelector.split(', ')) {
      const control = mount.value.querySelector(selector)
      control?.setAttribute('aria-disabled', 'true')
      control?.setAttribute('title', selector === '#about' ? 'OGAmp' : 'OGAmp stays open')
      if (control instanceof HTMLAnchorElement) control.removeAttribute('href')
    }
  } catch (error) {
    unsubscribeStartupPlayback?.()
    unsubscribeStartupPlayback = null
    loadError.value = error instanceof Error ? error.message : 'OGAmp could not be loaded.'
    player.fail(loadError.value)
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  mount.value?.removeEventListener('click', preventLockedControl, true)
  mount.value?.removeEventListener('auxclick', preventLockedControl, true)
  mount.value?.removeEventListener('contextmenu', preventWebampContextMenu, true)
  mount.value?.removeEventListener('dblclick', preventWindowShade, true)
  mount.value?.removeEventListener('click', allowWebampPlayback, true)
  mount.value?.removeEventListener('dblclick', allowPlaylistPlayback, true)
  unsubscribeWillClose?.()
  unsubscribeClose?.()
  unsubscribeStartupPlayback?.()
  if (webamp) {
    player.detach(webamp)
    webamp.dispose()
  }
})
</script>

<template>
  <aside class="ogamp" aria-label="OGAmp music player" :data-player-status="player.status">
    <div class="ogamp__stage">
      <div ref="mount" class="ogamp__mount" :aria-busy="isLoading"></div>
      <p v-if="isLoading" class="ogamp__notice">Loading OGAmp...</p>
      <p v-else-if="loadError" class="ogamp__notice ogamp__notice--error" role="alert">{{ loadError }}</p>
    </div>
  </aside>
</template>
