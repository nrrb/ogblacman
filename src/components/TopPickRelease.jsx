import { useEffect, useRef, useState } from 'react'
import AppLink from './AppLink.jsx'
import ResponsiveImage from './ResponsiveImage.jsx'

const analyzerSize = 20
const analyzerBars = 10

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export default function TopPickRelease({ release, variant = 'desktop' }) {
  const audio = useRef(null)
  const canvas = useRef(null)
  const audioContext = useRef(null)
  const analyzer = useRef(null)
  const source = useRef(null)
  const animationFrame = useRef(null)
  const frequencyData = useRef(null)
  const [playbackState, setPlaybackState] = useState('idle')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(release.player.duration)
  const [errorMessage, setErrorMessage] = useState('')
  const isPlaying = playbackState === 'playing'

  function stopAnalyzer() {
    if (animationFrame.current !== null) {
      window.cancelAnimationFrame(animationFrame.current)
      animationFrame.current = null
    }
  }

  function drawAnalyzer() {
    const canvasElement = canvas.current
    const analyzerNode = analyzer.current
    if (!canvasElement || !analyzerNode) return

    const context = canvasElement.getContext('2d')
    const values = frequencyData.current
      || new Uint8Array(analyzerNode.frequencyBinCount)
    frequencyData.current = values
    analyzerNode.getByteFrequencyData(values)

    context.fillStyle = '#050505'
    context.fillRect(0, 0, analyzerSize, analyzerSize)

    for (let bar = 0; bar < analyzerBars; bar += 1) {
      const start = Math.floor((bar * values.length) / analyzerBars)
      const end = Math.max(start + 1, Math.floor(((bar + 1) * values.length) / analyzerBars))
      let total = 0
      for (let index = start; index < end; index += 1) total += values[index]
      const average = total / (end - start)
      const barHeight = Math.max(1, Math.round((average / 255) * (analyzerSize - 2)))

      for (let pixel = 0; pixel < barHeight; pixel += 1) {
        if (pixel >= 13) context.fillStyle = '#ff3b30'
        else if (pixel >= 7) context.fillStyle = '#efbf04'
        else context.fillStyle = '#62c96b'
        context.fillRect(bar * 2, analyzerSize - 1 - pixel, 1, 1)
      }
    }

    animationFrame.current = window.requestAnimationFrame(drawAnalyzer)
  }

  async function prepareAnalyzer() {
    const audioElement = audio.current
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!audioElement || !AudioContext) return

    if (!audioContext.current) {
      const nextContext = new AudioContext()
      const nextAnalyzer = nextContext.createAnalyser()
      nextAnalyzer.fftSize = 64
      nextAnalyzer.smoothingTimeConstant = 0.78
      const nextSource = nextContext.createMediaElementSource(audioElement)
      nextSource.connect(nextAnalyzer)
      nextAnalyzer.connect(nextContext.destination)
      audioContext.current = nextContext
      analyzer.current = nextAnalyzer
      source.current = nextSource
    }

    if (audioContext.current.state === 'suspended') await audioContext.current.resume()
  }

  async function startPlayback() {
    const audioElement = audio.current
    if (!audioElement) return
    setErrorMessage('')
    setPlaybackState('loading')

    try {
      await prepareAnalyzer()
      await audioElement.play()
    } catch (error) {
      setPlaybackState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Telephone could not be played.')
    }
  }

  function stopPlayback() {
    const audioElement = audio.current
    if (!audioElement) return
    audioElement.pause()
    audioElement.currentTime = 0
    setCurrentTime(0)
    setPlaybackState('idle')
    stopAnalyzer()
  }

  function togglePlayback() {
    if (isPlaying) stopPlayback()
    else startPlayback()
  }

  useEffect(() => {
    if (!isPlaying) {
      stopAnalyzer()
      return undefined
    }

    animationFrame.current = window.requestAnimationFrame(drawAnalyzer)
    return stopAnalyzer
  }, [isPlaying])

  useEffect(() => () => {
    stopAnalyzer()
    audio.current?.pause()
    source.current?.disconnect()
    analyzer.current?.disconnect()
    audioContext.current?.close()
  }, [])

  return (
    <div className="top-pick-release">
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
          className={`telephone-player telephone-player--${variant}`}
          data-state={playbackState}
          aria-busy={playbackState === 'loading'}
        >
          <audio
            ref={audio}
            src={release.player.track_src}
            preload="metadata"
            onPlay={() => setPlaybackState('playing')}
            onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
            onDurationChange={(event) => setDuration(event.currentTarget.duration)}
            onEnded={stopPlayback}
            onError={() => {
              setPlaybackState('error')
              setErrorMessage('Telephone could not be played.')
            }}
          />

          <button
            type="button"
            className="telephone-player__button"
            aria-label={isPlaying ? release.player.stop_label : release.player.start_label}
            aria-pressed={isPlaying}
            disabled={playbackState === 'loading'}
            onClick={togglePlayback}
          >
            <span className={`telephone-player__phone telephone-player__phone--${isPlaying ? 'active' : 'idle'}`}>
              <ResponsiveImage
                image={isPlaying ? release.player.active_image : release.player.idle_image}
                className="telephone-player__image"
                decoding="async"
              />
              {isPlaying && (
                <canvas
                  ref={canvas}
                  className="telephone-player__analyzer"
                  width={analyzerSize}
                  height={analyzerSize}
                  aria-hidden="true"
                />
              )}
            </span>
          </button>

          <div className="telephone-player__readout" aria-live="polite">
            <span>{isPlaying ? 'LINE OPEN' : playbackState === 'loading' ? 'CONNECTING' : 'LIFT TO LISTEN'}</span>
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
          <progress
            className="telephone-player__progress"
            value={currentTime}
            max={duration || release.player.duration}
            aria-label={`${release.player.title} playback progress`}
          />
          {errorMessage && <p className="telephone-player__error" role="alert">{errorMessage}</p>}
        </div>
      </div>
    </div>
  )
}
