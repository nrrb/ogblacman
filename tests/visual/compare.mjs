import { chromium } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

const baseUrl = process.env.VISUAL_URL || 'http://127.0.0.1:4173/'
const root = path.resolve('tests/visual')
const localDir = path.join(root, 'local')
const diffDir = path.join(root, 'diff')
const referenceDir = path.join(root, 'reference')
const viewports = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '390x844', width: 390, height: 844 },
]

await fs.mkdir(localDir, { recursive: true })
await fs.mkdir(diffDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const report = {}

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } })
  const errors = []
  const networkErrors = []
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', error => errors.push(error.message))
  page.on('requestfailed', request => networkErrors.push(`${request.failure()?.errorText}: ${request.url()}`))
  page.on('response', response => {
    if (response.status() >= 400) networkErrors.push(`${response.status()}: ${response.url()}`)
  })
  await page.goto(baseUrl, { waitUntil: 'load', timeout: 120000 })
  await page.waitForTimeout(4000)
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) animation.pause()
  })

  const screenshotPath = path.join(localDir, `${viewport.name}.png`)
  await page.screenshot({ path: screenshotPath, fullPage: true })
  const geometry = await page.evaluate(() => {
    const selectors = ['.site--desktop', '.site--mobile', '.background-media--desktop-hero', '.section--content', '.split-layout--about', '.feature-block--why', '.copy-grid', '.logo-marquee', '.section--clients', '.section--contact', '.mobile-slide']
    return Object.fromEntries(selectors.map(selector => {
      const element = document.querySelector(selector)
      if (!element) return [selector, null]
      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      return [selector, {
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        display: style.display,
        padding: style.padding,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
      }]
    }))
  })
  const videos = await page.evaluate(() => [...document.querySelectorAll('video')].map(video => ({
    id: video.id,
    currentSrc: video.currentSrc,
    readyState: video.readyState,
    networkState: video.networkState,
    error: video.error?.message ?? null,
    paused: video.paused,
    width: video.getBoundingClientRect().width,
    height: video.getBoundingClientRect().height,
  })))

  const reference = PNG.sync.read(await fs.readFile(path.join(referenceDir, `${viewport.name}.png`)))
  const actual = PNG.sync.read(await fs.readFile(screenshotPath))
  const compareWidth = Math.min(viewport.width, reference.width, actual.width)
  const compareHeight = Math.min(reference.height, actual.height)
  const crop = (source) => {
    const output = new PNG({ width: compareWidth, height: compareHeight })
    for (let y = 0; y < compareHeight; y += 1) {
      const sourceStart = y * source.width * 4
      const outputStart = y * compareWidth * 4
      source.data.copy(output.data, outputStart, sourceStart, sourceStart + compareWidth * 4)
    }
    return output
  }
  let mismatch = null
  if (compareHeight > 0) {
    const referenceCrop = crop(reference)
    const actualCrop = crop(actual)
    const diff = new PNG({ width: compareWidth, height: compareHeight })
    const changed = pixelmatch(referenceCrop.data, actualCrop.data, diff.data, compareWidth, compareHeight, { threshold: 0.15 })
    mismatch = changed / (compareWidth * compareHeight)
    await fs.writeFile(path.join(diffDir, `${viewport.name}.png`), PNG.sync.write(diff))
  }

  report[viewport.name] = {
    referenceSize: { width: reference.width, height: reference.height },
    actualSize: { width: actual.width, height: actual.height },
    mismatch,
    consoleErrors: [...new Set(errors)],
    networkErrors: [...new Set(networkErrors)],
    videos,
    geometry,
  }
  await page.close()
}

await browser.close()
await fs.writeFile(path.join(diffDir, 'report.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
