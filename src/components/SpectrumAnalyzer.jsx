import { useEffect, useRef } from 'react'

const BAR_COUNT = 20

// Resting silhouette — a symmetric equalizer shape so the control still reads
// as a music player while nothing is playing.
const STATIC_LEVELS = [
  0.16, 0.22, 0.3, 0.26, 0.38, 0.5, 0.44, 0.58, 0.7, 0.64,
  0.64, 0.7, 0.58, 0.44, 0.5, 0.38, 0.26, 0.3, 0.22, 0.16,
]

// Bar height decides the colour: quiet bars stay a dim cream, louder bars climb
// through the two golds, peaks hit full cream. Every value comes from the
// cover-art palette exposed on :root as CSS custom properties.
const LEVEL_COLORS = [
  [0.82, 'var(--color-white)'],
  [0.55, 'var(--color-gold-1)'],
  [0.3, 'var(--color-gold-2)'],
  [0, 'color-mix(in srgb, var(--color-white) 42%, transparent)'],
]

function colorForLevel(level) {
  for (const [threshold, color] of LEVEL_COLORS) {
    if (level >= threshold) return color
  }
  return LEVEL_COLORS[LEVEL_COLORS.length - 1][1]
}

// Log-spaced bin edges across the analyser output, so each bar covers a roughly
// octave-wide slice rather than a linear slice of the sample rate.
function logBandEdges(binCount) {
  const minBin = 1
  const maxBin = Math.max(minBin + 1, binCount - 1)
  const edges = []
  for (let i = 0; i <= BAR_COUNT; i += 1) {
    const edge = Math.round(minBin * (maxBin / minBin) ** (i / BAR_COUNT))
    // Guarantee every band spans at least one bin so no bar is stuck at the floor.
    edges.push(Math.max(edge, (edges[i - 1] ?? minBin) + (i === 0 ? 0 : 1)))
  }
  return edges
}

export default function SpectrumAnalyzer({ audioRef, active }) {
  const barsRef = useRef([])
  const levelsRef = useRef(STATIC_LEVELS.slice())
  const contextRef = useRef(null)
  const analyserRef = useRef(null)
  const dataRef = useRef(null)
  const frameRef = useRef(null)

  function paintBar(index, level) {
    const bar = barsRef.current[index]
    if (!bar) return
    const clamped = Math.min(1, Math.max(0, level))
    bar.style.transform = `scaleY(${(0.06 + clamped * 0.94).toFixed(3)})`
    bar.style.backgroundColor = colorForLevel(clamped)
  }

  function paintStatic() {
    for (let i = 0; i < BAR_COUNT; i += 1) {
      levelsRef.current[i] = STATIC_LEVELS[i]
      paintBar(i, STATIC_LEVELS[i])
    }
  }

  function ensureGraph() {
    if (analyserRef.current) return true
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    const audioElement = audioRef?.current
    if (!AudioContextClass || !audioElement) return false
    try {
      const context = new AudioContextClass()
      const analyser = context.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.82
      const source = context.createMediaElementSource(audioElement)
      source.connect(analyser)
      analyser.connect(context.destination)
      contextRef.current = context
      analyserRef.current = analyser
      dataRef.current = new Uint8Array(analyser.frequencyBinCount)
      return true
    } catch {
      return false
    }
  }

  useEffect(() => {
    paintStatic()
  }, [])

  useEffect(() => () => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current)
    contextRef.current?.close?.()
  }, [])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (!active || prefersReducedMotion || !ensureGraph()) {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
      paintStatic()
      return undefined
    }

    const analyser = analyserRef.current
    const data = dataRef.current
    const edges = logBandEdges(analyser.frequencyBinCount)
    contextRef.current?.resume?.()

    const render = () => {
      analyser.getByteFrequencyData(data)
      for (let i = 0; i < BAR_COUNT; i += 1) {
        let peak = 0
        for (let bin = edges[i]; bin < edges[i + 1]; bin += 1) {
          if (data[bin] > peak) peak = data[bin]
        }
        const target = (peak / 255) ** 0.75
        const current = levelsRef.current[i]
        const smoothing = target > current ? 0.55 : 0.12
        const next = current + (target - current) * smoothing
        levelsRef.current[i] = next
        paintBar(i, next)
      }
      frameRef.current = window.requestAnimationFrame(render)
    }

    frameRef.current = window.requestAnimationFrame(render)

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
      paintStatic()
    }
  }, [active])

  return (
    <span
      className={`telephone-player__spectrum${active ? ' telephone-player__spectrum--live' : ''}`}
      aria-hidden="true"
    >
      {Array.from({ length: BAR_COUNT }, (_, index) => (
        <span
          key={index}
          className="telephone-player__spectrum-bar"
          ref={(node) => { barsRef.current[index] = node }}
        />
      ))}
    </span>
  )
}
