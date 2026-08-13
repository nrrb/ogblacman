import type { Track } from '@/types/content'

export const tracks: Track[] = [
  {
    slug: 'dungeon-crawl',
    title: 'Dungeon Crawl',
    artist: 'Sample audio',
    audioUrl: '/music/01-dungeon-crawl.mp3',
    durationSeconds: 180,
    provisional: true,
  },
  {
    slug: 'overworld-rush',
    title: 'Overworld Rush',
    artist: 'Sample audio',
    audioUrl: '/music/02-overworld-rush.mp3',
    durationSeconds: 180,
    provisional: true,
  },
  {
    slug: 'breakcore-arcade',
    title: 'Breakcore Arcade',
    artist: 'Sample audio',
    audioUrl: '/music/03-breakcore-arcade.mp3',
    durationSeconds: 180,
    provisional: true,
  },
  {
    slug: 'final-boss',
    title: 'Final Boss',
    artist: 'Sample audio',
    audioUrl: '/music/04-final-boss.mp3',
    durationSeconds: 180,
    provisional: true,
  },
  {
    slug: 'neon-cruise',
    title: 'Neon Cruise',
    artist: 'Sample audio',
    audioUrl: '/music/05-neon-cruise.mp3',
    durationSeconds: 180,
    provisional: true,
  },
]

export function getTrack(slug: string) {
  return tracks.find((track) => track.slug === slug)
}
