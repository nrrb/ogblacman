import type { ArtistProfile } from '@/types/content'

export const siteUrl = import.meta.env.VITE_SITE_URL || 'https://ogblacman.com'

export const placeholderImages = {
  artistPortrait: 'https://placecats.com/neo/1600/1200?position=top',
} as const

export const projectImages = {
  tree: '/images/chicago-tree-preview.png',
  treeOptimized: '/images/chicago-tree-preview.webp',
} as const

export const artist: ArtistProfile = {
  name: 'OG Blacman',
  location: 'Chicago, Illinois',
  descriptor: 'Independent artist',
  biography:
    'OG Blacman is an independent Chicago artist building music, visuals, and interactive experiences on his own frequency.',
  socialLinks: [],
}

export const primaryNavigation = [
  { label: 'Music', href: '/#music' },
  { label: 'Tree Hugging', href: '/#game' },
  { label: 'Story', href: '/#story' },
  { label: 'Shows', href: '/#shows' },
  { label: 'Merch', href: '/#merch' },
  { label: 'Join', href: '/#join' },
] as const
