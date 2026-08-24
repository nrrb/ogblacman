import { chromium } from 'playwright'

const url = process.env.TEST_URL || 'http://127.0.0.1:4173/'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 600, height: 844 } })
const errors = []
page.on('console', message => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('pageerror', error => errors.push(error.message))

await page.goto(url, { waitUntil: 'load' })
if (!(await page.locator('.site--mobile').isVisible())) {
  throw new Error('Mobile experience is hidden in the 480–767px breakpoint range')
}
if (await page.locator('.site--desktop').count() !== 0) {
  throw new Error('Desktop experience should not mount below the mobile breakpoint')
}

await page.setViewportSize({ width: 390, height: 844 })
await page.reload({ waitUntil: 'load' })
await page.waitForTimeout(1000)

const slider = page.locator('.mobile-slider')
const continuous = await slider.evaluate(element => element.classList.contains('mobile-slider--continuous'))
const dots = page.locator('.slider-dot')
const slides = page.locator('.mobile-slide')

if (continuous) {
  if (await dots.count() !== 0) throw new Error('Continuous mobile scrolling should not show slide navigation dots')
  if (await slides.count() !== 6) throw new Error('Expected six continuous mobile panels')
  for (let index = 0; index < 6; index += 1) {
    if (await slides.nth(index).getAttribute('aria-hidden') !== null) throw new Error('Continuous mobile panels should remain accessible')
    if (await slides.nth(index).getAttribute('inert') !== null) throw new Error('Continuous mobile panels should not be inert')
  }
  for (let index = 1; index < 6; index += 1) {
    const isolation = await slides.nth(index).evaluate(element => getComputedStyle(element).isolation)
    if (isolation !== 'isolate') throw new Error('Continuous mobile panel did not contain its negative-z-index video background')
  }
  const viewportHeight = await page.evaluate(() => window.innerHeight)
  const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight)
  if (documentHeight < viewportHeight * 5.5) throw new Error('Continuous mobile panels do not create a full vertical document')
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.mouse.wheel(0, 600)
  await page.waitForTimeout(150)
  if (await page.evaluate(() => window.scrollY) <= 0) throw new Error('Continuous mobile mode did not allow native document scrolling')
} else {
  if (await dots.count() !== 6) throw new Error('Expected six mobile slide navigation dots in discrete mode')
  await dots.nth(5).click()
  await page.waitForTimeout(350)
  await page.keyboard.press('ArrowDown')
  await page.waitForTimeout(350)
  if (await slides.nth(5).getAttribute('aria-hidden') !== 'false') throw new Error('Discrete navigation wrapped past the final slide')
  await dots.nth(0).click()
  await page.waitForTimeout(350)
  await page.keyboard.press('ArrowUp')
  await page.waitForTimeout(350)
  if (await slides.nth(0).getAttribute('aria-hidden') !== 'false') throw new Error('Discrete navigation wrapped before the first slide')
}

const secondSlide = slides.nth(1)
if (continuous) await secondSlide.scrollIntoViewIfNeeded()
else await dots.nth(1).click()
await page.waitForTimeout(350)
if (!continuous && await secondSlide.getAttribute('aria-hidden') !== 'false') throw new Error('Second slide did not activate')
if (!(await secondSlide.innerText()).includes('POPCORN PLAYER')) throw new Error('Top pick slide content is missing')
const webamp = secondSlide.locator('.webamp-player--mobile')
await webamp.locator('#main-window').waitFor({ state: 'visible', timeout: 15_000 })
const marqueeFontSize = await webamp.locator('#marquee .character').first().evaluate(element => getComputedStyle(element).fontSize)
if (marqueeFontSize !== '0px') throw new Error('Webamp marquee text fallback should remain hidden behind its bitmap glyphs')
if (await webamp.locator('#equalizer-window').count() !== 0) throw new Error('Webamp equalizer should be disabled')
if (await webamp.locator('#playlist-window').count() !== 0) throw new Error('Webamp playlist should be disabled')
if (await webamp.locator('#equalizer-button').getAttribute('aria-disabled') !== 'true') throw new Error('Webamp equalizer toggle should be disabled')
if (await webamp.locator('#playlist-button').getAttribute('aria-disabled') !== 'true') throw new Error('Webamp playlist toggle should be disabled')
if (await secondSlide.locator('.streaming-link').count() !== 0) throw new Error('Top pick streaming links should be removed')

const showsSlide = slides.nth(2)
if (continuous) await showsSlide.scrollIntoViewIfNeeded()
else await dots.nth(2).click()
await page.waitForTimeout(350)
if (await showsSlide.locator('.show-link').count() !== 3) throw new Error('Upcoming show list is missing')

const newsletterSlide = slides.nth(5)
if (continuous) await newsletterSlide.scrollIntoViewIfNeeded()
else await dots.nth(5).click()
await page.waitForTimeout(350)
const form = newsletterSlide.locator('form')
if (await form.locator('input[name="Name"]').getAttribute('required') !== null) throw new Error('Newsletter name field should be optional')
if (await form.locator('input[name="Email"]').getAttribute('required') === null) throw new Error('Newsletter email field should be required')
await form.locator('input[name="Email"]').fill('local@example.test')
await form.locator('input[type="submit"]').click()
if (!(await newsletterSlide.locator('.form-status--success').isVisible())) throw new Error('Local success state did not appear')
if (page.url() !== url) throw new Error('Local form unexpectedly navigated')

if (errors.length) throw new Error(`Browser console errors: ${errors.join('; ')}`)
await browser.close()
console.log(`Mobile ${continuous ? 'continuous scrolling' : 'discrete navigation'} and safe local form behavior passed.`)
