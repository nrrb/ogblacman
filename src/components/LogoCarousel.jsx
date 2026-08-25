import { useEffect, useRef } from 'react'
import AppLink from './AppLink.jsx'
import ResponsiveImage from './ResponsiveImage.jsx'

export default function LogoCarousel({ items }) {
  const track = useRef(null)

  useEffect(() => {
    const trackElement = track.current
    if (!trackElement) return undefined

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        trackElement.classList.add('is-marquee-active')
        observer.disconnect()
      }
    })
    observer.observe(trackElement)

    return () => observer.disconnect()
  }, [])

  return (
    <div className="logo-marquee">
      <section className="logo-marquee__section">
        <div className="logo-marquee__padding logo-marquee__padding--flush">
          <div className="logo-marquee__container">
            <div className="logo-marquee__spacing logo-marquee__spacing--large">
              <div ref={track} className="logo-marquee__track">
                {items.map((item) => (
                  <div key={item.id} className="logo-marquee__item">
                    {item.link?.url ? (
                      <AppLink link={item.link} className="logo-marquee__link">
                        <ResponsiveImage image={item.image} className="logo-marquee__image" loading="lazy" />
                      </AppLink>
                    ) : (
                      <ResponsiveImage image={item.image} className="logo-marquee__image" loading="lazy" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
