import { chromium } from 'playwright'

const url = process.env.TEST_URL || 'http://127.0.0.1:4173/'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 600, height: 844 } })
const errors = []
await page.addInitScript(() => {
  window.__telephoneAnalyzerMetrics = {
    frames: 0,
    fills: 0,
    suspends: 0,
    resumes: 0,
  }

  const originalClearRect = CanvasRenderingContext2D.prototype.clearRect
  CanvasRenderingContext2D.prototype.clearRect = function patchedClearRect(...args) {
    if (this.canvas?.classList.contains('telephone-player__analyzer')) {
      window.__telephoneAnalyzerMetrics.frames += 1
    }
    return originalClearRect.apply(this, args)
  }

  const originalFillRect = CanvasRenderingContext2D.prototype.fillRect
  CanvasRenderingContext2D.prototype.fillRect = function patchedFillRect(...args) {
    if (this.canvas?.classList.contains('telephone-player__analyzer')) {
      window.__telephoneAnalyzerMetrics.fills += 1
    }
    return originalFillRect.apply(this, args)
  }

  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext
  if (AudioContextConstructor) {
    const originalSuspend = AudioContextConstructor.prototype.suspend
    AudioContextConstructor.prototype.suspend = function patchedSuspend(...args) {
      window.__telephoneAnalyzerMetrics.suspends += 1
      return originalSuspend.apply(this, args)
    }
    const originalResume = AudioContextConstructor.prototype.resume
    AudioContextConstructor.prototype.resume = function patchedResume(...args) {
      window.__telephoneAnalyzerMetrics.resumes += 1
      return originalResume.apply(this, args)
    }
  }
})
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
if (!new URL(await page.locator('link[rel="icon"]').getAttribute('href'), url).pathname.endsWith('/assets/favicon-32.png')) {
  throw new Error('Telephone artwork favicon is missing')
}
if (!new URL(await page.locator('link[rel="apple-touch-icon"]').getAttribute('href'), url).pathname.endsWith('/assets/apple-touch-icon.png')) {
  throw new Error('Telephone artwork Apple touch icon is missing')
}
if (await page.locator('meta[property="og:image"]').getAttribute('content') !== 'https://www.ogblacman.com/assets/telephone-cover-social.jpg') {
  throw new Error('Open Graph preview must use the Telephone artwork')
}
if (await page.locator('meta[property="og:image:width"]').getAttribute('content') !== '1200'
  || await page.locator('meta[property="og:image:height"]').getAttribute('content') !== '630') {
  throw new Error('Open Graph preview dimensions must match the social image')
}
if (await page.locator('meta[name="twitter:image"]').getAttribute('content') !== 'https://www.ogblacman.com/assets/telephone-cover-social.jpg') {
  throw new Error('Twitter preview must use the Telephone artwork')
}
const imagePreloads = page.locator('link[rel="preload"][as="image"]')
if (await imagePreloads.count() !== 3) throw new Error('Telephone player images should have responsive preload hints')
for (const expectedAsset of ['phone_on_hook-180.png', 'phone_off_hook-120.png', 'telephone-cover-96.webp']) {
  const matchingPreload = page.locator(`link[rel="preload"][href*="${expectedAsset}"]`)
  if (await matchingPreload.count() !== 1) throw new Error(`Missing image preload for ${expectedAsset}`)
  if (!(await matchingPreload.getAttribute('imagesrcset'))) throw new Error(`Missing responsive preload sources for ${expectedAsset}`)
}
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
const releaseDetails = await secondSlide.locator('.release-spotlight__details').innerText()
if (!releaseDetails.includes('Telephone')) throw new Error('Telephone release title is missing')
if (!releaseDetails.includes('AUGUST 26, 2026')) throw new Error('Telephone release date is missing')
const editorialArt = secondSlide.locator('.release-spotlight__initial')
if (!(await editorialArt.isVisible())) throw new Error('Telephone cover artwork is missing')
if (await editorialArt.getAttribute('src') !== '/assets/telephone-cover.png') {
  throw new Error('Telephone release uses the wrong editorial artwork')
}
if (!new URL(await editorialArt.evaluate(element => element.currentSrc)).pathname.endsWith('/assets/telephone-cover-96.webp')) {
  throw new Error('Mobile release artwork should use its smallest responsive image')
}
const editorialArtBox = await editorialArt.boundingBox()
const releaseTitleBox = await secondSlide.locator('.release-spotlight__title').boundingBox()
const releaseCopyBox = await secondSlide.locator('.release-spotlight__copy').boundingBox()
if (!editorialArtBox || !releaseTitleBox || !releaseCopyBox) throw new Error('Telephone editorial layout is not measurable')
if (editorialArtBox.x + editorialArtBox.width >= releaseTitleBox.x || editorialArtBox.x + editorialArtBox.width >= releaseCopyBox.x) {
  throw new Error('Telephone cover artwork must sit to the left of the Telephone title and copy')
}
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
if (!new URL(await telephoneImage.evaluate(element => element.currentSrc)).pathname.endsWith('/assets/phone_on_hook-180.png')) {
  throw new Error('Mobile on-hook phone should use its smallest responsive image')
}
const idleButtonBox = await telephoneButton.boundingBox()
const idlePhoneBox = await telephonePlayer.locator('.telephone-player__phone--idle').boundingBox()
const releaseCtaBox = await releaseCta.boundingBox()
if (!idleButtonBox || !idlePhoneBox || !releaseCtaBox) throw new Error('Idle telephone spacing is not measurable')
if (Math.abs(idleButtonBox.height - idlePhoneBox.height) > 1) throw new Error('Telephone button should not add empty space above the phone')
const copyToCtaGap = releaseCtaBox.y - (releaseCopyBox.y + releaseCopyBox.height)
const ctaToPhoneGap = idlePhoneBox.y - (releaseCtaBox.y + releaseCtaBox.height)
if (ctaToPhoneGap > copyToCtaGap + 6) throw new Error('CTA-to-phone spacing should match the paragraph-to-CTA rhythm')
await telephoneButton.click()
await page.waitForFunction(() => document.querySelector('.telephone-player--mobile')?.dataset.state === 'playing')
if (await telephoneButton.getAttribute('aria-label') !== 'Stop and rewind Telephone') throw new Error('Off-hook phone should stop Telephone')
if (await telephoneImage.getAttribute('src') !== '/assets/phone_off_hook.png') throw new Error('Playing state should show the off-hook phone')
if (!new URL(await telephoneImage.evaluate(element => element.currentSrc)).pathname.endsWith('/assets/phone_off_hook-120.png')) {
  throw new Error('Mobile off-hook phone should use its smallest responsive image')
}
const analyzer = telephonePlayer.locator('.telephone-player__analyzer')
if (!(await analyzer.isVisible())) throw new Error('Telephone spectrum analyzer is missing during playback')
if (await telephonePlayer.getAttribute('data-analyzer-active') !== 'true') throw new Error('Visible Telephone analyzer should be active during playback')
if (await analyzer.getAttribute('width') !== '20' || await analyzer.getAttribute('height') !== '20') {
  throw new Error('Telephone spectrum analyzer must use a 20x20 canvas')
}
const activePhoneBox = await telephonePlayer.locator('.telephone-player__phone--active').boundingBox()
const activeButtonBox = await telephoneButton.boundingBox()
const analyzerBox = await analyzer.boundingBox()
if (!idleButtonBox || !idlePhoneBox || !activePhoneBox || !activeButtonBox || !analyzerBox) throw new Error('Telephone player layout is not measurable')
if (Math.abs(activePhoneBox.height - idlePhoneBox.height) > 1) throw new Error('Off-hook phone must fit within the on-hook phone height')
if (Math.abs(activeButtonBox.height - idleButtonBox.height) > 1) throw new Error('Telephone player height must remain stable between states')
const expectedAnalyzerWidth = activePhoneBox.width * (5 / 7)
const expectedAnalyzerHeight = activePhoneBox.height * (3 / 28)
if (Math.abs(analyzerBox.width - expectedAnalyzerWidth) > 1 || Math.abs(analyzerBox.height - expectedAnalyzerHeight) > 1) {
  throw new Error('Telephone analyzer must scale proportionally with the off-hook phone')
}
const analyzerCenterX = analyzerBox.x + analyzerBox.width / 2
const phoneCenterX = activePhoneBox.x + activePhoneBox.width / 2
if (Math.abs(analyzerCenterX - phoneCenterX) > 1) throw new Error('Telephone spectrum analyzer must remain horizontally centered')
const analyzerBottom = analyzerBox.y + analyzerBox.height
const expectedAnalyzerBottom = activePhoneBox.y + activePhoneBox.height * (29 / 56)
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
await page.evaluate(() => {
  window.__telephoneAnalyzerMetrics.frames = 0
  window.__telephoneAnalyzerMetrics.fills = 0
})
await page.waitForTimeout(600)
const analyzerMetrics = await page.evaluate(() => ({ ...window.__telephoneAnalyzerMetrics }))
if (analyzerMetrics.frames < 8 || analyzerMetrics.frames > 22) {
  throw new Error(`Telephone analyzer should render near 30fps; observed ${analyzerMetrics.frames} frames in 600ms`)
}
if (analyzerMetrics.fills > analyzerMetrics.frames * 30) {
  throw new Error('Telephone analyzer should batch pixels into no more than three color segments per bar')
}
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

if (continuous) await slides.nth(2).scrollIntoViewIfNeeded()
else await dots.nth(2).click()
await page.waitForFunction(() => document.querySelector('.telephone-player--mobile')?.dataset.analyzerActive === 'false')
const visualFramesAfterLeaving = await page.evaluate(() => window.__telephoneAnalyzerMetrics.frames)
await page.waitForTimeout(250)
const offscreenState = await page.evaluate(() => ({
  frames: window.__telephoneAnalyzerMetrics.frames,
  paused: document.querySelector('.telephone-player--mobile audio')?.paused,
}))
if (offscreenState.frames > visualFramesAfterLeaving + 1) throw new Error('Offscreen Telephone analyzer continued rendering')
if (offscreenState.paused) throw new Error('Moving the Telephone analyzer offscreen should not pause audio')
if (continuous) await secondSlide.scrollIntoViewIfNeeded()
else await dots.nth(1).click()
await page.waitForFunction(() => document.querySelector('.telephone-player--mobile')?.dataset.analyzerActive === 'true')
await page.waitForTimeout(150)
if (await page.evaluate(() => window.__telephoneAnalyzerMetrics.frames) <= offscreenState.frames) {
  throw new Error('Telephone analyzer did not resume after returning onscreen')
}

const suspendsBeforeStop = await page.evaluate(() => window.__telephoneAnalyzerMetrics.suspends)
await telephoneButton.click()
await page.waitForFunction(() => document.querySelector('.telephone-player--mobile')?.dataset.state === 'idle')
const stoppedAudio = await audio.evaluate(element => ({ paused: element.paused, currentTime: element.currentTime }))
if (!stoppedAudio.paused || stoppedAudio.currentTime !== 0) throw new Error('Hanging up should stop and rewind Telephone')
if (await telephoneImage.getAttribute('src') !== '/assets/phone_on_hook.png') throw new Error('Stopped player should return to the on-hook phone')
if (await analyzer.count() !== 0) throw new Error('Spectrum analyzer should close when Telephone stops')
await page.waitForFunction(expected => window.__telephoneAnalyzerMetrics.suspends > expected, suspendsBeforeStop)
const resumesBeforeRestart = await page.evaluate(() => window.__telephoneAnalyzerMetrics.resumes)
await telephoneButton.click()
await page.waitForFunction(() => document.querySelector('.telephone-player--mobile')?.dataset.state === 'playing')
await page.waitForFunction(expected => window.__telephoneAnalyzerMetrics.resumes > expected, resumesBeforeRestart)
await telephoneButton.click()
await page.waitForFunction(() => document.querySelector('.telephone-player--mobile')?.dataset.state === 'idle')

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
