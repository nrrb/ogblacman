export interface PlatformLink {
  label: string
  url: string
}

export interface ContentImage {
  src: string
  alt: string
}

export interface ExternalProviderLink {
  providerId: string
  label: string
  url: string
}

export type EventStatus = 'announced' | 'on-sale' | 'sold-out' | 'postponed' | 'cancelled'

export interface EventListing {
  slug: string
  title: string
  startsAt: string
  timeZone: string
  venue: string
  location: string
  artwork?: ContentImage
  description: string
  ticketLink: ExternalProviderLink | null
  status: EventStatus
}

export type MerchandiseStatus = 'coming-soon' | 'available' | 'sold-out' | 'archived'

export interface MerchandiseItem {
  slug: string
  title: string
  images: ContentImage[]
  displayPrice: string
  description: string
  checkoutLink: ExternalProviderLink | null
  status: MerchandiseStatus
}

export interface Release {
  slug: string
  title: string
  releaseDate: string | null
  featured: boolean
  artwork: string
  artworkOptimized?: string
  artworkAlt: string
  previewTrackSlug: string | null
  description: string
  platformLinks: PlatformLink[]
  seo: {
    title: string
    description: string
    image: string
  }
  provisional?: boolean
}

export interface Track {
  slug: string
  title: string
  artist: string
  audioUrl: string
  durationSeconds: number
  provisional?: boolean
}

export interface ArtistProfile {
  name: string
  location: string
  descriptor: string
  biography: string
  socialLinks: PlatformLink[]
}
