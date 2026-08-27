import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import { parse } from 'yaml'
import { presentation } from './src/config/presentation.js'
import { hydrateContent } from './src/content/hydrateContent.js'
import { validateContent } from './src/content/validateContent.js'

const rawSiteContent = validateContent(parse(fs.readFileSync(new URL('./src/content/site.yaml', import.meta.url), 'utf8')))
const siteContent = hydrateContent(rawSiteContent)
const rawPalette = parse(fs.readFileSync(new URL('./og-colors.yaml', import.meta.url), 'utf8'))
const colorNames = ['black1', 'black2', 'white', 'gold1', 'gold2']
const hexColorPattern = /^#[0-9a-f]{6}$/i

for (const colorName of colorNames) {
  if (!hexColorPattern.test(rawPalette[colorName])) {
    throw new Error(`Palette color "${colorName}" must be a six-digit hex color.`)
  }
}

const paletteVariables = Object.fromEntries(colorNames.map(colorName => [
  `--color-${colorName.replace(/([a-z])(\d)/, '$1-$2')}`,
  rawPalette[colorName],
]))

function compiledDataPlugin() {
  const compiledSiteContent = [
    `export const rawSiteContent = ${JSON.stringify(rawSiteContent)}`,
    `export const siteContent = ${JSON.stringify(siteContent)}`,
  ].join('\n')
  const compiledPalette = `export const paletteVariables = Object.freeze(${JSON.stringify(paletteVariables)})`

  return {
    name: 'compiled-site-data',
    apply: 'build',
    enforce: 'pre',
    transform(_code, id) {
      const modulePath = id.split('?', 1)[0].replaceAll('\\', '/')
      if (modulePath.endsWith('/src/content/loadContent.js')) return { code: compiledSiteContent, map: { mappings: '' } }
      if (modulePath.endsWith('/src/styles/palette.js')) return { code: compiledPalette, map: { mappings: '' } }
      return null
    },
  }
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function absoluteUrl(path, baseUrl) {
  return new URL(path, baseUrl).toString()
}

function responsivePreload(image, targetWidth) {
  const srcSet = image.sources.map((source) => `${source.src} ${source.width}w`).join(', ')
  const preferred = image.sources.find((source) => source.width >= targetWidth) || image.sources.at(-1)
  return `<link rel="preload" as="image" href="${escapeAttribute(preferred.src)}" imagesrcset="${escapeAttribute(srcSet)}" imagesizes="${escapeAttribute(image.sizes)}" fetchpriority="high" />`
}

function videoPreload(video) {
  const source = video.sources.find((item) => item.type === 'video/mp4') || video.sources[0]
  return `<link rel="preload" as="video" href="${escapeAttribute(source.src)}" type="${escapeAttribute(source.type)}" fetchpriority="high" />`
}

function siteContentPlugin() {
  const { siteSettings } = rawSiteContent
  const featuredReleaseVisible = rawSiteContent.homePage.sections.featuredRelease.status === 'visible'
  const socialImage = presentation.images[siteSettings.seo.socialImage.asset]
  const escapedReplacements = {
    '{{SITE_TITLE}}': siteSettings.seo.title,
    '{{SITE_DESCRIPTION}}': siteSettings.seo.description,
    '{{CANONICAL_URL}}': siteSettings.identity.canonicalUrl,
    '{{SOCIAL_IMAGE_URL}}': absoluteUrl(socialImage.src, siteSettings.identity.canonicalUrl),
    '{{SOCIAL_IMAGE_TYPE}}': socialImage.type,
    '{{SOCIAL_IMAGE_WIDTH}}': socialImage.width,
    '{{SOCIAL_IMAGE_HEIGHT}}': socialImage.height,
    '{{SOCIAL_IMAGE_ALT}}': siteSettings.seo.socialImage.alt,
  }
  const markupReplacements = {
    '<!-- ROBOTS_META -->': siteSettings.seo.noIndex
      ? '<meta name="robots" content="noindex, nofollow" />'
      : '',
    '<!-- FEATURED_RELEASE_PRELOADS -->': featuredReleaseVisible
      ? [
          videoPreload(presentation.videos.treePhone),
          responsivePreload(presentation.images.telephoneCover, 640),
        ].join('\n    ')
      : '',
  }

  return {
    name: 'site-content-metadata',
    transformIndexHtml(html) {
      const withEscapedContent = Object.entries(escapedReplacements).reduce(
        (result, [token, value]) => result.replaceAll(token, escapeAttribute(value)),
        html,
      )
      return Object.entries(markupReplacements).reduce(
        (result, [token, value]) => result.replaceAll(token, value),
        withEscapedContent,
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), compiledDataPlugin(), siteContentPlugin()],
})
