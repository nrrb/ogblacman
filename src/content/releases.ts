import { projectImages } from '@/content/site'
import type { Release } from '@/types/content'

export const releases: Release[] = [
  {
    slug: 'next-transmission',
    title: 'Next Transmission',
    releaseDate: null,
    featured: true,
    artwork: projectImages.tree,
    artworkOptimized: projectImages.treeOptimized,
    artworkAlt: 'Pixel-art Chicago skyline at night with a giant tree beside an elevated train',
    previewTrackSlug: 'dungeon-crawl',
    description:
      'New OG Blacman music is on the way. Final release details, cover art, audio, and platform links will replace this preview entry.',
    platformLinks: [],
    seo: {
      title: 'Next Transmission | OG Blacman',
      description: 'New music from independent Chicago artist OG Blacman is on the way.',
      image: projectImages.tree,
    },
    provisional: true,
  },
]

export const featuredRelease = releases.find((release) => release.featured) ?? releases[0]

export function getRelease(slug: string) {
  return releases.find((release) => release.slug === slug)
}
