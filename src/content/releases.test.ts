import { describe, expect, it } from 'vitest'

import { releases } from './releases'

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
})
