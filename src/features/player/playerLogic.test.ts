import { describe, expect, it } from 'vitest'

import { formatPlaybackTime, getAdjacentTrackIndex } from './playerLogic'

describe('getAdjacentTrackIndex', () => {
  it('wraps in both directions', () => {
    expect(getAdjacentTrackIndex(2, 3, 1)).toBe(0)
    expect(getAdjacentTrackIndex(0, 3, -1)).toBe(2)
  })

  it('handles an empty playlist', () => {
    expect(getAdjacentTrackIndex(0, 0, 1)).toBe(-1)
  })
})

describe('formatPlaybackTime', () => {
  it('formats whole minutes and seconds', () => {
    expect(formatPlaybackTime(65.9)).toBe('1:05')
    expect(formatPlaybackTime(3600)).toBe('60:00')
  })

  it('sanitizes invalid values', () => {
    expect(formatPlaybackTime(Number.NaN)).toBe('0:00')
    expect(formatPlaybackTime(-4)).toBe('0:00')
  })
})
