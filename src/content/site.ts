import type { ArtistProfile } from '@/types/content'

export const siteUrl = import.meta.env.VITE_SITE_URL || 'https://ogblacman.com'

export const heroVideo = {
  poster: '/video/hero-poster.jpg',
  sources: [
    { src: '/video/hero.mp4', type: 'video/mp4' },
    { src: '/video/hero.webm', type: 'video/webm' },
  ],
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
    "Six foot two with the dreads past my shoulders and a megaphone in my hand. Music, positivity and the best cake in the world, sold loud on Chicago sidewalks \u{1F934}\u{1F3FF}",
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
