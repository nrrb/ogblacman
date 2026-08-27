import assert from 'node:assert/strict'
import { gzipSync } from 'node:zlib'
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { build } from 'vite'

test('browser bundle excludes build-time content tooling', { timeout: 30_000 }, async (context) => {
  const outputDirectory = await mkdtemp(join(tmpdir(), 'og-inspo-bundle-'))
  context.after(() => rm(outputDirectory, { recursive: true, force: true }))

  await build({
    configFile: new URL('../vite.config.js', import.meta.url).pathname,
    build: {
      outDir: outputDirectory,
      emptyOutDir: true,
      sourcemap: true,
    },
  })

  const assetsDirectory = join(outputDirectory, 'assets')
  const files = await readdir(assetsDirectory)
  const scripts = files.filter(file => file.endsWith('.js'))
  const maps = files.filter(file => file.endsWith('.js.map'))
  assert.ok(scripts.length > 0, 'Production build did not emit JavaScript')
  assert.equal(maps.length, scripts.length, 'Production source maps are missing')

  let totalGzipBytes = 0
  for (const script of scripts) totalGzipBytes += gzipSync(await readFile(join(assetsDirectory, script))).byteLength
  assert.ok(totalGzipBytes <= 85_000, `Browser JavaScript exceeds the 85 KB gzip budget: ${totalGzipBytes}`)

  const sources = []
  for (const map of maps) sources.push(...JSON.parse(await readFile(join(assetsDirectory, map), 'utf8')).sources)
  assert.ok(!sources.some(source => source.includes('/node_modules/yaml/')), 'YAML parser leaked into the browser bundle')
  assert.ok(!sources.some(source => source.endsWith('/content/validateContent.js')), 'Content validator leaked into the browser bundle')
})
