import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { presentation } from '../src/config/presentation.js'

const localAssetPattern = /^\/(?:assets|music)\//
const immutablePolicy = 'public, max-age=31536000, immutable'

function collectLocalAssetUrls(value, urls = []) {
  if (typeof value === 'string' && localAssetPattern.test(value)) urls.push(value)
  else if (Array.isArray(value)) value.forEach(item => collectLocalAssetUrls(item, urls))
  else if (value && typeof value === 'object') Object.values(value).forEach(item => collectLocalAssetUrls(item, urls))
  return urls
}

test('runtime static assets use explicit cache versions', async () => {
  const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8')
  const css = await readFile(new URL('../src/styles/reference.css', import.meta.url), 'utf8')
  const presentationAssets = collectLocalAssetUrls(presentation)
  const documentAssets = [...indexHtml.matchAll(/(?:href|src)="(\/(?:assets|music)\/[^"\s]+)"/g)].map(match => match[1])
  const styleAssets = [...css.matchAll(/url\(["']?(\/(?:assets|music)\/[^)"']+)/g)].map(match => match[1])
  const assets = [...presentationAssets, ...documentAssets, ...styleAssets]

  assert.ok(assets.length > 0, 'No runtime static assets were discovered')
  for (const asset of assets) {
    const url = new URL(asset, 'https://example.test')
    assert.ok(url.searchParams.get('v'), `Static asset is missing a cache version: ${asset}`)
  }
})

test('deployment config makes versioned asset families immutable', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'))
  const policies = new Map(config.headers.map(rule => [rule.source, rule.headers]))

  for (const source of ['/assets/(.*)', '/music/(.*)']) {
    const headers = policies.get(source)
    assert.ok(headers, `Missing cache rule for ${source}`)
    assert.equal(headers.find(header => header.key.toLowerCase() === 'cache-control')?.value, immutablePolicy)
  }
})
