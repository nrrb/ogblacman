import { useEffect, useRef, useState } from 'react'
import AppLink from './AppLink.jsx'
import ResponsiveImage from './ResponsiveImage.jsx'
import skinUrl from '../../popcorn-player.wsz?url'

const nativeWidth = 550
const nativeHeight = 232

export default function TopPickRelease({ release, variant = 'desktop' }) {
  const frame = useRef(null)
  const mount = useRef(null)
  const generation = useRef(0)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const frameElement = frame.current
    const mountElement = mount.current
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    let webamp = null

    function isActiveVariant() {
      return variant === (mediaQuery.matches ? 'mobile' : 'desktop')
    }

    function fitPlayer() {
      if (!frameElement || !mountElement) return
      const availableWidth = frameElement.clientWidth || nativeWidth
      const scale = Math.min(1, availableWidth / nativeWidth)
      mountElement.style.transform = `scale(${scale})`
      frameElement.style.height = `${nativeHeight * scale}px`
    }

    function blockWebampMenu(event) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }

    function releaseWebampWheel(event) {
      // Webamp converts wheel movement into volume changes and cancels native scrolling.
      // Stop the event before it reaches Webamp, but leave its default page-scroll action intact.
      event.stopImmediatePropagation()
    }

    function disposePlayer() {
      generation.current += 1
      if (webamp) {
        webamp.stop()
        webamp.dispose()
        webamp = null
      }
      mountElement?.replaceChildren()
      setStatus('idle')
    }

    async function renderPlayer() {
      if (!isActiveVariant() || webamp || !mountElement) return
      const currentGeneration = ++generation.current
      setStatus('loading')
      setErrorMessage('')

      try {
        const { default: Webamp } = await import('webamp')
        if (currentGeneration !== generation.current || !isActiveVariant() || !mountElement.isConnected) return
        if (!Webamp.browserIsSupported()) throw new Error('This browser does not support Webamp playback.')

        const instance = new Webamp({
          initialTracks: [{
            url: release.player.track_src,
            metaData: {
              artist: release.player.artist,
              title: release.player.title,
            },
            duration: release.player.duration,
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
        await instance.renderInto(mountElement)
        if (currentGeneration !== generation.current) {
          instance.stop()
          instance.dispose()
          return
        }

        for (const selector of ['#equalizer-button', '#playlist-button']) {
          const control = mountElement.querySelector(selector)
          control?.setAttribute('aria-disabled', 'true')
          control?.setAttribute('title', 'Disabled in this player')
        }
        setStatus('ready')
        window.requestAnimationFrame(fitPlayer)
      } catch (error) {
        if (currentGeneration !== generation.current) return
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'The player could not be loaded.')
      }
    }

    function handleBreakpointChange() {
      if (isActiveVariant()) renderPlayer()
      else disposePlayer()
    }

    mediaQuery.addEventListener('change', handleBreakpointChange)
    mountElement?.addEventListener('contextmenu', blockWebampMenu, { capture: true })
    mountElement?.addEventListener('wheel', releaseWebampWheel, { capture: true, passive: true })
    const resizeObserver = new ResizeObserver(fitPlayer)
    if (frameElement) resizeObserver.observe(frameElement)
    renderPlayer()

    return () => {
      mediaQuery.removeEventListener('change', handleBreakpointChange)
      mountElement?.removeEventListener('contextmenu', blockWebampMenu, { capture: true })
      mountElement?.removeEventListener('wheel', releaseWebampWheel, { capture: true })
      resizeObserver.disconnect()
      disposePlayer()
    }
  }, [release, variant])

  return (
    <div className="top-pick-release">
      <AppLink link={release.cta} className="release-spotlight__art-link">
        <ResponsiveImage
          image={release.cover}
          className="release-spotlight__art"
          loading="lazy"
          decoding="async"
        />
      </AppLink>

      <div className="release-spotlight__content">
        <div className="release-spotlight__details">
          <div className="release-spotlight__meta">
            <span>{release.release_label}</span>
            <span aria-hidden="true">•</span>
            <time dateTime={release.release_date_iso}>{release.release_date}</time>
          </div>
          <h3 className="release-spotlight__title">{release.player.title}</h3>
          <p className="release-spotlight__copy">{release.copy}</p>
          <AppLink link={release.cta} className="release-spotlight__cta">
            <span>{release.cta.label}</span>
            <span className="release-spotlight__arrow" aria-hidden="true">→</span>
          </AppLink>
        </div>

        <div
          className={`webamp-player webamp-player--${variant}`}
          aria-busy={status === 'loading'}
          aria-label={`${release.player.title} by ${release.player.artist}`}
        >
          <div ref={frame} className="webamp-player__frame">
            <div ref={mount} className="webamp-player__mount" />
          </div>
          {status === 'error' && <p className="webamp-player__error" role="alert">{errorMessage}</p>}
        </div>
      </div>
    </div>
  )
}
