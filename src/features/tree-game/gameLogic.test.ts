import { describe, expect, it } from 'vitest'

import {
  MAX_TARGET_SCORE,
  MIN_TARGET_SCORE,
  calculateGrowthScore,
  createTargetScore,
  getGrowthStage,
} from './gameLogic'

describe('createTargetScore', () => {
  it('maps random values to the inclusive score range', () => {
    expect(createTargetScore(0)).toBe(MIN_TARGET_SCORE)
    expect(createTargetScore(0.999999)).toBe(MAX_TARGET_SCORE)
  })
})

describe('calculateGrowthScore', () => {
  it('is monotonic and lands exactly on the target', () => {
    const target = 3456
    const scores = Array.from({ length: 101 }, (_, index) => calculateGrowthScore(index / 100, target))
    expect(scores[0]).toBe(0)
    expect(scores.at(-1)).toBe(target)
    expect(scores.every((score, index) => index === 0 || score >= (scores[index - 1] ?? 0))).toBe(true)
  })

  it('clamps progress outside the valid range', () => {
    expect(calculateGrowthScore(-1, 2000)).toBe(0)
    expect(calculateGrowthScore(2, 2000)).toBe(2000)
  })
})

describe('getGrowthStage', () => {
  it('advances through all five stages', () => {
    expect([0, 0.16, 0.42, 0.72, 1].map(getGrowthStage)).toEqual([0, 1, 2, 3, 4])
  })
})
