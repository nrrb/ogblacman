import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import DesktopExperience from './components/DesktopExperience.jsx'
import MobileExperience from './components/MobileExperience.jsx'
import { siteContent } from './content/loadContent.js'

const mobileBreakpoint = '(max-width: 767px)'
const canMatchViewport = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
const localHostnames = new Set(['localhost', '127.0.0.1', '::1'])

export default function App() {
  const [isMobile, setIsMobile] = useState(
    () => canMatchViewport && window.matchMedia(mobileBreakpoint).matches,
  )

  useEffect(() => {
    if (!canMatchViewport) return undefined

    const viewportQuery = window.matchMedia(mobileBreakpoint)
    const updateExperience = (event) => setIsMobile(event.matches)
    setIsMobile(viewportQuery.matches)
    viewportQuery.addEventListener('change', updateExperience)

    return () => viewportQuery.removeEventListener('change', updateExperience)
  }, [])

  const styleVariables = {
    '--image-grain-overlay': `url("${siteContent.shared.style_images.grain_overlay}")`,
    '--image-grain-background': `url("${siteContent.shared.style_images.grain_background}")`,
    '--color-heading-outline': siteContent.theme.heading_outline_color,
    '--heading-outline-width': siteContent.theme.heading_outline_width,
  }
  const shouldLoadAnalytics = import.meta.env.PROD
    && typeof window !== 'undefined'
    && !localHostnames.has(window.location.hostname)

  return (
    <>
      <main style={styleVariables}>
        <div className="grain-overlay" />
        {isMobile ? <MobileExperience content={siteContent} /> : <DesktopExperience content={siteContent} />}
      </main>
      {shouldLoadAnalytics && <Analytics />}
    </>
  )
}
