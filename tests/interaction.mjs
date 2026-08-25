import { chromium } from 'playwright'

const url = process.env.TEST_URL || 'http://127.0.0.1:4173/'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 600, height: 844 } })
const errors = []
await page.route('**/subscriptions', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ status: 'success' }),
  })
})
page.on('console', message => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('pageerror', error => errors.push(error.message))

await page.goto(url, { waitUntil: 'load' })
if (await page.locator('.grain-overlay').count() !== 0) throw new Error('Deleted grain overlay should not render')
if (await page.locator('.text-cta__texture').count() !== 0) throw new Error('Deleted CTA texture should not render')
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
if (!(await secondSlide.innerText()).includes('HOT RELEASE')) throw new Error('Hot release slide heading is missing')
if (await secondSlide.locator('.release-spotlight__art').count() !== 0) throw new Error('Hot release artwork should not render')
const releaseDetails = await secondSlide.locator('.release-spotlight__details').innerText()
if (!releaseDetails.includes('Telephone')) throw new Error('Telephone release title is missing')
if (!releaseDetails.includes('AUGUST 26, 2026')) throw new Error('Telephone release date is missing')
const releaseCta = secondSlide.locator('.release-spotlight__cta')
if (await releaseCta.getAttribute('href') !== 'https://distrokid.com/hyperfollow/ogblacman/telephone?ref=release') {
  throw new Error('Telephone DistroKid link is incorrect')
}
if (await releaseCta.getAttribute('target') !== '_blank') throw new Error('Telephone DistroKid link should open in a new tab')
const webamp = secondSlide.locator('.webamp-player--mobile')
await webamp.locator('#main-window').waitFor({ state: 'visible', timeout: 15_000 })
const marqueeFontSize = await webamp.locator('#marquee .character').first().evaluate(element => getComputedStyle(element).fontSize)
if (marqueeFontSize !== '0px') throw new Error('Webamp marquee text fallback should remain hidden behind its bitmap glyphs')
if (await webamp.locator('#equalizer-window').count() !== 0) throw new Error('Webamp equalizer should be disabled')
if (await webamp.locator('#playlist-window').count() !== 0) throw new Error('Webamp playlist should be disabled')
if (await webamp.locator('#equalizer-button').getAttribute('aria-disabled') !== 'true') throw new Error('Webamp equalizer toggle should be disabled')
if (await webamp.locator('#playlist-button').getAttribute('aria-disabled') !== 'true') throw new Error('Webamp playlist toggle should be disabled')
if (await secondSlide.locator('.streaming-link').count() !== 0) throw new Error('Top pick streaming links should be removed')

if (continuous) {
  const volume = webamp.locator('#volume input')
  const volumeBeforeWheel = await volume.inputValue()
  const scrollBeforeWheel = await page.evaluate(() => window.scrollY)
  await webamp.locator('#main-window').hover()
  await page.mouse.wheel(0, 240)
  await page.waitForTimeout(200)
  const volumeAfterWheel = await volume.inputValue()
  const scrollAfterWheel = await page.evaluate(() => window.scrollY)
  if (volumeAfterWheel !== volumeBeforeWheel) throw new Error('Scrolling over Webamp changed its volume')
  if (scrollAfterWheel <= scrollBeforeWheel) throw new Error('Scrolling over Webamp did not scroll the page')
}

const showsSlide = slides.nth(2)
if (continuous) await showsSlide.scrollIntoViewIfNeeded()
else await dots.nth(2).click()
await page.waitForTimeout(350)
if (await showsSlide.locator('.show-link').count() !== 0) throw new Error('Placeholder show listings should not render')
if (!(await showsSlide.locator('.show-empty').isVisible())) throw new Error('Shows coming-soon treatment is missing')
if (await showsSlide.locator('.show-empty__cta').getAttribute('href') !== '#mailing-list') throw new Error('Show alerts CTA should link to the mailing list')

const merchSlide = slides.nth(4)
if (continuous) await merchSlide.scrollIntoViewIfNeeded()
else await dots.nth(4).click()
await page.waitForTimeout(350)
if (await merchSlide.locator('.logo-marquee').count() !== 0) throw new Error('An empty merch carousel should not render')
if (!(await merchSlide.locator('.merch-empty').isVisible())) throw new Error('Merch coming-soon treatment is missing')
if (await merchSlide.locator('.merch-empty__cta').getAttribute('href') !== '#mailing-list') throw new Error('Merch alerts CTA should link to the mailing list')

const newsletterSlide = slides.nth(5)
if (continuous) await newsletterSlide.scrollIntoViewIfNeeded()
else await dots.nth(5).click()
await page.waitForTimeout(350)
const form = newsletterSlide.locator('form')
await form.waitFor({ state: 'visible', timeout: 15_000 })
if (await form.getAttribute('data-uid') !== 'bb5435c1d3') throw new Error('Official Kit form embed did not initialize')
if (await form.locator('input[name="fields[first_name]"]').getAttribute('required') !== null) throw new Error('Newsletter first name field should be optional')
if (await form.locator('input[name="email_address"]').getAttribute('required') === null) throw new Error('Newsletter email field should be required')
if (await form.locator('[data-element="submit"] span').innerText() !== 'STAY IN THE LOOP') throw new Error('Newsletter CTA label is incorrect')
await form.locator('input[name="email_address"]').fill('local@example.test')
await form.locator('[data-element="submit"]').click()
await newsletterSlide.locator('.formkit-alert-success').waitFor({ state: 'visible' })
if (new URL(page.url()).origin !== new URL(url).origin) throw new Error('Kit form unexpectedly navigated')

await page.setViewportSize({ width: 900, height: 844 })
const desktopForm = page.locator('.site--desktop form[data-uid="bb5435c1d3"]')
await desktopForm.waitFor({ state: 'attached' })
const desktopEmailBox = await desktopForm.locator('input[name="email_address"]').boundingBox()
const desktopFirstNameBox = await desktopForm.locator('input[name="fields[first_name]"]').boundingBox()
const desktopSubmitBox = await desktopForm.locator('[data-element="submit"]').boundingBox()
if (!desktopFirstNameBox || !desktopEmailBox || !desktopSubmitBox) throw new Error('Desktop Kit form controls are not measurable')
if (desktopEmailBox.y <= desktopFirstNameBox.y + desktopFirstNameBox.height) throw new Error('Desktop Kit email field should sit below the first name field')
if (desktopSubmitBox.y <= desktopEmailBox.y + desktopEmailBox.height) throw new Error('Desktop Kit CTA should sit below the email field')
await page.setViewportSize({ width: 390, height: 844 })
const remountedForm = page.locator('.site--mobile form[data-uid="bb5435c1d3"]')
await remountedForm.waitFor({ state: 'attached' })
if (await remountedForm.locator('input[name="email_address"]').count() !== 1) throw new Error('Kit form fields were duplicated or lost after remount')
const kitInstances = await page.evaluate(() => ({
  connectedForms: document.querySelectorAll('form[data-uid="bb5435c1d3"]').length,
  connectedRegistryEntries: (window.__sv_forms || []).filter(entry => entry.element?.isConnected).length,
  runtimeScripts: [...document.scripts].filter(script => script.src.startsWith('https://f.convertkit.com/ckjs/ck.')).length,
}))
if (kitInstances.connectedForms !== 1) throw new Error('Duplicate Kit forms remained after remount')
if (kitInstances.connectedRegistryEntries !== 1) throw new Error('Duplicate Kit registry entries remained after remount')
if (kitInstances.runtimeScripts !== 1) throw new Error('Kit runtime loaded more than once after remount')

if (errors.length) throw new Error(`Browser console errors: ${errors.join('; ')}`)
await browser.close()
console.log(`Mobile ${continuous ? 'continuous scrolling' : 'discrete navigation'} and safe local form behavior passed.`)
