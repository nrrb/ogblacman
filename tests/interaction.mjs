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

const dots = page.locator('.slider-dot')
if (await dots.count() !== 7) throw new Error('Expected seven mobile slide navigation dots')

await dots.nth(1).click()
await page.waitForTimeout(350)
const secondSlide = page.locator('.mobile-slide').nth(1)
if (await secondSlide.getAttribute('aria-hidden') !== 'false') throw new Error('Second slide did not activate')
if (!(await secondSlide.innerText()).includes('SECTION 2 BIG TEXT')) throw new Error('Second slide content is missing')
if (await secondSlide.locator('.top-pick-release__art').count() !== 1) throw new Error('Top pick cover art is missing')
if (await secondSlide.locator('.streaming-link').count() !== 2) throw new Error('Top pick streaming links are missing')

await dots.nth(2).click()
await page.waitForTimeout(350)
const showsSlide = page.locator('.mobile-slide').nth(2)
if (await showsSlide.locator('.show-link').count() !== 3) throw new Error('Upcoming show list is missing')

await dots.nth(6).click()
await page.waitForTimeout(350)
const newsletterSlide = page.locator('.mobile-slide').nth(6)
const form = newsletterSlide.locator('form')
if (await form.locator('input[name="Name"]').getAttribute('required') !== null) throw new Error('Newsletter name field should be optional')
if (await form.locator('input[name="Email"]').getAttribute('required') === null) throw new Error('Newsletter email field should be required')
await form.locator('input[name="Email"]').fill('local@example.test')
await form.locator('input[type="submit"]').click()
if (!(await newsletterSlide.locator('.form-status--success').isVisible())) throw new Error('Local success state did not appear')
if (page.url() !== url) throw new Error('Local form unexpectedly navigated')

if (errors.length) throw new Error(`Browser console errors: ${errors.join('; ')}`)
await browser.close()
console.log('Mobile navigation and safe local form behavior passed.')
