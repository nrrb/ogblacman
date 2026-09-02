import { useEffect, useRef, useState } from 'react'

function canPlayBackgroundVideo() {
  if (typeof window === 'undefined') return false
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  return !reducedMotion && !window.navigator.connection?.saveData
}

export default function BackgroundVideo({
  media,
  videoId,
  children,
  loadingStrategy = 'eager',
  priority = false,
  loop = true,
  ...rest
}) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const [videoEnabled, setVideoEnabled] = useState(canPlayBackgroundVideo)
  const [isNearViewport, setIsNearViewport] = useState(
    () => loadingStrategy === 'eager' || priority,
  )
  const [isVisible, setIsVisible] = useState(
    () => loadingStrategy === 'eager' || priority,
  )
  const sourceList = media.sources.map((source) => source.src).join(',')
  const shouldAttachMedia = videoEnabled && isNearViewport
  const shouldAttachPoster = loadingStrategy === 'eager' || isNearViewport
  const posterStyle = shouldAttachPoster
    ? { backgroundImage: `url("${media.poster}")` }
    : undefined

  useEffect(() => {
    if (loadingStrategy === 'eager') {
      setIsNearViewport(true)
      return undefined
    }

    const container = containerRef.current
    if (!container || typeof window.IntersectionObserver !== 'function') {
      setIsNearViewport(true)
      setIsVisible(true)
      return undefined
    }

    const proximityObserver = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting),
      { rootMargin: '99% 0px', threshold: 0 },
    )
    proximityObserver.observe(container)
    return () => proximityObserver.disconnect()
  }, [loadingStrategy])

  useEffect(() => {
    const container = containerRef.current
    if (!container || typeof window.IntersectionObserver !== 'function') {
      setIsVisible(true)
      return undefined
    }

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.01 },
    )
    visibilityObserver.observe(container)
    return () => visibilityObserver.disconnect()
  }, [])

  useEffect(() => {
    const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const connection = window.navigator.connection
    const updatePreference = () => setVideoEnabled(canPlayBackgroundVideo())

    motionQuery?.addEventListener('change', updatePreference)
    connection?.addEventListener?.('change', updatePreference)

    return () => {
      motionQuery?.removeEventListener('change', updatePreference)
      connection?.removeEventListener?.('change', updatePreference)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    video.load()
    if (!shouldAttachMedia) video.pause()
  }, [shouldAttachMedia])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    const updatePlayback = () => {
      if (!shouldAttachMedia || !isVisible || document.hidden) {
        video.pause()
        return
      }
      video.play().catch(() => {})
    }

    video.muted = true
    video.playsInline = true
    updatePlayback()
    document.addEventListener('visibilitychange', updatePlayback)

    return () => {
      document.removeEventListener('visibilitychange', updatePlayback)
      video.pause()
    }
  }, [isVisible, shouldAttachMedia])

  return (
    <div
      ref={containerRef}
      {...rest}
      data-poster-url={media.poster}
      data-video-urls={sourceList}
      data-autoplay="true"
      data-loop={String(loop)}
      data-media-loaded={String(shouldAttachMedia)}
      data-media-visible={String(isVisible)}
    >
      <video
        id={videoId}
        ref={videoRef}
        autoPlay={shouldAttachMedia && isVisible}
        loop={loop}
        muted
        playsInline
        poster={shouldAttachPoster ? media.poster : undefined}
        preload={shouldAttachMedia ? 'auto' : 'none'}
        style={posterStyle}
        data-object-fit="cover"
      >
        {media.sources.map((source) => (
          <source
            key={source.src}
            src={shouldAttachMedia ? source.src : undefined}
            type={source.type}
          />
        ))}
      </video>
      {children}
    </div>
  )
}
