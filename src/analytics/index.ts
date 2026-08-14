import type { AnalyticsEventMap, AnalyticsEventName } from './events'

export type { AnalyticsEventMap, AnalyticsEventName } from './events'

/**
 * Analytics boundary for the whole application.
 *
 * Application code calls `trackEvent` and never touches GA directly, so the
 * provider can be swapped without hunting through components. Everything
 * no-ops until a transport is installed, which keeps prerendering, tests, and
 * any environment without a measurement ID silent by default.
 */
export type AnalyticsTransport = (name: string, params: Record<string, unknown>) => void

type GtagFn = (...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: GtagFn
  }
}

let transport: AnalyticsTransport | null = null

/** Swap the destination. Pass null to silence tracking entirely. */
export function setAnalyticsTransport(next: AnalyticsTransport | null) {
  transport = next
}

export function isAnalyticsActive() {
  return transport !== null
}

/**
 * Load GA4 and route events to it. Returns false when analytics stays off,
 * which is the expected result during prerender and in any environment
 * without VITE_GA_MEASUREMENT_ID configured.
 */
export function initAnalytics(measurementId: string | undefined = import.meta.env.VITE_GA_MEASUREMENT_ID) {
  if (transport || typeof window === 'undefined' || typeof document === 'undefined') return false
  if (!measurementId) return false

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  const gtag: GtagFn = (...args) => {
    window.dataLayer?.push(args)
  }
  window.gtag = gtag

  gtag('js', new Date())
  // Page views are sent manually so SPA route changes are counted once each.
  gtag('config', measurementId, { send_page_view: false })

  setAnalyticsTransport((name, params) => {
    window.gtag?.('event', name, params)
  })
  return true
}

/** Record a tracked interaction. Unknown names are rejected at compile time. */
export function trackEvent<K extends AnalyticsEventName>(name: K, params: AnalyticsEventMap[K]) {
  transport?.(name, params as Record<string, unknown>)
}

/** Record a route view. Separate from trackEvent because GA treats it specially. */
export function trackPageView(path: string, title: string) {
  trackEvent('page_view', { page_path: path, page_title: title })
}
