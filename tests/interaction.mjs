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
const telephonePlayer = secondSlide.locator('.telephone-player--mobile')
const telephoneButton = telephonePlayer.locator('.telephone-player__button')
const telephoneImage = telephonePlayer.locator('.telephone-player__image')
const audio = telephonePlayer.locator('audio')
if (await telephoneButton.getAttribute('aria-label') !== 'Play Telephone') throw new Error('On-hook phone should start Telephone')
if (await telephoneImage.getAttribute('src') !== '/assets/phone_on_hook.png') throw new Error('Idle player should show the on-hook phone')
const idleButtonBox = await telephoneButton.boundingBox()
await telephoneButton.click()
await page.waitForFunction(() => document.querySelector('.telephone-player--mobile')?.dataset.state === 'playing')
if (await telephoneButton.getAttribute('aria-label') !== 'Stop and rewind Telephone') throw new Error('Off-hook phone should stop Telephone')
if (await telephoneImage.getAttribute('src') !== '/assets/phone_off_hook.png') throw new Error('Playing state should show the off-hook phone')
const analyzer = telephonePlayer.locator('.telephone-player__analyzer')
if (!(await analyzer.isVisible())) throw new Error('Telephone spectrum analyzer is missing during playback')
if (await analyzer.getAttribute('width') !== '20' || await analyzer.getAttribute('height') !== '20') {
  throw new Error('Telephone spectrum analyzer must use a 20x20 canvas')
}
const activePhoneBox = await telephonePlayer.locator('.telephone-player__phone--active').boundingBox()
const activeButtonBox = await telephoneButton.boundingBox()
const analyzerBox = await analyzer.boundingBox()
if (!idleButtonBox || !activePhoneBox || !activeButtonBox || !analyzerBox) throw new Error('Telephone player layout is not measurable')
if (Math.abs(activePhoneBox.width - activeButtonBox.width) > 1) throw new Error('Off-hook phone must use the full player width')
if (activeButtonBox.height <= idleButtonBox.height || activeButtonBox.height < activePhoneBox.height) {
  throw new Error('Off-hook phone container must grow to push following content down')
}
if (analyzerBox.width !== 200 || analyzerBox.height !== 60) throw new Error('Telephone analyzer pixels must render as 10x3 blocks')
const analyzerCenterX = analyzerBox.x + analyzerBox.width / 2
const phoneCenterX = activePhoneBox.x + activePhoneBox.width / 2
if (Math.abs(analyzerCenterX - phoneCenterX) > 1) throw new Error('Telephone spectrum analyzer must remain horizontally centered')
const analyzerBottom = analyzerBox.y + analyzerBox.height
const expectedAnalyzerBottom = activePhoneBox.y + activePhoneBox.height / 2 + 10
if (Math.abs(analyzerBottom - expectedAnalyzerBottom) > 1) throw new Error('Telephone spectrum analyzer must keep its bottom anchor')
const analyzerZIndex = await analyzer.evaluate(element => getComputedStyle(element).zIndex)
const phoneZIndex = await telephoneImage.evaluate(element => getComputedStyle(element).zIndex)
if (Number(analyzerZIndex) >= Number(phoneZIndex)) throw new Error('Telephone spectrum analyzer must sit behind the phone')
await page.waitForTimeout(300)
const analyzerDrewBars = await analyzer.evaluate(element => {
  const pixels = element.getContext('2d').getImageData(0, 0, element.width, element.height).data
  for (let index = 0; index < pixels.length; index += 4) {
    if (pixels[index + 1] > 80 && pixels[index + 3] > 0) return true
  }
  return false
})
if (!analyzerDrewBars) throw new Error('Telephone spectrum analyzer did not draw frequency bars')
const analyzerGrowsUp = await analyzer.evaluate(element => {
  const context = element.getContext('2d')
  const bottomRow = context.getImageData(0, element.height - 1, element.width, 1).data
  for (let index = 0; index < bottomRow.length; index += 4) {
    if (bottomRow[index + 3] > 0) return true
  }
  return false
})
if (!analyzerGrowsUp) throw new Error('Telephone spectrum bars must anchor at the bottom and grow upward')
if (await secondSlide.locator('.streaming-link').count() !== 0) throw new Error('Top pick streaming links should be removed')

if (continuous) {
  const volumeBeforeWheel = await audio.evaluate(element => element.volume)
  const scrollBeforeWheel = await page.evaluate(() => window.scrollY)
  await telephoneButton.hover()
  await page.mouse.wheel(0, 240)
  await page.waitForTimeout(200)
  const volumeAfterWheel = await audio.evaluate(element => element.volume)
  const scrollAfterWheel = await page.evaluate(() => window.scrollY)
  if (volumeAfterWheel !== volumeBeforeWheel) throw new Error('Scrolling over the telephone player changed its volume')
  if (scrollAfterWheel <= scrollBeforeWheel) throw new Error('Scrolling over the telephone player did not scroll the page')
}

await telephoneButton.click()
await page.waitForFunction(() => document.querySelector('.telephone-player--mobile')?.dataset.state === 'idle')
const stoppedAudio = await audio.evaluate(element => ({ paused: element.paused, currentTime: element.currentTime }))
if (!stoppedAudio.paused || stoppedAudio.currentTime !== 0) throw new Error('Hanging up should stop and rewind Telephone')
if (await telephoneImage.getAttribute('src') !== '/assets/phone_on_hook.png') throw new Error('Stopped player should return to the on-hook phone')
if (await analyzer.count() !== 0) throw new Error('Spectrum analyzer should close when Telephone stops')

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
