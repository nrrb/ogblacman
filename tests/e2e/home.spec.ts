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

test('events and merch provide launch-ready empty states', async ({ page }) => {
  await page.goto('/#shows')

  await expect(page.getByRole('heading', { name: 'No dates announced yet.' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Get show updates' })).toHaveAttribute('href', '#join')
  await expect(page.getByRole('heading', { name: 'The first drop is under wraps.' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Hear about the drop' })).toHaveAttribute('href', '#join')
  await page.waitForTimeout(1500)
  await expect(page.getByLabel('Black Buddha assistant').getByRole('status')).toHaveCount(0)
})

test('Black Buddha appears, can be dismissed and reopened without blocking navigation', async ({ page }) => {
  await page.goto('/')

  const assistant = page.getByLabel('Black Buddha assistant')
  const artwork = assistant.locator('img.black-buddha__art')
  await expect(artwork).toBeVisible()
  await expect(artwork).toHaveAttribute('src', '/images/black-buddha-love.png')
  await expect(assistant.getByRole('status')).toContainText('You found the frequency')
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
  await expect(assistant.getByRole('status')).toContainText('tree listens to time')
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
  await expect(player.locator('h2')).toHaveText(secondTrack.title)
  await expect(player.getByRole('button', { name: 'Pause', exact: true })).toBeVisible()

  const timeline = player.getByRole('slider', { name: 'Seek current track' })
  await timeline.fill('42')
  await player.getByRole('button', { name: 'Pause', exact: true }).click()
  await expect(timeline).toHaveValue('42')

  await page.reload()
  await expect(player.locator('h2')).toHaveText(secondTrack.title)
  await expect(player.getByRole('button', { name: 'Play', exact: true })).toBeVisible()
  await expect(timeline).toHaveValue('42')
})

test('OGAmp animates its spectrum and collapses its playlist', async ({ page }) => {
  await page.goto('/')

  const player = page.getByLabel('OGAmp music player')
  const spectrumBars = player.locator('[data-testid="ogamp-spectrum"] .ogamp__spectrum-bar')
  await expect(spectrumBars).toHaveCount(14)
  const idleLevels = await spectrumBars.evaluateAll((bars) => bars.map((bar) => bar.getAttribute('data-level')))

  await player.getByRole('button', { name: 'Play', exact: true }).click()
  await expect(player.locator('[data-testid="ogamp-spectrum"]')).toHaveClass(/is-playing/)
  await page.waitForTimeout(180)
  const firstActiveLevels = await spectrumBars.evaluateAll((bars) => bars.map((bar) => bar.getAttribute('data-level')))
  expect(firstActiveLevels).not.toEqual(idleLevels)
  await page.waitForTimeout(180)
  const secondActiveLevels = await spectrumBars.evaluateAll((bars) => bars.map((bar) => bar.getAttribute('data-level')))
  expect(secondActiveLevels).not.toEqual(firstActiveLevels)

  await player.getByRole('button', { name: 'Open playlist' }).click()
  await expect(page.getByRole('region', { name: 'Playlist' })).toBeVisible()
  await expect(page.locator('[data-track-slug]')).toHaveCount(tracks.length)
  await player.getByRole('button', { name: 'Hide playlist' }).click()
  await expect(page.getByRole('region', { name: 'Playlist' })).toHaveCount(0)
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
