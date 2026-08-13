export interface PlatformLink {
  label: string
  url: string
}

export interface Release {
  slug: string
  title: string
  releaseDate: string | null
  featured: boolean
  artwork: string
  artworkOptimized?: string
  artworkAlt: string
  audioUrl: string | null
  description: string
  platformLinks: PlatformLink[]
  seo: {
    title: string
    description: string
    image: string
  }
  provisional?: boolean
}

export interface ArtistProfile {
  name: string
  location: string
  descriptor: string
  biography: string
  socialLinks: PlatformLink[]
}
