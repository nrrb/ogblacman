export function getAdjacentTrackIndex(currentIndex: number, playlistLength: number, direction: -1 | 1) {
  if (playlistLength <= 0) return -1
  return (currentIndex + direction + playlistLength) % playlistLength
}

export function formatPlaybackTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.floor(seconds % 60)
  return `${minutes}:${remainder.toString().padStart(2, '0')}`
}
