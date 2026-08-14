import { expect, test } from '@playwright/test'

import tracks from '../../src/content/playlist.json' with { type: 'json' }

const [firstTrack, secondTrack] = tracks

if (!firstTrack || !secondTrack) throw new Error('The OGAmp browser checks require at least two playlist tracks.')

test('home presents the artist and core sections', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1, name: 'OG Blacman' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Music' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Upcoming shows' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Merch' })).toBeVisible()
  await expect(page.getByLabel('OGAmp music player')).toBeVisible()

  const layout = await page.evaluate(() => {
    const gameScene = document.querySelector<HTMLElement>('.tree-game__scene')
    return {
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      gameSceneRatio: gameScene ? gameScene.clientWidth / gameScene.clientHeight : 0,
    }
  })

  expect(layout.hasHorizontalOverflow).toBe(false)
  expect(layout.gameSceneRatio).toBeCloseTo(0.8, 1)
})

test('mailing-list form exposes labelled fields and its unconfigured state', async ({ page }) => {
  await page.goto('/#join')

  // Builds without VITE_KIT_FORM_ACTION render the form inert rather than
  // failing on submit. Validation and success/error handling are covered in
  // src/components/SignupForm.test.ts, which can configure the endpoint.
  await expect(page.getByLabel('Email')).toBeDisabled()
  await expect(page.getByLabel(/first name/i)).toBeDisabled()
  await expect(page.getByRole('button', { name: 'List Opens Soon' })).toBeDisabled()
})

test('events and merch provide launch-ready empty states', async ({ page }) => {
  await page.goto('/#shows')

  await expect(page.getByRole('heading', { name: 'The play pen is empty' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Tell Me First' })).toHaveAttribute('href', '#join')
  await expect(page.getByRole('heading', { name: "Store's not open" })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Put Me On The List' })).toHaveAttribute('href', '#join')
  await page.waitForTimeout(1500)
  await expect(page.getByLabel('Black Buddha assistant').getByRole('status')).toHaveCount(0)
})

test('Black Buddha appears, can be dismissed and reopened without blocking navigation', async ({ page }) => {
  await page.goto('/')

  const assistant = page.getByLabel('Black Buddha assistant')
  const artwork = assistant.locator('img.black-buddha__art')
  await expect(artwork).toBeVisible()
  await expect(artwork).toHaveAttribute('src', '/images/black-buddha-love.png')
  await expect(assistant.getByRole('status')).toContainText('Press play before you start scrolling')
  await assistant.getByRole('button', { name: 'Dismiss Black Buddha' }).click()
  await expect(assistant.getByRole('status')).toBeHidden()

  await page.getByRole('button', { name: 'Open Black Buddha' }).click()
  await expect(assistant.getByRole('status')).toBeVisible()
  await assistant.getByRole('button', { name: 'Dismiss Black Buddha' }).click()

  const navigationToggle = page.getByRole('button', { name: 'Open navigation' })
  if (await navigationToggle.isVisible()) await navigationToggle.click()
  await page.getByRole('link', { name: 'Music', exact: true }).click()
  await expect(page).toHaveURL(/\/#music$/)
})

test('Black Buddha reacts to the game and moves away from the hold control', async ({ page }) => {
  await page.goto('/#game')

  const assistant = page.getByLabel('Black Buddha assistant')
  const hug = page.getByRole('button', { name: 'HUG', exact: true })
  await hug.focus()
  await page.keyboard.down('Space')
  await expect(assistant.getByRole('status')).toContainText("don't be tapping it like an elevator")
  await expect(assistant).toHaveClass(/black-buddha--avoid-controls/)

  const overlaps = await page.evaluate(() => {
    const assistantBox = document.querySelector('.black-buddha')?.getBoundingClientRect()
    const hugBox = document.querySelector('.tree-game__hug')?.getBoundingClientRect()
    if (!assistantBox || !hugBox) return true
    return !(
      assistantBox.right <= hugBox.left ||
      assistantBox.left >= hugBox.right ||
      assistantBox.bottom <= hugBox.top ||
      assistantBox.top >= hugBox.bottom
    )
  })
  expect(overlaps).toBe(false)
  await page.keyboard.up('Space')
})

test('release deep link renders directly with unique metadata', async ({ page }) => {
  await page.goto('/music/next-transmission')

  await expect(page.getByRole('heading', { level: 1, name: 'Next Transmission' })).toBeVisible()
  await expect(page).toHaveTitle('Next Transmission | OG Blacman')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://ogblacman.com/music/next-transmission',
  )
})

test('OGAmp loads the current audio and keeps playing across route navigation', async ({ page }) => {
  const audioResponse = page.waitForResponse(
    (response) => response.url().endsWith(firstTrack.audioUrl) && response.status() < 400,
  )

  await page.goto('/')
  await audioResponse

  const player = page.getByLabel('OGAmp music player')
  await player.getByRole('button', { name: 'Play', exact: true }).click()
  await expect(player.getByRole('button', { name: 'Pause', exact: true })).toBeVisible()

  await page.getByRole('link', { name: 'Details' }).click()
  await expect(page).toHaveURL(/\/music\/next-transmission$/)
  await expect(player.getByRole('button', { name: 'Pause', exact: true })).toBeVisible()
})

test('OGAmp selects, seeks, and restores a track without forced autoplay', async ({ page }) => {
  await page.goto('/')

  const player = page.getByLabel('OGAmp music player')
  await player.getByRole('button', { name: 'Open playlist' }).click()
  await expect(page.getByRole('region', { name: 'Playlist' })).toBeVisible()
  await page.locator(`[data-track-slug="${secondTrack.slug}"]`).click()
  await expect(player.locator('.ogamp__title')).toHaveText(secondTrack.title)
  await expect(player.getByRole('button', { name: 'Pause', exact: true })).toBeVisible()

  const timeline = player.getByRole('slider', { name: 'Seek current track' })
  await timeline.fill('42')
  await player.getByRole('button', { name: 'Pause', exact: true }).click()
  await expect(timeline).toHaveValue('42')

  await page.reload()
  await expect(player.locator('.ogamp__title')).toHaveText(secondTrack.title)
  await expect(player.getByRole('button', { name: 'Play', exact: true })).toBeVisible()
  await expect(timeline).toHaveValue('42')
})

test('OGAmp animates its spectrum and collapses its playlist', async ({ page }) => {
  await page.goto('/')

  const player = page.getByLabel('OGAmp music player')
  const spectrum = player.locator('[data-testid="ogamp-spectrum"]')
  await expect(spectrum).toHaveJSProperty('tagName', 'CANVAS')
  const idleFrame = await spectrum.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())

  await player.getByRole('button', { name: 'Play', exact: true }).click()
  await expect(spectrum).toHaveClass(/is-playing/)
  await page.waitForTimeout(100)
  const firstActiveFrame = await spectrum.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())
  expect(firstActiveFrame).not.toEqual(idleFrame)
  await page.waitForTimeout(100)
  const secondActiveFrame = await spectrum.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())
  expect(secondActiveFrame).not.toEqual(firstActiveFrame)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.waitForTimeout(50)
  const reducedMotionFrame = await spectrum.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())
  await page.waitForTimeout(100)
  expect(await spectrum.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())).toEqual(reducedMotionFrame)

  await player.getByRole('button', { name: 'Open playlist' }).click()
  await expect(page.getByRole('region', { name: 'Playlist' })).toBeVisible()
  await expect(page.locator('[data-track-slug]')).toHaveCount(tracks.length)
  await player.getByRole('button', { name: 'Hide playlist' }).click()
  await expect(page.getByRole('region', { name: 'Playlist' })).toHaveCount(0)
})

test('OGAmp stays a compact bar and its playlist dismisses on outside input', async ({ page }) => {
  await page.goto('/')

  const player = page.getByLabel('OGAmp music player')
  const drawer = page.getByRole('region', { name: 'Playlist' })
  const open = player.getByRole('button', { name: 'Open playlist' })

  // The transport is a bar, not a panel: it must not eat the viewport.
  const bar = await player.boundingBox()
  expect(bar!.height).toBeLessThan(110)
  const viewport = page.viewportSize()!
  expect(bar!.height).toBeLessThan(viewport.height * 0.2)

  // The drawer opens above the bar without displacing the transport, so the
  // controls never move out from under the user's finger.
  await open.click()
  await expect(drawer).toBeVisible()
  const drawerBox = await drawer.boundingBox()
  expect(drawerBox!.y).toBeLessThan(bar!.y)
  expect((await player.boundingBox())!.y).toBeCloseTo(bar!.y, 0)

  // Pressing anywhere outside the player dismisses it.
  await page.locator('#story').click({ position: { x: 10, y: 10 } })
  await expect(drawer).toHaveCount(0)

  // Scrolling the page dismisses it.
  await open.click()
  await expect(drawer).toBeVisible()
  await page.mouse.wheel(0, 400)
  await expect(drawer).toHaveCount(0)

  // Escape dismisses it.
  await open.click()
  await expect(drawer).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(drawer).toHaveCount(0)
})

test('Tree Hugging completes, awards the target score, and resets', async ({ page }) => {
  await page.goto('/#game')

  const game = page.locator('.tree-game')
  const hug = page.getByRole('button', { name: 'HUG', exact: true })
  await hug.focus()
  await page.keyboard.down('Space')
  await page.waitForTimeout(4400)
  await page.keyboard.up('Space')

  await expect(game).toHaveAttribute('data-complete', 'true')
  await expect(page.getByText('ROOTED IN CHICAGO')).toBeVisible()
  const scoreText = await game.locator('.tree-game__score strong').innerText()
  const score = Number(scoreText.replace(/[$,]/g, ''))
  expect(score).toBeGreaterThanOrEqual(1000)
  expect(score).toBeLessThanOrEqual(5000)

  await page.getByRole('button', { name: 'Reset game' }).click()
  await expect(game).toHaveAttribute('data-complete', 'false')
  await expect(game.locator('.tree-game__score strong')).toHaveText('$0')
})
