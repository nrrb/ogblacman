import { describe, expect, it } from 'vitest'

import {
  formatEventDateTime,
  getEventStatusLabel,
  getMerchandiseStatusLabel,
} from './listingLogic'

describe('formatEventDateTime', () => {
  it('formats an event in its configured venue time zone', () => {
    expect(formatEventDateTime('2026-09-13T01:00:00.000Z', 'America/Chicago')).toEqual({
      date: 'Sep 12, 2026',
      time: '8:00 PM CDT',
    })
  })

  it('provides a stable fallback for an invalid date', () => {
    expect(formatEventDateTime('pending', 'America/Chicago')).toEqual({
      date: 'Date to be announced',
      time: '',
    })
  })
})

describe('listing status labels', () => {
  it('maps provider-independent event and merchandise states to UI copy', () => {
    expect(getEventStatusLabel('on-sale')).toBe('Get tickets')
    expect(getEventStatusLabel('postponed')).toBe('New date pending')
    expect(getMerchandiseStatusLabel('available')).toBe('View item')
    expect(getMerchandiseStatusLabel('sold-out')).toBe('Sold out')
  })
})
