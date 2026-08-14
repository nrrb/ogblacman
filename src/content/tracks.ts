import playlist from '@/content/playlist.json'
import type { Track } from '@/types/content'

export const tracks: Track[] = playlist

export function getTrack(slug: string) {
  return tracks.find((track) => track.slug === slug)
}
