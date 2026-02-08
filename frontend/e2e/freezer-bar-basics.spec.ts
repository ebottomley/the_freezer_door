import { test, expect } from '@playwright/test'

test.describe('Freezer Bar Basics Page', () => {
  test('navigates from homepage to basics page via link', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('The Freezer Door')).toBeVisible()

    // Click the basics link
    await page.click('text=Learn Freezer Bar Basics')

    // Should navigate to /basics
    await expect(page).toHaveURL(/\/basics/)
    await expect(page.getByRole('heading', { name: 'Freezer Bar Basics' })).toBeVisible()
  })

  test('displays all content sections', async ({ page }) => {
    await page.goto('/basics')
    await expect(page.getByRole('heading', { name: 'Freezer Bar Basics' })).toBeVisible()

    // Check intro text is visible
    await expect(page.getByText(/A freezer bar is a collection/i)).toBeVisible()

    // Check all section headings are visible
    await expect(page.getByRole('heading', { name: /What Makes a Drink Good/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /What is ABV/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /The Importance of Dilution/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Adjusting Bitters/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Scaling Recipes/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Sources/i })).toBeVisible()
  })

  test('displays ABV freezing point table', async ({ page }) => {
    await page.goto('/basics')

    // Check table exists with key data - use getByRole for table cells to be specific
    await expect(page.getByRole('cell', { name: '20%' })).toBeVisible()
    await expect(page.getByRole('cell', { name: '30%' })).toBeVisible()
    await expect(page.getByRole('cell', { name: '40%' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Freezes solid' })).toBeVisible()
  })

  test('back button returns to homepage', async ({ page }) => {
    await page.goto('/basics')
    await expect(page.getByRole('heading', { name: 'Freezer Bar Basics' })).toBeVisible()

    // Click back button
    await page.click('[aria-label="Back to home"]')

    // Should be back on homepage
    await expect(page).toHaveURL('/')
    await expect(page.getByText('Choose Your Cocktail')).toBeVisible()
  })

  test('displays sources section with all references', async ({ page }) => {
    await page.goto('/basics')

    await expect(page.getByText(/Death & Co/i)).toBeVisible()
    await expect(page.getByText(/Punch/i)).toBeVisible()
    await expect(page.getByText(/Imbibe/i)).toBeVisible()
    await expect(page.getByText(/Jeffrey Morgenthaler/i)).toBeVisible()
  })
})
