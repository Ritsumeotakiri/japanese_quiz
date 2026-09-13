import { expect, test } from '@playwright/test'

test('player can select a level and complete a quiz', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Japanese, one question/i })).toBeVisible()
  await page.getByRole('button', { name: /N3 oriented/i }).click()
  await page.getByRole('button', { name: /Start quiz/i }).click()
  await expect(page.getByText('SINGLE ANSWER')).toBeVisible()
  await page.getByRole('button', { name: 'A influence' }).click()
  await page.getByRole('button', { name: /Next question/i }).click()
})
