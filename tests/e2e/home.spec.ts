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
