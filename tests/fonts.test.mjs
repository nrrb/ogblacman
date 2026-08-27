import assert from 'node:assert/strict'
import { readFile, readdir, stat } from 'node:fs/promises'
import test from 'node:test'

const publicDirectory = new URL('../public/', import.meta.url)
const fontDirectory = new URL('../public/assets/fonts/', import.meta.url)
const cssFile = new URL('../src/styles/reference.css', import.meta.url)
const expectedFonts = [
  'quinn-bold-latin-ext.woff2',
  'neue-haas-display-medium-latin-ext.woff2',
  'neue-haas-display-roman-latin-ext.woff2',
  'neue-haas-display-thin-latin-ext.woff2',
  'neue-haas-display-light-latin-ext.woff2',
  'tajamuka-script-latin-ext.woff2',
]

async function collectFiles(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const url = new URL(entry.name, directory)
    if (entry.isDirectory()) files.push(...await collectFiles(new URL(`${url.href}/`)))
    else files.push(url)
  }
  return files
}

test('production fonts use the Latin Extended WOFF2 delivery set', async () => {
  const files = await readdir(fontDirectory)
  assert.deepEqual(files.sort(), expectedFonts.toSorted())
  const sizes = await Promise.all(expectedFonts.map(name => stat(new URL(name, fontDirectory))))
  const totalBytes = sizes.reduce((sum, details) => sum + details.size, 0)
  assert.ok(totalBytes <= 520_000, `Web fonts exceed the 520 KB budget: ${totalBytes}`)

  const legacyFonts = (await collectFiles(publicDirectory)).filter(file => /\.(ttf|otf)$/i.test(file.pathname))
  assert.deepEqual(legacyFonts, [])
})

test('font-face rules reference only the generated WOFF2 files', async () => {
  const css = await readFile(cssFile, 'utf8')
  assert.doesNotMatch(css, /url\([^)]*\.(?:ttf|otf)/i)
  for (const name of expectedFonts) assert.match(css, new RegExp(name.replaceAll('.', '\\.')))
})
