import { HOME_SECTION_ORDER } from './sectionVisibility.js'

const SECTION_NAMES = HOME_SECTION_ORDER
const SECTION_STATUSES = ['visible', 'hidden']

function fail(path, message) {
  throw new Error(`Content validation failed at ${path}: ${message}`)
}

function object(value, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(path, 'expected an object')
  return value
}

function array(value, path) {
  if (!Array.isArray(value)) fail(path, 'expected an array')
  return value
}

function string(value, path, { empty = false } = {}) {
  if (typeof value !== 'string' || (!empty && !value.trim())) fail(path, 'expected a non-empty string')
  return value
}

function optionalString(value, path) {
  if (value !== null && value !== undefined) string(value, path)
}

function boolean(value, path) {
  if (typeof value !== 'boolean') fail(path, 'expected a boolean')
  return value
}

function enumeration(value, values, path) {
  if (!values.includes(value)) fail(path, `expected one of: ${values.join(', ')}`)
  return value
}

function url(value, path) {
  string(value, path)
  let parsed
  try {
    parsed = new URL(value)
  } catch {
    fail(path, 'expected a valid URL')
  }
  if (parsed.protocol !== 'https:') fail(path, 'expected an HTTPS URL')
  return value
}

function uniqueKeys(items, path) {
  const keys = new Set()
  items.forEach((item, index) => {
    object(item, `${path}[${index}]`)
    const itemKey = string(item._key, `${path}[${index}]._key`)
    if (keys.has(itemKey)) fail(`${path}[${index}]._key`, `duplicate key "${itemKey}"`)
    keys.add(itemKey)
  })
}

function heading(value, path) {
  object(value, path)
  string(value.title, `${path}.title`)
}

function status(value, path) {
  return enumeration(value, SECTION_STATUSES, path)
}

function imageReference(value, path) {
  object(value, path)
  string(value.asset, `${path}.asset`)
  string(value.alt, `${path}.alt`, { empty: true })
}

function assetReference(value, path) {
  object(value, path)
  string(value.asset, `${path}.asset`)
}

function sectionLink(value, path, { optional = false } = {}) {
  if (value == null && optional) return
  object(value, path)
  enumeration(value.type, ['external', 'section'], `${path}.type`)
  string(value.label, `${path}.label`)
  optionalString(value.ariaLabel, `${path}.ariaLabel`)
  if (value.type === 'external') url(value.url, `${path}.url`)
  if (value.type === 'section') enumeration(value.section, SECTION_NAMES, `${path}.section`)
}

function emptyState(value, path) {
  object(value, path)
  for (const field of ['statusLabel', 'availability', 'headline', 'accent', 'body']) {
    string(value[field], `${path}.${field}`)
  }
  sectionLink(value.cta, `${path}.cta`)
}

export function validateContent(content) {
  object(content, 'root')

  const siteSettings = object(content.siteSettings, 'siteSettings')
  const identity = object(siteSettings.identity, 'siteSettings.identity')
  string(identity.name, 'siteSettings.identity.name')
  url(identity.canonicalUrl, 'siteSettings.identity.canonicalUrl')

  const seo = object(siteSettings.seo, 'siteSettings.seo')
  string(seo.title, 'siteSettings.seo.title')
  string(seo.description, 'siteSettings.seo.description')
  imageReference(seo.socialImage, 'siteSettings.seo.socialImage')
  boolean(seo.noIndex, 'siteSettings.seo.noIndex')

  const socialLinks = array(siteSettings.socialLinks, 'siteSettings.socialLinks')
  uniqueKeys(socialLinks, 'siteSettings.socialLinks')
  const platforms = new Set()
  socialLinks.forEach((item, index) => {
    const path = `siteSettings.socialLinks[${index}]`
    const platform = enumeration(item.platform, ['instagram', 'tiktok', 'youtube'], `${path}.platform`)
    if (platforms.has(platform)) fail(`${path}.platform`, `duplicate platform "${platform}"`)
    platforms.add(platform)
    string(item.label, `${path}.label`)
    url(item.url, `${path}.url`)
  })

  const footer = object(siteSettings.footer, 'siteSettings.footer')
  status(footer.status, 'siteSettings.footer.status')
  string(footer.copyrightOwner, 'siteSettings.footer.copyrightOwner')
  if (!Number.isInteger(footer.copyrightStartYear) || footer.copyrightStartYear < 1900) {
    fail('siteSettings.footer.copyrightStartYear', 'expected a four-digit year')
  }
  const footerLinks = array(footer.links, 'siteSettings.footer.links')
  uniqueKeys(footerLinks, 'siteSettings.footer.links')
  footerLinks.forEach((item, index) => sectionLink(item, `siteSettings.footer.links[${index}]`))

  const kit = object(siteSettings.integrations?.kit, 'siteSettings.integrations.kit')
  if (!/^[a-z0-9]+$/i.test(kit.formUid)) {
    fail('siteSettings.integrations.kit.formUid', 'expected a public Kit form identifier')
  }

  const sections = object(content.homePage?.sections, 'homePage.sections')
  SECTION_NAMES.forEach((name) => {
    const section = object(sections[name], `homePage.sections.${name}`)
    status(section.status, `homePage.sections.${name}.status`)
    heading(section.heading, `homePage.sections.${name}.heading`)
  })
  if (!SECTION_NAMES.some((name) => sections[name].status === 'visible')) {
    fail('homePage.sections', 'at least one section must be visible')
  }

  const hero = sections.hero
  optionalString(hero.supportingText, 'homePage.sections.hero.supportingText')
  string(hero.scrollPrompt, 'homePage.sections.hero.scrollPrompt')
  const heroVideo = object(hero.backgroundVideo, 'homePage.sections.hero.backgroundVideo')
  string(heroVideo.primary, 'homePage.sections.hero.backgroundVideo.primary')
  optionalString(heroVideo.mobileOverride, 'homePage.sections.hero.backgroundVideo.mobileOverride')

  const featuredRelease = sections.featuredRelease
  const release = object(featuredRelease.release, 'homePage.sections.featuredRelease.release')
  for (const field of ['typeLabel', 'artist', 'title', 'description']) {
    string(release[field], `homePage.sections.featuredRelease.release.${field}`)
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(release.releaseDate)) {
    fail('homePage.sections.featuredRelease.release.releaseDate', 'expected a YYYY-MM-DD date')
  }
  imageReference(release.coverArt, 'homePage.sections.featuredRelease.release.coverArt')
  assetReference(release.audio, 'homePage.sections.featuredRelease.release.audio')
  sectionLink(release.primaryLink, 'homePage.sections.featuredRelease.release.primaryLink')
  const playerCopy = object(featuredRelease.playerCopy, 'homePage.sections.featuredRelease.playerCopy')
  for (const field of ['idleStatus', 'loadingStatus', 'playingStatus', 'errorMessage']) {
    string(playerCopy[field], `homePage.sections.featuredRelease.playerCopy.${field}`)
  }
  string(featuredRelease.mobileBackground, 'homePage.sections.featuredRelease.mobileBackground')

  const shows = sections.shows
  emptyState(shows.emptyState, 'homePage.sections.shows.emptyState')
  const showItems = array(shows.items, 'homePage.sections.shows.items')
  uniqueKeys(showItems, 'homePage.sections.shows.items')
  showItems.forEach((item, index) => {
    const path = `homePage.sections.shows.items[${index}]`
    if (Number.isNaN(Date.parse(item.startAt))) fail(`${path}.startAt`, 'expected an ISO date and time')
    string(item.timezone, `${path}.timezone`)
    string(item.venue, `${path}.venue`)
    string(item.city, `${path}.city`)
    enumeration(item.ticketStatus, ['available', 'soldOut', 'cancelled', 'unavailable'], `${path}.ticketStatus`)
    sectionLink(item.ticketLink, `${path}.ticketLink`, { optional: true })
  })
  string(shows.mobileBackground, 'homePage.sections.shows.mobileBackground')

  const booking = sections.booking
  optionalString(booking.intro, 'homePage.sections.booking.intro')
  const contact = object(booking.contact, 'homePage.sections.booking.contact')
  string(contact.jobTitle, 'homePage.sections.booking.contact.jobTitle')
  string(contact.name, 'homePage.sections.booking.contact.name')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
    fail('homePage.sections.booking.contact.email', 'expected a valid email address')
  }
  if (!/^\+?[\d\s().-]{7,}$/.test(contact.phone)) {
    fail('homePage.sections.booking.contact.phone', 'expected a valid phone number')
  }
  enumeration(contact.preferredContact, ['email', 'phone'], 'homePage.sections.booking.contact.preferredContact')
  string(booking.mobileBackground, 'homePage.sections.booking.mobileBackground')

  const merch = sections.merch
  string(merch.intro, 'homePage.sections.merch.intro')
  emptyState(merch.emptyState, 'homePage.sections.merch.emptyState')
  const merchItems = array(merch.items, 'homePage.sections.merch.items')
  uniqueKeys(merchItems, 'homePage.sections.merch.items')
  merchItems.forEach((item, index) => {
    const path = `homePage.sections.merch.items[${index}]`
    string(item.title, `${path}.title`)
    optionalString(item.price, `${path}.price`)
    enumeration(item.availability, ['available', 'comingSoon', 'soldOut'], `${path}.availability`)
    imageReference(item.image, `${path}.image`)
    sectionLink(item.productLink, `${path}.productLink`, { optional: true })
  })
  string(merch.mobileBackground, 'homePage.sections.merch.mobileBackground')

  const newsletter = sections.newsletter
  optionalString(newsletter.intro, 'homePage.sections.newsletter.intro')
  optionalString(newsletter.privacyNotice, 'homePage.sections.newsletter.privacyNotice')
  const formCopy = object(newsletter.formCopy, 'homePage.sections.newsletter.formCopy')
  for (const field of [
    'ariaLabel', 'firstNameLabel', 'firstNamePlaceholder', 'emailLabel', 'emailPlaceholder',
    'optionalLabel', 'requiredLabel', 'submitLabel', 'submittingLabel', 'successMessage', 'errorMessage',
  ]) {
    string(formCopy[field], `homePage.sections.newsletter.formCopy.${field}`)
  }
  string(newsletter.mobileBackground, 'homePage.sections.newsletter.mobileBackground')

  return content
}
