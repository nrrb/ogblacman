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

function formatReleaseDate(value) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`)).toUpperCase()
}

export default function TopPickRelease({ section, variant = 'desktop' }) {
  const { release, playerCopy, playerImages } = section
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
  const [duration, setDuration] = useState(0)
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
    } catch {
      suspendAudioContext()
      setPlaybackState('error')
      setErrorMessage(playerCopy.errorMessage)
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
            <span>{release.typeLabel}</span>
            <span aria-hidden="true">•</span>
            <time dateTime={release.releaseDate}>{formatReleaseDate(release.releaseDate)}</time>
          </div>
          <div className="release-spotlight__intro">
            <div className="release-spotlight__text">
              <h3 className="release-spotlight__title">{release.title}</h3>
              <p className="release-spotlight__copy">{release.description}</p>
              <ResponsiveImage
                image={release.coverArt}
                className="release-spotlight__initial"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
              <AppLink link={release.primaryLink} className="release-spotlight__cta">
                <span>{release.primaryLink.label}</span>
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
            src={release.audio.src}
            preload="metadata"
            onPlay={() => setPlaybackState('playing')}
            onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
            onDurationChange={(event) => setDuration(event.currentTarget.duration)}
            onEnded={stopPlayback}
            onError={() => {
              suspendAudioContext()
              setPlaybackState('error')
              setErrorMessage(playerCopy.errorMessage)
            }}
          />

          <button
            type="button"
            className="telephone-player__button telephone-player__button--prompted"
            aria-label={isPlaying ? `Stop and rewind ${release.title}` : `Play ${release.title}`}
            aria-pressed={isPlaying}
            disabled={playbackState === 'loading'}
            onClick={togglePlayback}
          >
            <span className={`telephone-player__phone telephone-player__phone--${isPlaying ? 'active' : 'idle'}`}>
              <ResponsiveImage
                image={isPlaying ? playerImages.active : playerImages.idle}
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
            <span className="telephone-player__interaction-prompt" aria-hidden="true">
              <span className="telephone-player__prompt-line telephone-player__prompt-line--first">
                {playerCopy.interactionPrompt.firstLine}
              </span>
              <span className="telephone-player__prompt-arrow">{playerCopy.interactionPrompt.arrow}</span>
              <span className="telephone-player__prompt-line telephone-player__prompt-line--middle">
                {playerCopy.interactionPrompt.middleLine}
              </span>
              <span className="telephone-player__prompt-line telephone-player__prompt-line--last">
                {playerCopy.interactionPrompt.lastLine}
              </span>
            </span>
          </button>

          <div className="telephone-player__readout" aria-live="polite">
            <span>{isPlaying ? playerCopy.playingStatus : playbackState === 'loading' ? playerCopy.loadingStatus : playerCopy.idleStatus}</span>
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
          <progress
            className="telephone-player__progress"
            value={currentTime}
            max={duration || 1}
            aria-label={`${release.title} playback progress`}
          />
          {errorMessage && <p className="telephone-player__error" role="alert">{errorMessage}</p>}
        </div>
      </div>
    </div>
  )
}
