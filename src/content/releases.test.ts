import { describe, expect, it } from 'vitest'

import { releases } from './releases'
import { tracks } from './tracks'

describe('release content', () => {
  it('has unique, URL-safe slugs', () => {
    const slugs = releases.map((release) => release.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(slugs.every((slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))).toBe(true)
  })

  it('provides metadata and artwork for every release', () => {
    for (const release of releases) {
      expect(release.seo.title).toContain(release.title)
      expect(release.seo.description.length).toBeGreaterThan(20)
      expect(release.artwork).toBeTruthy()
      expect(release.artworkAlt).toBeTruthy()
    }
  })

  it('only references known preview tracks', () => {
    const trackSlugs = new Set(tracks.map((track) => track.slug))
    expect(releases.every((release) => !release.previewTrackSlug || trackSlugs.has(release.previewTrackSlug))).toBe(true)
  })
})

describe('sample track content', () => {
  it('has unique slugs and audio paths', () => {
    expect(new Set(tracks.map((track) => track.slug)).size).toBe(tracks.length)
    expect(new Set(tracks.map((track) => track.audioUrl)).size).toBe(tracks.length)
  })

  it('describes playable MP3 assets', () => {
    for (const track of tracks) {
      expect(track.audioUrl).toMatch(/^\/music\/.+\.mp3$/)
      expect(track.durationSeconds).toBeGreaterThan(0)
    }
  })
})
