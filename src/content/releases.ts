import { projectImages } from '@/content/site'
import { tracks } from '@/content/tracks'
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
    previewTrackSlug: tracks[0]?.slug ?? null,
    description:
      'New music on the way. Cover art, audio and every platform link land right here the second it drops.',
    platformLinks: [],
    seo: {
      title: 'Next Transmission | OG Blacman',
      description: 'New music from OG Blacman out of Chicago. Coming soon.',
      image: projectImages.tree,
    },
    provisional: true,
  },
]

export const featuredRelease = releases.find((release) => release.featured) ?? releases[0]

export function getRelease(slug: string) {
  return releases.find((release) => release.slug === slug)
}
