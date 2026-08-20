import { chromium } from 'playwright'

const url = process.env.TEST_URL || 'http://127.0.0.1:4173/'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const errors = []
page.on('console', message => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('pageerror', error => errors.push(error.message))

await page.goto(url, { waitUntil: 'load' })
await page.waitForTimeout(1000)

const dots = page.locator('.w-slider-dot')
if (await dots.count() !== 8) throw new Error('Expected eight mobile slide navigation dots')

await dots.nth(1).click()
await page.waitForTimeout(350)
const secondSlide = page.locator('.w-slide').nth(1)
if (await secondSlide.getAttribute('aria-hidden') !== 'false') throw new Error('Second slide did not activate')
if (!(await secondSlide.innerText()).includes('who we')) throw new Error('Second slide content is missing')

await dots.nth(7).click()
await page.waitForTimeout(350)
const form = page.locator('.w-slide').nth(7).locator('form')
await form.locator('input[name="Name"]').fill('Local Test')
await form.locator('input[name="Email"]').fill('local@example.test')
await form.locator('input[name="Paragraph"]').fill('Local form validation')
await form.locator('input[type="submit"]').click()
if (!(await page.locator('.w-slide').nth(7).locator('.w-form-done').isVisible())) throw new Error('Local success state did not appear')
if (page.url() !== url) throw new Error('Local form unexpectedly navigated')

if (errors.length) throw new Error(`Browser console errors: ${errors.join('; ')}`)
await browser.close()
console.log('Mobile navigation and safe local form behavior passed.')
