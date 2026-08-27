import { useEffect, useRef, useState } from 'react'

const fadeDuration = 650

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export default function TelephonePlayer({ video, audio, copy, title, variant = 'desktop' }) {
  const videoRef = useRef(null)
  const audioRef = useRef(null)
  const reverseFrame = useRef(null)
  const reverseTimestamp = useRef(null)
  const fadeFrame = useRef(null)
  const audioStarted = useRef(false)
  const [playbackState, setPlaybackState] = useState('idle')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const isPlaying = playbackState === 'playing' || playbackState === 'ended'

  function cancelReverse() {
    if (reverseFrame.current !== null) window.cancelAnimationFrame(reverseFrame.current)
    reverseFrame.current = null
    reverseTimestamp.current = null
  }

  function cancelFade() {
    if (fadeFrame.current !== null) window.cancelAnimationFrame(fadeFrame.current)
    fadeFrame.current = null
  }

  function fadeOutAudio() {
    const audioElement = audioRef.current
    if (!audioElement || audioElement.paused || audioElement.volume <= 0) return

    cancelFade()
    const startedAt = performance.now()
    const startingVolume = audioElement.volume
    const step = (timestamp) => {
      const progress = Math.min(1, (timestamp - startedAt) / fadeDuration)
      audioElement.volume = startingVolume * (1 - progress)
      if (progress >= 1) {
        audioElement.pause()
        audioElement.volume = 0
        fadeFrame.current = null
        return
      }
      fadeFrame.current = window.requestAnimationFrame(step)
    }
    fadeFrame.current = window.requestAnimationFrame(step)
  }

  function startAudioFadeIn() {
    const audioElement = audioRef.current
    if (!audioElement || audioStarted.current) return
    audioStarted.current = true
    cancelFade()
    audioElement.volume = 0
    const startedAt = performance.now()
    const playPromise = audioElement.play()
    playPromise?.catch(() => {
      setPlaybackState('error')
      setErrorMessage(copy.errorMessage)
    })
    const step = (timestamp) => {
      const progress = Math.min(1, (timestamp - startedAt) / fadeDuration)
      audioElement.volume = progress
      if (progress >= 1) {
        fadeFrame.current = null
        return
      }
      fadeFrame.current = window.requestAnimationFrame(step)
    }
    fadeFrame.current = window.requestAnimationFrame(step)
  }

  function finishReverse() {
    const videoElement = videoRef.current
    const audioElement = audioRef.current
    cancelReverse()
    if (videoElement) {
      videoElement.pause()
      videoElement.currentTime = 0
    }
    if (audioElement) {
      audioElement.pause()
      audioElement.currentTime = 0
      audioElement.volume = 0
    }
    setCurrentTime(0)
    setPlaybackState('idle')
  }

  function runReverse(timestamp) {
    const videoElement = videoRef.current
    if (!videoElement) return

    const previousTimestamp = reverseTimestamp.current ?? timestamp
    const elapsed = Math.min(.05, Math.max(0, (timestamp - previousTimestamp) / 1000))
    reverseTimestamp.current = timestamp
    videoElement.currentTime = Math.max(0, videoElement.currentTime - elapsed * 2)

    if (videoElement.currentTime <= .001) {
      finishReverse()
      return
    }
    reverseFrame.current = window.requestAnimationFrame(runReverse)
  }

  async function startForward() {
    const videoElement = videoRef.current
    const audioElement = audioRef.current
    if (!videoElement || !audioElement) return

    cancelReverse()
    cancelFade()
    setErrorMessage('')
    setPlaybackState('loading')
    videoElement.currentTime = 0
    audioElement.currentTime = 0
    audioElement.volume = 0
    audioStarted.current = false
    videoElement.playbackRate = 2

    try {
      const playPromise = videoElement.play()
      setPlaybackState('playing')
      playPromise?.catch(() => {
        videoElement.pause()
        setPlaybackState('error')
        setErrorMessage(copy.errorMessage)
      })
    } catch {
      videoElement.pause()
      audioElement.pause()
      audioElement.volume = 0
      setPlaybackState('error')
      setErrorMessage(copy.errorMessage)
    }
  }

  function startReverse() {
    const videoElement = videoRef.current
    if (!videoElement) return
    videoElement.pause()
    setPlaybackState('reversing')
    fadeOutAudio()
    reverseTimestamp.current = null
    reverseFrame.current = window.requestAnimationFrame(runReverse)
  }

  function togglePlayback() {
    if (playbackState === 'reversing') {
      startForward()
      return
    }
    if (playbackState === 'playing' || playbackState === 'ended') {
      startReverse()
      return
    }
    startForward()
  }

  useEffect(() => {
    const audioElement = audioRef.current
    if (!audioElement) return undefined
    const syncDuration = () => setDuration(audioElement.duration)
    audioElement.addEventListener('loadedmetadata', syncDuration)
    audioElement.addEventListener('durationchange', syncDuration)
    return () => {
      audioElement.removeEventListener('loadedmetadata', syncDuration)
      audioElement.removeEventListener('durationchange', syncDuration)
    }
  }, [])

  useEffect(() => () => {
    cancelReverse()
    cancelFade()
    videoRef.current?.pause()
    audioRef.current?.pause()
  }, [])

  return (
    <div
      className={`telephone-player telephone-player--${variant}`}
      data-state={playbackState}
      aria-busy={playbackState === 'loading'}
    >
      <audio
        ref={audioRef}
        src={audio.src}
        preload="metadata"
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onEnded={() => {
          if (playbackState === 'playing' || playbackState === 'ended') startReverse()
        }}
      />

      <button
        type="button"
        className="telephone-player__button telephone-player__button--prompted telephone-player__button--video"
        aria-label={isPlaying ? `Hang up ${title}` : `Pick up ${title}`}
        aria-pressed={isPlaying}
        disabled={playbackState === 'loading'}
        onClick={togglePlayback}
      >
        <video
          ref={videoRef}
          className="telephone-player__video"
          poster={video.poster}
          preload="metadata"
          muted
          playsInline
          onEnded={() => {
            videoRef.current.pause()
            if (!audioStarted.current) startAudioFadeIn()
            setPlaybackState('ended')
          }}
          onTimeUpdate={(event) => {
            const element = event.currentTarget
            if (element.duration && element.currentTime >= element.duration / 2) startAudioFadeIn()
          }}
        >
          {video.sources.map((source) => (
            <source key={source.src} src={source.src} type={source.type} />
          ))}
        </video>
        <span className="telephone-player__interaction-prompt" aria-hidden="true">
          <span className="telephone-player__prompt-line telephone-player__prompt-line--first">{copy.interactionPrompt.firstLine}</span>
          <span className="telephone-player__prompt-arrow">{copy.interactionPrompt.arrow}</span>
          <span className="telephone-player__prompt-line telephone-player__prompt-line--middle">{copy.interactionPrompt.middleLine}</span>
          <span className="telephone-player__prompt-line telephone-player__prompt-line--last">{copy.interactionPrompt.lastLine}</span>
        </span>
      </button>

      <div className="telephone-player__readout" aria-live="polite">
        <span>{playbackState === 'loading' ? copy.loadingStatus : isPlaying ? copy.playingStatus : copy.idleStatus}</span>
        <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
      </div>
      <progress
        className="telephone-player__progress"
        value={currentTime}
        max={duration || 1}
        aria-label={`${title} playback progress`}
      />
      {errorMessage && <p className="telephone-player__error" role="alert">{errorMessage}</p>}
    </div>
  )
}
