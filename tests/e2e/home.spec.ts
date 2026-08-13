import { expect, test } from '@playwright/test'

test('home presents the artist and core sections', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1, name: 'OG Blacman' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Music' })).toBeVisible()
  await expect(page.getByLabel('OGAmp music player')).toBeVisible()

  const layout = await page.evaluate(() => {
    const gameImage = document.querySelector<HTMLImageElement>('.pixel-window img')
    return {
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      gameImageRatio: gameImage ? gameImage.clientWidth / gameImage.clientHeight : 0,
    }
  })

  expect(layout.hasHorizontalOverflow).toBe(false)
  expect(layout.gameImageRatio).toBeCloseTo(1, 1)
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

test('OGAmp loads sample audio and keeps playing across route navigation', async ({ page }) => {
  const audioResponse = page.waitForResponse(
    (response) => response.url().endsWith('/music/01-dungeon-crawl.mp3') && response.status() < 400,
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
  await page.getByRole('button', { name: /02 Overworld Rush/ }).click()
  await expect(player.getByText('Overworld Rush', { exact: true })).toBeVisible()
  await expect(player.getByRole('button', { name: 'Pause', exact: true })).toBeVisible()

  const timeline = player.getByRole('slider', { name: 'Seek current track' })
  await timeline.fill('42')
  await player.getByRole('button', { name: 'Pause', exact: true }).click()
  await expect(timeline).toHaveValue('42')

  await page.reload()
  await expect(player.getByText('Overworld Rush', { exact: true })).toBeVisible()
  await expect(player.getByRole('button', { name: 'Play', exact: true })).toBeVisible()
  await expect(timeline).toHaveValue('42')
})
