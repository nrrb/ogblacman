import { useEffect, useRef } from 'react'

export default function BackgroundVideo({ media, videoId, children, ...rest }) {
  const videoRef = useRef(null)
  const sourceList = media.sources.map((source) => source.src).join(',')
  const posterStyle = { backgroundImage: `url("${media.poster}")` }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    video.playsInline = true
    video.play().catch(() => {})
  }, [])

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
        autoPlay
        loop
        muted
        playsInline
        style={posterStyle}
        data-object-fit="cover"
      >
        {media.sources.map((source) => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
      </video>
      {children}
    </div>
  )
}
