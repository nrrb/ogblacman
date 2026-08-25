import fs from 'node:fs'
import { parse } from 'yaml'
import { validateContent } from '../src/content/validateContent.js'

const source = fs.readFileSync(new URL('../src/content/site.yaml', import.meta.url), 'utf8')
const content = validateContent(parse(source))

if (content.mobile.continuous_scroll !== true) throw new Error('Continuous mobile scrolling should be enabled by default')
if (!/^#[0-9a-f]{6}$/i.test(content.theme.heading_outline_color)) throw new Error('Heading outline color must come from site.yaml')
if (content.theme.heading_outline_width !== 6) throw new Error('Heading outline width must come from site.yaml')
if (content.sections.upcoming_shows.items.length !== 0) throw new Error('Shows should not include placeholder events')
if (!Array.isArray(content.sections.merch.items)) throw new Error('Merch items must be expandable')
if (content.sections.merch.items.length !== 0) throw new Error('Merch should not include placeholder products')
if (content.sections.merch.cta.url !== '#mailing-list') throw new Error('Merch alerts must link to the mailing list')
if (content.sections.newsletter.form.fields.find(field => field.id === 'name').required) throw new Error('Newsletter name must be optional')
if (!content.sections.newsletter.form.fields.find(field => field.id === 'email').required) throw new Error('Newsletter email must be required')
if (content.sections.top_pick.player.track_src !== '/music/telephone.mp3') {
  throw new Error('Top pick must use the local Telephone track')
}
if (content.sections.top_pick.heading.title !== 'HOT RELEASE') {
  throw new Error('Telephone section heading must identify the hot release')
}
if (content.sections.top_pick.release_date_iso !== '2026-08-26') {
  throw new Error('Telephone release date must be August 26, 2026')
}
if (content.sections.top_pick.cta.url !== 'https://distrokid.com/hyperfollow/ogblacman/telephone?ref=release') {
  throw new Error('Telephone must link to its DistroKid release page')
}
if (content.sections.top_pick.streaming_links !== undefined) throw new Error('Top pick external streaming links must be removed')

const expanded = structuredClone(content)
expanded.sections.merch.items.push({
  id: 'content-test-product',
  image: { src: '/assets/reference/test-product.png', alt: 'Content test product' },
  link: { label: 'Test product', url: 'https://example-shop.fourthwall.com/products/test', title: 'View the test product' },
})
validateContent(expanded)
if (expanded.sections.merch.items.length !== content.sections.merch.items.length + 1) throw new Error('Merch carousel did not accept an additional item')

const discreteMobile = structuredClone(content)
discreteMobile.mobile.continuous_scroll = false
validateContent(discreteMobile)

for (const invalidValue of [undefined, 'true', 1]) {
  const invalidMobile = structuredClone(content)
  invalidMobile.mobile.continuous_scroll = invalidValue
  let invalidMobileRejected = false
  try {
    validateContent(invalidMobile)
  } catch (error) {
    invalidMobileRejected = error.message.includes('mobile.continuous_scroll')
  }
  if (!invalidMobileRejected) throw new Error(`Invalid mobile scrolling value was accepted: ${String(invalidValue)}`)
}

for (const invalidValue of [undefined, 'gold', '#FC30']) {
  const invalidTheme = structuredClone(content)
  invalidTheme.theme.heading_outline_color = invalidValue
  let invalidThemeRejected = false
  try {
    validateContent(invalidTheme)
  } catch (error) {
    invalidThemeRejected = error.message.includes('theme.heading_outline_color')
  }
  if (!invalidThemeRejected) throw new Error(`Invalid heading outline color was accepted: ${String(invalidValue)}`)
}

const duplicate = structuredClone(content)
const duplicateShow = {
  id: 'duplicate-show',
  meta: 'SHOW DATE',
  label: 'SHOW LOCATION',
  action_label: 'TICKETS',
  url: null,
  link_title: null,
}
duplicate.sections.upcoming_shows.items.push(duplicateShow, structuredClone(duplicateShow))
let duplicateRejected = false
try {
  validateContent(duplicate)
} catch (error) {
  duplicateRejected = error.message.includes('duplicate ID')
}
if (!duplicateRejected) throw new Error('Duplicate collection IDs must be rejected')

console.log('YAML content schema and expandable collections passed.')
