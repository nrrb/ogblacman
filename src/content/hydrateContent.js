import { presentation } from '../config/presentation.js'

function resolveAsset(collection, name, kind) {
  const asset = collection[name]
  if (!asset) throw new Error(`Content references unknown ${kind} asset "${name}"`)
  return asset
}

function resolveImage(reference) {
  return {
    ...resolveAsset(presentation.images, reference.asset, 'image'),
    alt: reference.alt,
  }
}

function resolveVideo(name) {
  return resolveAsset(presentation.videos, name, 'video')
}

function resolveSectionLink(link, sections) {
  if (link?.type !== 'section' || sections[link.section]?.status === 'visible') return link
  return { ...link, disabled: true }
}

export function hydrateContent(rawContent) {
  const content = structuredClone(rawContent)
  const { siteSettings } = content
  const sections = content.homePage.sections

  siteSettings.integrations.kit = {
    ...siteSettings.integrations.kit,
    embedUrl: `${presentation.integrations.kit.embedBaseUrl}/${siteSettings.integrations.kit.formUid}/index.js`,
    runtimeSrcPrefix: presentation.integrations.kit.runtimeSrcPrefix,
  }

  siteSettings.seo.socialImage = resolveImage(siteSettings.seo.socialImage)
  siteSettings.socialLinks = siteSettings.socialLinks.map((link) => ({
    ...link,
    icon: resolveAsset(presentation.socialIcons, link.platform, 'social icon'),
  }))

  sections.hero.backgroundVideo = {
    primary: resolveVideo(sections.hero.backgroundVideo.primary),
    mobileOverride: sections.hero.backgroundVideo.mobileOverride
      ? resolveVideo(sections.hero.backgroundVideo.mobileOverride)
      : null,
  }

  const release = sections.featuredRelease.release
  release.coverArt = resolveImage(release.coverArt)
  release.video = resolveVideo(release.video.asset)
  release.audio = resolveAsset(presentation.audio, release.audio.asset, 'audio')

  for (const sectionName of ['featuredRelease', 'shows', 'booking', 'merch', 'newsletter']) {
    sections[sectionName].mobileBackground = resolveVideo(sections[sectionName].mobileBackground)
  }

  sections.merch.items = sections.merch.items.map((item) => ({
    ...item,
    image: resolveImage(item.image),
  }))
  sections.shows.emptyState.cta = resolveSectionLink(sections.shows.emptyState.cta, sections)
  sections.merch.emptyState.cta = resolveSectionLink(sections.merch.emptyState.cta, sections)
  siteSettings.footer.links = siteSettings.footer.links.map((link) => resolveSectionLink(link, sections))

  return { ...content, presentation }
}
