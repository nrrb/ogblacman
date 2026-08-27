import { chromium } from 'playwright'

const url = process.env.TEST_URL || 'http://127.0.0.1:4173/'
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
})
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
const videoPreloads = page.locator('link[rel="preload"][as="video"]')
if (await videoPreloads.count() !== 1) throw new Error('Tree Phone video should have a preload hint')
if (!(await videoPreloads.first().getAttribute('href')).includes('/assets/tree-phone/tree-phone.mp4')) throw new Error('Tree Phone video preload is missing')
const imagePreloads = page.locator('link[rel="preload"][as="image"]')
if (await imagePreloads.count() !== 1) throw new Error('Telephone cover should have one responsive preload hint')
if (!(await imagePreloads.first().getAttribute('href')).includes('telephone-cover-640.webp')) throw new Error('Telephone cover preload is missing')
if (await page.locator('.grain-overlay').count() !== 0) throw new Error('Deleted grain overlay should not render')
if (await page.locator('.text-cta__texture').count() !== 0) throw new Error('Deleted CTA texture should not render')
if (!(await page.locator('.site--mobile').isVisible())) {
  throw new Error('Mobile experience is hidden in the 480–767px breakpoint range')
}
if (await page.locator('.site--desktop').count() !== 0) {
  throw new Error('Desktop experience should not mount below the mobile breakpoint')
}
const initialHeroSources = page.locator('#mobile-hero-video source')
if (!/^video\/webm; codecs="vp9"$/.test(await initialHeroSources.first().getAttribute('type'))) {
  throw new Error('Hero video should prefer an explicitly declared VP9 source')
}

await page.setViewportSize({ width: 390, height: 844 })
await page.reload({ waitUntil: 'load' })
await page.waitForTimeout(1000)

const slider = page.locator('.mobile-slider')
const continuous = await slider.evaluate(element => element.classList.contains('mobile-slider--continuous'))
const dots = page.locator('.slider-dot')
const slides = page.locator('.mobile-slide')
const expectedSlideIds = ['hero', 'featured-release', 'shows', 'merch', 'mailing-list']
const heroBackground = page.locator('#hero .background-media')
const releaseBackground = page.locator('#featured-release .background-media')
const showsBackground = page.locator('#shows .background-media')
const merchBackground = page.locator('#merch .background-media')
const newsletterBackground = page.locator('#mailing-list .background-media')

if (await heroBackground.getAttribute('data-media-loaded') !== 'true') throw new Error('Mobile hero media should load immediately')
if (await heroBackground.getAttribute('data-media-visible') !== 'true') throw new Error('Mobile hero media should begin visible')
if (await releaseBackground.getAttribute('data-media-loaded') !== 'true') throw new Error('The approaching release background should preload')
if (await releaseBackground.getAttribute('data-media-visible') !== 'false') throw new Error('The approaching release background should remain paused')
for (const [name, background] of [
  ['shows', showsBackground],
  ['merch', merchBackground],
  ['newsletter', newsletterBackground],
]) {
  if (await background.getAttribute('data-media-loaded') !== 'false') throw new Error(`${name} mobile background loaded too early`)
  if (await background.locator('source[src]').count() !== 0) throw new Error(`${name} mobile background sources were attached too early`)
}

if (continuous) {
  if (await dots.count() !== 0) throw new Error('Continuous mobile scrolling should not show slide navigation dots')
  if (await slides.count() !== expectedSlideIds.length) throw new Error('Visible section statuses did not produce the expected mobile panels')
  for (let index = 0; index < expectedSlideIds.length; index += 1) {
    if (await slides.nth(index).getAttribute('id') !== expectedSlideIds[index]) throw new Error('Mobile panel order does not match the content model')
    if (await slides.nth(index).getAttribute('aria-hidden') !== null) throw new Error('Continuous mobile panels should remain accessible')
    if (await slides.nth(index).getAttribute('inert') !== null) throw new Error('Continuous mobile panels should not be inert')
  }
  for (let index = 1; index < expectedSlideIds.length; index += 1) {
    const isolation = await slides.nth(index).evaluate(element => getComputedStyle(element).isolation)
    if (isolation !== 'isolate') throw new Error('Continuous mobile panel did not contain its negative-z-index video background')
  }
  const viewportHeight = await page.evaluate(() => window.innerHeight)
  const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight)
  if (documentHeight < viewportHeight * 4.5) throw new Error('Continuous mobile panels do not create a full vertical document')
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.mouse.wheel(0, 600)
  await page.waitForTimeout(150)
  if (await page.evaluate(() => window.scrollY) <= 0) throw new Error('Continuous mobile mode did not allow native document scrolling')
} else {
  if (await dots.count() !== expectedSlideIds.length) throw new Error('Visible section statuses did not produce the expected navigation dots')
  await dots.nth(expectedSlideIds.length - 1).click()
  await page.waitForTimeout(350)
  await page.keyboard.press('ArrowDown')
  await page.waitForTimeout(350)
  if (await slides.nth(expectedSlideIds.length - 1).getAttribute('aria-hidden') !== 'false') throw new Error('Discrete navigation wrapped past the final slide')
  await dots.nth(0).click()
  await page.waitForTimeout(350)
  await page.keyboard.press('ArrowUp')
  await page.waitForTimeout(350)
  if (await slides.nth(0).getAttribute('aria-hidden') !== 'false') throw new Error('Discrete navigation wrapped before the first slide')
}

const releaseSlideIndex = expectedSlideIds.indexOf('featured-release')
const secondSlide = page.locator('#featured-release')
if (continuous) await secondSlide.scrollIntoViewIfNeeded()
else await dots.nth(releaseSlideIndex).click()
await page.waitForTimeout(350)
if (await heroBackground.getAttribute('data-media-visible') !== 'false') throw new Error('Off-screen mobile hero should pause')
if (await releaseBackground.getAttribute('data-media-visible') !== 'true') throw new Error('Visible release background should play')
if (await showsBackground.getAttribute('data-media-loaded') !== 'true') throw new Error('The approaching shows background should preload')
for (const [name, background] of [['merch', merchBackground], ['newsletter', newsletterBackground]]) {
  if (await background.getAttribute('data-media-loaded') !== 'false') throw new Error(`${name} mobile background loaded during release view`)
}
if (!continuous && await secondSlide.getAttribute('aria-hidden') !== 'false') throw new Error('Second slide did not activate')
if (await secondSlide.locator('.display-heading').count() !== 0) throw new Error('Hot release heading should be hidden')
const releaseDetails = await secondSlide.locator('.release-spotlight__details').innerText()
if (!releaseDetails.includes('Telephone')) throw new Error('Telephone release title is missing')
if (!releaseDetails.includes('AUGUST 26, 2026')) throw new Error('Telephone release date is missing')
const editorialArt = secondSlide.locator('.release-spotlight__initial')
if (!(await editorialArt.isVisible())) throw new Error('Telephone cover artwork is missing')
if (await editorialArt.getAttribute('src') !== '/assets/telephone-cover.png') {
  throw new Error('Telephone release uses the wrong editorial artwork')
}
if (!new URL(await editorialArt.evaluate(element => element.currentSrc)).pathname.endsWith('/assets/telephone-cover-320.webp')) {
  throw new Error('Mobile release artwork should use an appropriately sized responsive image')
}
const editorialArtBox = await editorialArt.boundingBox()
const releaseTextBox = await secondSlide.locator('.release-spotlight__text').boundingBox()
const releaseTitleBox = await secondSlide.locator('.release-spotlight__title').boundingBox()
const releaseCopyBox = await secondSlide.locator('.release-spotlight__copy').boundingBox()
const releaseCta = secondSlide.locator('.release-spotlight__cta')
const releaseCtaBox = await releaseCta.boundingBox()
if (!editorialArtBox || !releaseTextBox || !releaseTitleBox || !releaseCopyBox || !releaseCtaBox) throw new Error('Telephone editorial layout is not measurable')
if (editorialArtBox.y <= releaseCopyBox.y + releaseCopyBox.height) {
  throw new Error('Telephone cover artwork must sit beneath the Telephone description')
}
if (editorialArtBox.width < releaseTextBox.width * .9 || editorialArtBox.width > releaseTextBox.width * .95) {
  throw new Error('Mobile Telephone cover artwork should fill 93% of the release column')
}
if (Math.abs(editorialArtBox.x + editorialArtBox.width / 2 - (releaseTextBox.x + releaseTextBox.width / 2)) > 1) {
  throw new Error('Mobile Telephone cover artwork must be centered')
}
for (const [elementName, box] of [['title', releaseTitleBox], ['description', releaseCopyBox], ['DistroKid CTA', releaseCtaBox]]) {
  if (Math.abs(box.x + box.width / 2 - (releaseTextBox.x + releaseTextBox.width / 2)) > 1) {
    throw new Error(`Mobile Telephone ${elementName} must be centered`)
  }
}
if (await releaseCta.getAttribute('href') !== 'https://distrokid.com/hyperfollow/ogblacman/telephone?ref=release') {
  throw new Error('Telephone DistroKid link is incorrect')
}
if (await releaseCta.getAttribute('target') !== '_blank') throw new Error('Telephone DistroKid link should open in a new tab')
const telephonePlayer = secondSlide.locator('.telephone-player--mobile')
const telephoneButton = telephonePlayer.locator('.telephone-player__button')
const telephoneVideo = telephonePlayer.locator('.telephone-player__video')
const interactionPrompt = telephonePlayer.locator('.telephone-player__interaction-prompt')
const audio = telephonePlayer.locator('audio')
if (await telephoneButton.getAttribute('aria-label') !== 'Pick up Telephone') throw new Error('Tree Phone should invite pickup')
if (await telephoneVideo.getAttribute('poster') !== '/assets/tree-phone/tree-phone-first.webp') throw new Error('Tree Phone should use its optimized first-frame poster')
const promptLines = await interactionPrompt.locator('.telephone-player__prompt-line').allTextContents()
if (promptLines.join('|') !== 'pick|up my|line') throw new Error('Telephone lyric interaction prompt lines are missing')
if (await interactionPrompt.locator('.telephone-player__prompt-arrow').textContent() !== '<-') throw new Error('Telephone lyric interaction arrow is missing')
if (!(await interactionPrompt.evaluate(element => getComputedStyle(element).fontFamily)).includes('Tajamuka Script')) {
  throw new Error('Telephone interaction prompt must use Tajamuka Script')
}
const idleButtonBox = await telephoneButton.boundingBox()
const interactionPromptBox = await interactionPrompt.boundingBox()
if (!idleButtonBox || !interactionPromptBox || !releaseCtaBox) throw new Error('Idle Tree Phone spacing is not measurable')
if (interactionPromptBox.x < idleButtonBox.x + idleButtonBox.width / 2 - 4) throw new Error('Telephone interaction prompt must sit to the right of the phone')
const artworkToCtaGap = releaseCtaBox.y - (editorialArtBox.y + editorialArtBox.height)
const videoBox = await telephoneVideo.boundingBox()
if (!videoBox) throw new Error('Tree Phone video spacing is not measurable')
const ctaToPhoneGap = videoBox.y - (releaseCtaBox.y + releaseCtaBox.height)
if (ctaToPhoneGap > artworkToCtaGap + 6) throw new Error('CTA-to-phone spacing should match the artwork-to-CTA rhythm')
await telephoneButton.click()
await page.waitForFunction(() => document.querySelector('.telephone-player--mobile')?.dataset.state === 'playing')
if (await telephoneButton.getAttribute('aria-label') !== 'Hang up Telephone') throw new Error('Playing Tree Phone should invite hangup')
if (await telephoneVideo.evaluate((element) => element.paused)) throw new Error('Tree Phone video should play after pickup')
if (await telephoneVideo.evaluate((element) => element.playbackRate !== 2)) throw new Error('Tree Phone video should play at 2x speed')
if (await interactionPrompt.count() !== 1) throw new Error('Telephone interaction prompt column must remain after pickup')
const activeButtonBox = await telephoneButton.boundingBox()
const activePromptBox = await interactionPrompt.boundingBox()
if (!idleButtonBox || !interactionPromptBox || !activeButtonBox || !activePromptBox) throw new Error('Telephone player layout is not measurable')
if (Math.abs(activeButtonBox.height - idleButtonBox.height) > 1) throw new Error('Telephone player height must remain stable between states')
for (const dimension of ['x', 'y', 'width', 'height']) {
  if (Math.abs(activeButtonBox[dimension] - idleButtonBox[dimension]) > 1) throw new Error(`Telephone button ${dimension} shifted after pickup`)
  if (Math.abs(activePromptBox[dimension] - interactionPromptBox[dimension]) > 1) throw new Error(`Telephone prompt ${dimension} shifted after pickup`)
}
if (await secondSlide.locator('.streaming-link').count() !== 0) throw new Error('Top pick streaming links should be removed')

await page.waitForFunction(() => {
  const video = document.querySelector('.telephone-player--mobile video')
  const audio = document.querySelector('.telephone-player--mobile audio')
  return video?.currentTime > video.duration / 2 && !audio?.paused && audio.volume > 0
})
await page.waitForFunction(() => document.querySelector('.telephone-player--mobile')?.dataset.state === 'ended', null, { timeout: 10000 })
const endedButtonBox = await telephoneButton.boundingBox()
if (!endedButtonBox) throw new Error('Ended Tree Phone layout is not measurable')
for (const dimension of ['x', 'y', 'width', 'height']) {
  if (Math.abs(endedButtonBox[dimension] - idleButtonBox[dimension]) > 1) throw new Error(`Telephone button ${dimension} shifted after playback`)
}
const volumeBeforeReverse = await audio.evaluate(element => element.volume)
await telephoneButton.click()
await page.waitForFunction(() => document.querySelector('.telephone-player--mobile')?.dataset.state === 'reversing')
await page.waitForTimeout(150)
const volumeDuringReverse = await audio.evaluate(element => element.volume)
if (volumeDuringReverse >= volumeBeforeReverse) throw new Error('Hanging up should fade Telephone audio out')
await page.waitForFunction(() => document.querySelector('.telephone-player--mobile')?.dataset.state === 'idle', null, { timeout: 10000 })
const stoppedAudio = await audio.evaluate(element => ({ paused: element.paused, volume: element.volume, currentTime: element.currentTime }))
if (!stoppedAudio.paused || stoppedAudio.volume !== 0 || stoppedAudio.currentTime !== 0) throw new Error('Hanging up should stop and rewind Telephone audio')

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

const showsSlideIndex = expectedSlideIds.indexOf('shows')
const showsSlide = page.locator('#shows')
if (continuous) await showsSlide.scrollIntoViewIfNeeded()
else await dots.nth(showsSlideIndex).click()
await page.waitForTimeout(250)

if (continuous) await showsSlide.scrollIntoViewIfNeeded()
else await dots.nth(showsSlideIndex).click()
await page.waitForTimeout(350)
if (await showsSlide.locator('.show-link').count() !== 0) throw new Error('Placeholder show listings should not render')
if (!(await showsSlide.locator('.show-empty').isVisible())) throw new Error('Shows coming-soon treatment is missing')
if (await showsSlide.locator('.show-empty__cta').getAttribute('href') !== '#mailing-list') throw new Error('Show alerts CTA should link to the mailing list')
if (await page.locator('.site--mobile .manager-card').count() !== 0) throw new Error('Hidden Booking panel should not render on mobile')

const merchSlideIndex = expectedSlideIds.indexOf('merch')
const merchSlide = page.locator('#merch')
if (continuous) await merchSlide.scrollIntoViewIfNeeded()
else await dots.nth(merchSlideIndex).click()
await page.waitForTimeout(350)
if (await merchSlide.locator('.logo-marquee').count() !== 0) throw new Error('An empty merch carousel should not render')
if (!(await merchSlide.locator('.merch-empty').isVisible())) throw new Error('Merch coming-soon treatment is missing')
if (await merchSlide.locator('.merch-empty__cta').getAttribute('href') !== '#mailing-list') throw new Error('Merch alerts CTA should link to the mailing list')

const newsletterSlideIndex = expectedSlideIds.indexOf('mailing-list')
const newsletterSlide = page.locator('#mailing-list')
if (continuous) await newsletterSlide.scrollIntoViewIfNeeded()
else await dots.nth(newsletterSlideIndex).click()
await page.waitForTimeout(350)
const form = newsletterSlide.locator('form')
await form.waitFor({ state: 'visible', timeout: 15_000 })
if (await form.getAttribute('data-uid') !== 'bb5435c1d3') throw new Error('Official Kit form embed did not initialize')
if (await form.locator('input[name="fields[first_name]"]').getAttribute('required') !== null) throw new Error('Newsletter first name field should be optional')
if (await form.locator('input[name="email_address"]').getAttribute('required') === null) throw new Error('Newsletter email field should be required')
if (await form.locator('label[for="mobile-newsletter-first-name"]').textContent() !== 'First name (optional)') throw new Error('Newsletter first-name label does not use editorial copy')
if (await form.locator('label[for="mobile-newsletter-email"]').textContent() !== 'Email address * (required)') throw new Error('Newsletter email label does not use editorial copy')
if (await form.locator('[data-element="submit"] span').innerText() !== 'STAY IN THE LOOP') throw new Error('Newsletter CTA label is incorrect')
if (await form.locator('[data-element="submit"]').getAttribute('data-submitting-label') !== 'SIGNING YOU UP…') throw new Error('Newsletter submitting copy is missing')
await form.locator('input[name="email_address"]').fill('local@example.test')
await form.locator('[data-element="submit"]').click()
await newsletterSlide.locator('.formkit-alert-success').waitFor({ state: 'visible' })
if (new URL(page.url()).origin !== new URL(url).origin) throw new Error('Kit form unexpectedly navigated')

await page.setViewportSize({ width: 900, height: 844 })
await page.locator('.site--desktop').waitFor({ state: 'visible' })
if (await page.locator('.site--desktop .manager-card').count() !== 0) throw new Error('Hidden Booking section should not render on desktop')
await page.locator('.site--desktop #mailing-list .newsletter-footer').waitFor({ state: 'visible' })
const desktopRelease = page.locator('.site--desktop .top-pick-release')
const desktopEditorialArt = desktopRelease.locator('.release-spotlight__initial')
const desktopEditorialArtBox = await desktopEditorialArt.boundingBox()
const desktopReleaseTextBox = await desktopRelease.locator('.release-spotlight__text').boundingBox()
const desktopReleaseTitleBox = await desktopRelease.locator('.release-spotlight__title').boundingBox()
const desktopReleaseCopyBox = await desktopRelease.locator('.release-spotlight__copy').boundingBox()
const desktopReleaseCtaBox = await desktopRelease.locator('.release-spotlight__cta').boundingBox()
if (!desktopEditorialArtBox || !desktopReleaseTextBox || !desktopReleaseTitleBox || !desktopReleaseCopyBox || !desktopReleaseCtaBox) throw new Error('Desktop Telephone editorial layout is not measurable')
if (desktopEditorialArtBox.y <= desktopReleaseCopyBox.y + desktopReleaseCopyBox.height) {
  throw new Error('Desktop Telephone cover artwork must sit beneath the Telephone description')
}
if (desktopEditorialArtBox.width < desktopReleaseTextBox.width * .9 || desktopEditorialArtBox.width > desktopReleaseTextBox.width * .95) {
  throw new Error('Desktop Telephone cover artwork should fill 93% of the release column')
}
if (Math.abs(desktopEditorialArtBox.x + desktopEditorialArtBox.width / 2 - (desktopReleaseTextBox.x + desktopReleaseTextBox.width / 2)) > 1) {
  throw new Error('Desktop Telephone cover artwork must be centered')
}
for (const [elementName, box] of [['title', desktopReleaseTitleBox], ['description', desktopReleaseCopyBox], ['DistroKid CTA', desktopReleaseCtaBox]]) {
  if (Math.abs(box.x + box.width / 2 - (desktopReleaseTextBox.x + desktopReleaseTextBox.width / 2)) > 1) {
    throw new Error(`Desktop Telephone ${elementName} must be centered`)
  }
}
if (!new URL(await desktopEditorialArt.evaluate(element => element.currentSrc)).pathname.endsWith('/assets/telephone-cover-640.webp')) {
  throw new Error('Desktop release artwork should use an appropriately sized responsive image')
}
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

const reducedMotionPage = await browser.newPage({
  viewport: { width: 390, height: 844 },
  reducedMotion: 'reduce',
})
await reducedMotionPage.goto(url, { waitUntil: 'load' })
const reducedMotionHero = reducedMotionPage.locator('#mobile-hero-video')
await reducedMotionHero.waitFor({ state: 'attached' })
if (await reducedMotionHero.getAttribute('preload') !== 'none') throw new Error('Reduced-motion hero should not preload video')
if (await reducedMotionHero.locator('source[src]').count() !== 0) throw new Error('Reduced-motion hero should not attach video sources')
if (!(await reducedMotionHero.evaluate(element => element.paused))) throw new Error('Reduced-motion hero should remain paused')
await reducedMotionPage.close()

await browser.close()
console.log(`Mobile ${continuous ? 'continuous scrolling' : 'discrete navigation'} and safe local form behavior passed.`)
