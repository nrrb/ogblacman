import { useEffect, useRef, useState } from 'react'

export default function SectionHeading({ heading, wrapperClass, titleClass, titleId }) {
  const svgText = useRef(null)
  const measureFrame = useRef()
  const [measurement, setMeasurement] = useState({
    viewBox: '0 0 1 1',
    width: 1,
    height: 1,
    isMeasured: false,
  })

  useEffect(() => {
    let cancelled = false

    function measureHeading() {
      const text = svgText.current
      if (!text || cancelled) return

      const bounds = text.getBBox()
      const strokeWidth = Number.parseFloat(getComputedStyle(text).strokeWidth) || 0
      const padding = Math.max(4, strokeWidth * 1.75)
      const width = Math.max(1, bounds.width + padding * 2)
      const height = Math.max(1, bounds.height + padding * 2)

      setMeasurement({
        viewBox: [bounds.x - padding, bounds.y - padding, width, height].join(' '),
        width,
        height,
        isMeasured: true,
      })
    }

    function scheduleMeasurement() {
      window.cancelAnimationFrame(measureFrame.current)
      measureFrame.current = window.requestAnimationFrame(measureHeading)
    }

    async function initializeMeasurement() {
      try {
        await document.fonts?.load(`400 ${getComputedStyle(svgText.current).fontSize} "Tajamuka Script"`)
      } catch {
        // The fallback measurement below still keeps the heading usable.
      }
      scheduleMeasurement()
    }

    initializeMeasurement()
    window.addEventListener('resize', scheduleMeasurement)

    return () => {
      cancelled = true
      window.removeEventListener('resize', scheduleMeasurement)
      window.cancelAnimationFrame(measureFrame.current)
    }
  }, [heading.title])

  return (
    <div className={`display-heading ${wrapperClass}`}>
      <div
        id={titleId}
        className={`display-heading__title ${titleClass} outlined-heading headline-wrap`}
        role="heading"
        aria-level="2"
      >
        <span
          className={`headline-halo${measurement.isMeasured ? ' is-measured' : ''}`}
          aria-hidden="true"
        >
          {heading.title}
        </span>
        <svg
          className={`display-heading__svg headline${measurement.isMeasured ? ' is-measured' : ''}`}
          viewBox={measurement.viewBox}
          width={measurement.width}
          height={measurement.height}
          aria-hidden="true"
          focusable="false"
        >
          <text ref={svgText} className="display-heading__svg-text" x="0" y="0">
            {heading.title}
          </text>
        </svg>
        <span className="display-heading__accessible-title">{heading.title}</span>
      </div>
    </div>
  )
}
