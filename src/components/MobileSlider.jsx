import { useEffect, useRef, useState } from 'react'

export default function MobileSlider({
  slideCount,
  continuous,
  dotLabel,
  previousLabel,
  nextLabel,
  children,
}) {
  const [active, setActive] = useState(0)
  const touchX = useRef(0)
  const touchY = useRef(0)
  const wheelLocked = useRef(false)
  const wheelTimer = useRef()

  function show(index) {
    setActive(Math.min(Math.max(index, 0), slideCount - 1))
  }

  function slideAttributes(index) {
    if (continuous) return {}
    const visible = index === active
    return {
      'aria-hidden': String(!visible),
      inert: visible ? undefined : '',
      style: { transform: `translate3d(0, ${-active * 100}%, 0)` },
    }
  }

  function label(index) {
    return dotLabel
      .replace('{current}', String(index + 1))
      .replace('{total}', String(slideCount))
  }

  function handleTouchStart(event) {
    touchX.current = event.touches[0].clientX
    touchY.current = event.touches[0].clientY
  }

  function handleTouchEnd(event) {
    if (continuous) return
    const dx = event.changedTouches[0].clientX - touchX.current
    const dy = event.changedTouches[0].clientY - touchY.current
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return
    if (Math.abs(dy) < Math.abs(dx)) return
    show(active + (dy < 0 ? 1 : -1))
  }

  function handleWheel(event) {
    if (continuous || wheelLocked.current || Math.abs(event.deltaY) < 18) return
    event.preventDefault()
    wheelLocked.current = true
    show(active + (event.deltaY > 0 ? 1 : -1))
    wheelTimer.current = window.setTimeout(() => {
      wheelLocked.current = false
    }, 320)
  }

  useEffect(() => {
    function handleKeydown(event) {
      if (continuous || window.innerWidth > 767) return
      if (event.key === 'ArrowDown') setActive((current) => Math.min(current + 1, slideCount - 1))
      if (event.key === 'ArrowUp') setActive((current) => Math.max(current - 1, 0))
    }

    document.addEventListener('keydown', handleKeydown)
    if (continuous) document.documentElement.classList.add('mobile-continuous-scroll')

    return () => {
      document.removeEventListener('keydown', handleKeydown)
      document.documentElement.classList.remove('mobile-continuous-scroll')
      window.clearTimeout(wheelTimer.current)
    }
  }, [continuous, slideCount])

  const sliderClass = [
    'site',
    'site--mobile',
    'mobile-slider',
    continuous ? 'mobile-slider--continuous' : 'mobile-slider--discrete',
  ].join(' ')

  return (
    <div
      className={sliderClass}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <div className="mobile-slider__track">{children(slideAttributes)}</div>
      {!continuous && (
        <>
          <div
            className="slider-arrow slider-arrow--previous"
            role="button"
            tabIndex="0"
            aria-label={previousLabel}
            onClick={() => show(active - 1)}
          />
          <div
            className="slider-arrow slider-arrow--next"
            role="button"
            tabIndex="0"
            aria-label={nextLabel}
            onClick={() => show(active + 1)}
          />
          <div className="slider-nav">
            {Array.from({ length: slideCount }, (_, index) => (
              <div
                key={index}
                className={`slider-dot${index === active ? ' is-active' : ''}`}
                role="button"
                tabIndex="0"
                aria-label={label(index)}
                aria-current={index === active ? 'true' : 'false'}
                onClick={() => show(index)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  show(index)
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
