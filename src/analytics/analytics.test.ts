import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  initAnalytics,
  isAnalyticsActive,
  setAnalyticsTransport,
  trackEvent,
  trackPageView,
  type AnalyticsTransport,
} from '@/analytics'

function captureEvents() {
  const calls: Array<{ name: string; params: Record<string, unknown> }> = []
  const transport: AnalyticsTransport = (name, params) => calls.push({ name, params })
  setAnalyticsTransport(transport)
  return calls
}

afterEach(() => {
  setAnalyticsTransport(null)
  delete window.gtag
  delete window.dataLayer
  document.head.querySelectorAll('script[src*="googletagmanager"]').forEach((node) => node.remove())
})

describe('analytics boundary', () => {
  it('stays silent until a transport is installed', () => {
    expect(isAnalyticsActive()).toBe(false)
    // Must not throw when nothing is listening.
    expect(() => trackEvent('game_started', { target_score: 2500 })).not.toThrow()
  })

  it('forwards events and their parameters to the transport', () => {
    const calls = captureEvents()

    trackEvent('song_played', { track_slug: 'donde-bm', track_title: 'Donde BM?' })
    trackEvent('game_completed', { final_score: 4200 })

    expect(calls).toEqual([
      { name: 'song_played', params: { track_slug: 'donde-bm', track_title: 'Donde BM?' } },
      { name: 'game_completed', params: { final_score: 4200 } },
    ])
  })

  it('sends page views as a page_view event with path and title', () => {
    const calls = captureEvents()

    trackPageView('/music/donde-bm', 'Donde BM? | OG Blacman')

    expect(calls).toEqual([
      {
        name: 'page_view',
        params: { page_path: '/music/donde-bm', page_title: 'Donde BM? | OG Blacman' },
      },
    ])
  })

  it('stops forwarding once the transport is removed', () => {
    const calls = captureEvents()
    setAnalyticsTransport(null)

    trackEvent('signup_success', { source: 'homepage' })

    expect(calls).toHaveLength(0)
    expect(isAnalyticsActive()).toBe(false)
  })
})

describe('initAnalytics', () => {
  it('does nothing without a measurement ID', () => {
    expect(initAnalytics(undefined)).toBe(false)
    expect(initAnalytics('')).toBe(false)
    expect(isAnalyticsActive()).toBe(false)
    expect(document.head.querySelector('script[src*="googletagmanager"]')).toBeNull()
  })

  it('loads gtag and routes events through it when configured', () => {
    expect(initAnalytics('G-TEST123')).toBe(true)
    expect(isAnalyticsActive()).toBe(true)

    const script = document.head.querySelector<HTMLScriptElement>('script[src*="googletagmanager"]')
    expect(script?.src).toContain('id=G-TEST123')
    expect(script?.async).toBe(true)

    // Page views are sent manually so SPA routes are not double counted.
    expect(window.dataLayer).toContainEqual(['config', 'G-TEST123', { send_page_view: false }])

    const gtag = vi.fn()
    window.gtag = gtag
    trackEvent('merch_click', { provider_id: 'fourthwall', item_slug: 'tee' })

    expect(gtag).toHaveBeenCalledWith('event', 'merch_click', {
      provider_id: 'fourthwall',
      item_slug: 'tee',
    })
  })

  it('does not install a second time', () => {
    expect(initAnalytics('G-TEST123')).toBe(true)
    expect(initAnalytics('G-OTHER456')).toBe(false)
    expect(document.head.querySelectorAll('script[src*="googletagmanager"]')).toHaveLength(1)
  })
})
