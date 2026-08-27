import fs from 'node:fs'
import { parse } from 'yaml'
import { hydrateContent } from '../src/content/hydrateContent.js'
import { HOME_SECTION_ORDER, sectionHref, visibleSectionNames } from '../src/content/sectionVisibility.js'
import { validateContent } from '../src/content/validateContent.js'

const source = fs.readFileSync(new URL('../src/content/site.yaml', import.meta.url), 'utf8')
const content = validateContent(parse(source))
const sections = content.homePage.sections
const sectionNames = HOME_SECTION_ORDER

if (!content.siteSettings || !content.homePage) throw new Error('Content must use singleton-shaped siteSettings and homePage roots')
if (content.theme !== undefined || content.mobile !== undefined || content.shared !== undefined) {
  throw new Error('Presentation settings must not remain in editorial content')
}
if (content.siteSettings.seo.title !== 'OG BLACMAN') throw new Error('SEO title must be editable in site settings')
if (content.siteSettings.seo.socialImage.asset !== 'telephoneSocial') throw new Error('SEO social image must use a semantic asset reference')
if (content.siteSettings.socialLinks.some((link) => !link.url.startsWith('https://'))) throw new Error('Social URLs must use HTTPS')
if (content.siteSettings.socialLinks.length !== 5) throw new Error('All five social profiles must be configured')
if (content.siteSettings.footer.status !== 'visible') throw new Error('Footer visibility must be independently configurable')
if (content.siteSettings.integrations.kit.formUid !== 'bb5435c1d3') throw new Error('Public Kit form identifier must come from site settings')
if (content.siteSettings.integrations.kit.embedUrl !== undefined) throw new Error('Executable integration URLs must not be editor-controlled')

for (const name of sectionNames) {
  if (!['visible', 'hidden'].includes(sections[name].status)) throw new Error(`${name} must have an editorial status`)
  const toggled = structuredClone(content)
  toggled.homePage.sections[name].status = name === 'booking' ? 'visible' : 'hidden'
  validateContent(toggled)
}
if (visibleSectionNames(sections).join(',') !== 'hero,featuredRelease,shows,merch,newsletter') {
  throw new Error('Visible section order must follow the stable home-page model')
}
if (sectionHref('featuredRelease') !== '#featured-release' || sectionHref('newsletter') !== '#mailing-list') {
  throw new Error('Semantic section links must resolve to rendered section IDs')
}
if (sections.booking.status !== 'hidden') throw new Error('Booking should remain hidden by content status')
if (sections.booking.contact.name !== 'Gabrielle Labolito') throw new Error('Hidden Booking details must remain available')

if (sections.featuredRelease.release.releaseDate !== '2026-08-26') throw new Error('Featured release must use one canonical release date')
if (sections.featuredRelease.release.release_date !== undefined) throw new Error('Duplicate formatted release date must not remain')
if (sections.featuredRelease.release.audio.asset !== 'telephone') throw new Error('Featured release must use a semantic audio asset')
if (sections.featuredRelease.release.video.asset !== 'treePhone') throw new Error('Featured release must use the Tree Phone video asset')
if (sections.featuredRelease.release.coverArt.asset !== 'telephoneCover') throw new Error('Featured release must use semantic cover art')
if (sections.featuredRelease.showHeading !== false) throw new Error('Featured release Hot Release heading should be hidden')
if (!sections.featuredRelease.release.description.includes("Hear a sample of OG Blacman's hot release now in the Tree Phone")) {
  throw new Error('Featured release description must identify the Tree Phone sample')
}
if (sections.featuredRelease.release.primaryLink.url !== 'https://distrokid.com/hyperfollow/ogblacman/telephone?ref=release') {
  throw new Error('Featured release must retain its DistroKid link')
}
const interactionPrompt = sections.featuredRelease.playerCopy.interactionPrompt
if (interactionPrompt.firstLine !== 'pick' || interactionPrompt.arrow !== '<-'
  || interactionPrompt.middleLine !== 'up my' || interactionPrompt.lastLine !== 'line') {
  throw new Error('Telephone interaction prompt must remain editable release copy')
}

if (sections.shows.items.length !== 0) throw new Error('Shows should not include placeholder events')
if (sections.merch.items.length !== 0) throw new Error('Merch should not include placeholder products')
if (sections.newsletter.form !== undefined) throw new Error('Unused legacy newsletter form schema must be removed')
if (!sections.newsletter.formCopy.successMessage) throw new Error('Newsletter editorial feedback copy is missing')
if (!sections.newsletter.formCopy.submittingLabel) throw new Error('Newsletter submitting copy is missing')

const expanded = structuredClone(content)
expanded.homePage.sections.shows.items.push({
  _key: 'content-test-show',
  startAt: '2026-10-01T20:00:00-05:00',
  timezone: 'America/Chicago',
  venue: 'Test Venue',
  city: 'Chicago, IL',
  ticketStatus: 'available',
  ticketLink: {
    type: 'external',
    label: 'Tickets',
    url: 'https://example.com/tickets',
  },
})
expanded.homePage.sections.merch.items.push({
  _key: 'content-test-product',
  title: 'Test product',
  price: '$25',
  availability: 'available',
  image: { asset: 'telephoneCover', alt: 'Content test product' },
  productLink: {
    type: 'external',
    label: 'View test product',
    url: 'https://example.com/products/test',
  },
})
validateContent(expanded)
const hydrated = hydrateContent(expanded)
if (hydrated.siteSettings.integrations.kit.embedUrl !== 'https://og-blacman.kit.com/bb5435c1d3/index.js') {
  throw new Error('The public Kit identifier must hydrate through the trusted application host')
}
if (hydrated.homePage.sections.merch.items[0].image.src !== '/assets/telephone-cover.png') {
  throw new Error('Semantic image references must hydrate to runtime assets')
}
if (hydrated.siteSettings.socialLinks.some((link) => !link.icon?.src)) throw new Error('Social platform icons must hydrate from application configuration')

const newsletterHidden = structuredClone(content)
newsletterHidden.homePage.sections.newsletter.status = 'hidden'
validateContent(newsletterHidden)
const hydratedWithoutNewsletter = hydrateContent(newsletterHidden)
if (!hydratedWithoutNewsletter.homePage.sections.shows.emptyState.cta.disabled) {
  throw new Error('Links to a hidden Newsletter section must become non-interactive')
}
if (!hydratedWithoutNewsletter.homePage.sections.merch.emptyState.cta.disabled) {
  throw new Error('Merch links to a hidden Newsletter section must become non-interactive')
}

const allHidden = structuredClone(content)
for (const name of sectionNames) allHidden.homePage.sections[name].status = 'hidden'
let allHiddenRejected = false
try {
  validateContent(allHidden)
} catch (error) {
  allHiddenRejected = error.message.includes('at least one section')
}
if (!allHiddenRejected) throw new Error('Content accepted a home page with no visible sections')

for (const invalidStatus of [undefined, true, 'draft']) {
  const invalid = structuredClone(content)
  invalid.homePage.sections.hero.status = invalidStatus
  let rejected = false
  try {
    validateContent(invalid)
  } catch (error) {
    rejected = error.message.includes('homePage.sections.hero.status')
  }
  if (!rejected) throw new Error(`Invalid section status was accepted: ${String(invalidStatus)}`)
}

const duplicate = structuredClone(expanded)
duplicate.homePage.sections.shows.items.push(structuredClone(duplicate.homePage.sections.shows.items[0]))
let duplicateRejected = false
try {
  validateContent(duplicate)
} catch (error) {
  duplicateRejected = error.message.includes('duplicate key')
}
if (!duplicateRejected) throw new Error('Duplicate Sanity-style array keys were accepted')

for (const invalidUrl of ['http://example.com', 'not-a-url']) {
  const invalid = structuredClone(content)
  invalid.siteSettings.socialLinks[0].url = invalidUrl
  let rejected = false
  try {
    validateContent(invalid)
  } catch (error) {
    rejected = error.message.includes('siteSettings.socialLinks[0].url')
  }
  if (!rejected) throw new Error(`Invalid social URL was accepted: ${invalidUrl}`)
}

console.log('Sanity-ready singleton content, semantic fields, and section visibility passed.')
