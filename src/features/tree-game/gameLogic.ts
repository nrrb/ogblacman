export const MIN_TARGET_SCORE = 1000
export const MAX_TARGET_SCORE = 5000

export function createTargetScore(randomValue = Math.random()) {
  const normalized = Math.min(Math.max(randomValue, 0), 0.999999)
  return MIN_TARGET_SCORE + Math.floor(normalized * (MAX_TARGET_SCORE - MIN_TARGET_SCORE + 1))
}

export function calculateGrowthScore(progress: number, targetScore: number) {
  const normalized = Math.min(Math.max(progress, 0), 1)
  if (normalized === 1) return targetScore
  const easedProgress = normalized * 0.12 + normalized ** 1.45 * 0.88
  return Math.min(Math.floor(targetScore * easedProgress), targetScore)
}

export function getGrowthStage(progress: number) {
  const normalized = Math.min(Math.max(progress, 0), 1)
  if (normalized >= 1) return 4
  if (normalized >= 0.72) return 3
  if (normalized >= 0.42) return 2
  if (normalized >= 0.16) return 1
  return 0
}
