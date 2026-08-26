export const HOME_SECTION_ORDER = Object.freeze([
  'hero',
  'featuredRelease',
  'shows',
  'booking',
  'merch',
  'newsletter',
])

export const HOME_SECTION_IDS = Object.freeze({
  hero: 'hero',
  featuredRelease: 'featured-release',
  shows: 'shows',
  booking: 'booking',
  merch: 'merch',
  newsletter: 'mailing-list',
})

export function isSectionVisible(section) {
  return section?.status === 'visible'
}

export function visibleSectionNames(sections) {
  return HOME_SECTION_ORDER.filter((name) => isSectionVisible(sections[name]))
}

export function sectionHref(name) {
  return HOME_SECTION_IDS[name] ? `#${HOME_SECTION_IDS[name]}` : null
}
