import { useEffect, useRef, useState } from 'react'
import AppLink from './AppLink.jsx'
import ResponsiveImage from './ResponsiveImage.jsx'

const analyzerSize = 20
const analyzerBars = 10
const analyzerFrameInterval = 1000 / 30
const analyzerColorBands = [
  { start: 0, end: 7, color: '#62c96b' },
  { start: 7, end: 13, color: '#efbf04' },
  { start: 13, end: analyzerSize - 2, color: '#ff3b30' },
]

function createFrequencyRanges(binCount) {
  return Array.from({ length: analyzerBars }, (_, bar) => {
    const start = Math.floor((bar * binCount) / analyzerBars)
    const end = Math.max(start + 1, Math.floor(((bar + 1) * binCount) / analyzerBars))
    return { start, end }
  })
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export default function TopPickRelease({ release, variant = 'desktop' }) {
  const audio = useRef(null)
  const canvas = useRef(null)
  const canvasContext = useRef(null)
  const canvasContextElement = useRef(null)
  const player = useRef(null)
  const audioContext = useRef(null)
  const analyzer = useRef(null)
  const source = useRef(null)
  const animationFrame = useRef(null)
  const lastAnalyzerFrame = useRef(null)
  const frequencyData = useRef(null)
  const frequencyRanges = useRef(null)
  const barHeights = useRef(null)
  const [playbackState, setPlaybackState] = useState('idle')
  const [isPlayerVisible, setIsPlayerVisible] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(release.player.duration)
  const [errorMessage, setErrorMessage] = useState('')
  const isPlaying = playbackState === 'playing'

  function stopAnalyzer() {
    if (animationFrame.current !== null) {
      window.cancelAnimationFrame(animationFrame.current)
      animationFrame.current = null
    }
    lastAnalyzerFrame.current = null
  }

  function drawAnalyzer(timestamp) {
    const canvasElement = canvas.current
    const analyzerNode = analyzer.current
    if (!canvasElement || !analyzerNode) return

    animationFrame.current = window.requestAnimationFrame(drawAnalyzer)

    const previousFrame = lastAnalyzerFrame.current
    if (previousFrame !== null && timestamp - previousFrame < analyzerFrameInterval) return
    lastAnalyzerFrame.current = previousFrame === null
      ? timestamp
      : timestamp - ((timestamp - previousFrame) % analyzerFrameInterval)

    if (canvasContextElement.current !== canvasElement) {
      canvasContext.current = canvasElement.getContext('2d')
      canvasContextElement.current = canvasElement
    }

    const context = canvasContext.current
    const values = frequencyData.current
    const ranges = frequencyRanges.current
    const heights = barHeights.current
    if (!context || !values || !ranges || !heights) return

    analyzerNode.getByteFrequencyData(values)

    context.clearRect(0, 0, analyzerSize, analyzerSize)

    for (let bar = 0; bar < analyzerBars; bar += 1) {
      const { start, end } = ranges[bar]
      let total = 0
      for (let index = start; index < end; index += 1) total += values[index]
      const average = total / (end - start)
      heights[bar] = Math.max(1, Math.round((average / 255) * (analyzerSize - 2)))
    }

    for (const band of analyzerColorBands) {
      context.fillStyle = band.color
      for (let bar = 0; bar < analyzerBars; bar += 1) {
        const segmentTop = Math.min(heights[bar], band.end)
        if (segmentTop > band.start) {
          context.fillRect(
            bar * 2,
            analyzerSize - segmentTop,
            1,
            segmentTop - band.start,
          )
        }
      }
    }
  }

  function suspendAudioContext() {
    const activeContext = audioContext.current
    if (activeContext?.state === 'running') void activeContext.suspend().catch(() => {})
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
      frequencyData.current = new Uint8Array(nextAnalyzer.frequencyBinCount)
      frequencyRanges.current = createFrequencyRanges(nextAnalyzer.frequencyBinCount)
      barHeights.current = new Uint8Array(analyzerBars)
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
      suspendAudioContext()
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
    suspendAudioContext()
  }

  function togglePlayback() {
    if (isPlaying) stopPlayback()
    else startPlayback()
  }

  useEffect(() => {
    if (!isPlaying || !isPlayerVisible) {
      stopAnalyzer()
      return undefined
    }

    animationFrame.current = window.requestAnimationFrame(drawAnalyzer)
    return stopAnalyzer
  }, [isPlaying, isPlayerVisible])

  useEffect(() => {
    const playerElement = player.current
    if (!playerElement || !('IntersectionObserver' in window)) return undefined

    const observer = new IntersectionObserver(([entry]) => {
      setIsPlayerVisible(entry.isIntersecting)
    })
    observer.observe(playerElement)
    return () => observer.disconnect()
  }, [])

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
          <div className="release-spotlight__intro">
            <div className="release-spotlight__text">
              <h3 className="release-spotlight__title">{release.player.title}</h3>
              <p className="release-spotlight__copy">{release.copy}</p>
              <ResponsiveImage
                image={release.editorial_image}
                className="release-spotlight__initial"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
              <AppLink link={release.cta} className="release-spotlight__cta">
                <span>{release.cta.label}</span>
                <span className="release-spotlight__arrow" aria-hidden="true">→</span>
              </AppLink>
            </div>
          </div>
        </div>

        <div
          ref={player}
          className={`telephone-player telephone-player--${variant}`}
          data-state={playbackState}
          data-analyzer-active={isPlaying && isPlayerVisible}
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
              suspendAudioContext()
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
                loading="eager"
                fetchPriority="high"
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
