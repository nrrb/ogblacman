import { useEffect, useRef, useState } from 'react'

function canPlayBackgroundVideo() {
  if (typeof window === 'undefined') return false
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  return !reducedMotion && !window.navigator.connection?.saveData
}

export default function BackgroundVideo({ media, videoId, children, ...rest }) {
  const videoRef = useRef(null)
  const [videoEnabled, setVideoEnabled] = useState(canPlayBackgroundVideo)
  const sourceList = media.sources.map((source) => source.src).join(',')
  const posterStyle = { backgroundImage: `url("${media.poster}")` }

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

    const updatePlayback = () => {
      if (!videoEnabled || document.hidden) {
        video.pause()
        return
      }
      video.play().catch(() => {})
    }

    video.muted = true
    video.playsInline = true
    video.load()
    updatePlayback()
    document.addEventListener('visibilitychange', updatePlayback)

    return () => {
      document.removeEventListener('visibilitychange', updatePlayback)
      video.pause()
    }
  }, [videoEnabled])

  return (
    <div
      {...rest}
      data-poster-url={media.poster}
      data-video-urls={sourceList}
      data-autoplay="true"
      data-loop="true"
    >
      <video
        id={videoId}
        ref={videoRef}
        autoPlay={videoEnabled}
        loop
        muted
        playsInline
        poster={media.poster}
        preload={videoEnabled ? 'auto' : 'none'}
        style={posterStyle}
        data-object-fit="cover"
      >
        {media.sources.map((source) => (
          <source
            key={source.src}
            src={videoEnabled ? source.src : undefined}
            type={source.type}
          />
        ))}
      </video>
      {children}
    </div>
  )
}
