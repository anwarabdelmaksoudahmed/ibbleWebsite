import { test, expect } from '@playwright/test'

test.describe('Home', () => {
  test('home page renders', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/$|\/ar/)
  })

  test('login page renders', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByRole('heading', { name: /مرحباً بعودتك|Welcome back/i })).toBeVisible()
  })
})
