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
  location: 'Chicago',
  descriptor: 'The Original',
  biography:
    "I'm from Chicago and I been doing this since before anybody was watching so don't ask me who put me on \u{1F934}\u{1F3FF}",
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
