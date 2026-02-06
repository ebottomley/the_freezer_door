import { test, expect } from '@playwright/test'

test.describe('Simplify Recipe Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to martini calculator directly via URL
    await page.goto('/cocktail/martini')
    // Wait for page to load
    await expect(page.getByText('The Freezer Door')).toBeVisible()
    // Wait for cocktail selector to load
    await expect(page.getByText('Select Cocktail')).toBeVisible()
  })

  test('toggle is visible after calculation', async ({ page }) => {
    // Toggle should not be visible before calculation
    await expect(page.getByRole('button', { name: /simplify measurements/i })).not.toBeVisible()

    // Martini and classic variation should be pre-selected via URL
    // Wait for spirit selectors to load
    await expect(page.getByRole('heading', { name: 'Select Spirits' })).toBeVisible()

    // Calculate recipe
    await page.getByRole('button', { name: /calculate recipe/i }).click()

    // Wait for results
    await expect(page.getByText('Classic (4:1) - Freezer Batch')).toBeVisible()

    // Toggle should now be visible
    await expect(page.getByRole('button', { name: /simplify measurements/i })).toBeVisible()
  })

  test('clicking toggle changes displayed values', async ({ page }) => {
    // Wait for spirit selectors to load
    await expect(page.getByRole('heading', { name: 'Select Spirits' })).toBeVisible()

    // Calculate recipe
    await page.getByRole('button', { name: /calculate recipe/i }).click()

    // Wait for results
    await expect(page.getByText('Classic (4:1) - Freezer Batch')).toBeVisible()

    // Get water amount before toggle (should be exact decimal value)
    const waterAmountBefore = await page.locator('.water-highlight .primary-amount').textContent()
    expect(waterAmountBefore).toMatch(/\d+\.\d+/) // Contains decimal

    // Click toggle
    await page.getByRole('button', { name: /simplify measurements/i }).click()

    // Toggle should be active
    await expect(page.getByRole('button', { name: /simplify measurements/i })).toHaveClass(/active/)

    // Get water amount after toggle (should be rounded to nearest 5ml or quarter oz)
    const waterAmountAfter = await page.locator('.water-highlight .primary-amount').textContent()

    // Values should be different (exact vs simplified)
    expect(waterAmountAfter).not.toBe(waterAmountBefore)
  })

  test('simplified values end in 0 or 5 for ml', async ({ page }) => {
    // Wait for spirit selectors to load
    await expect(page.getByRole('heading', { name: 'Select Spirits' })).toBeVisible()

    // Ensure ml is selected via the unit dropdown (should be default)
    const unitSelect = page.locator('select').filter({ hasText: /Milliliters/ })
    await unitSelect.selectOption('ml')

    // Calculate recipe
    await page.getByRole('button', { name: /calculate recipe/i }).click()

    // Wait for results
    await expect(page.getByText('Classic (4:1) - Freezer Batch')).toBeVisible()

    // Click toggle
    await page.getByRole('button', { name: /simplify measurements/i }).click()

    // Get all primary amounts
    const amounts = await page.locator('.ingredients-list .primary-amount').allTextContents()

    // Check that ml values end in 0 or 5
    for (const amount of amounts) {
      if (amount.includes('ml')) {
        const value = parseInt(amount.match(/\d+/)?.[0] || '0')
        expect(value % 5).toBe(0)
      }
    }
  })

  test('toggle can be disabled to restore exact values', async ({ page }) => {
    // Wait for spirit selectors to load
    await expect(page.getByRole('heading', { name: 'Select Spirits' })).toBeVisible()

    // Calculate recipe
    await page.getByRole('button', { name: /calculate recipe/i }).click()

    // Wait for results
    await expect(page.getByText('Classic (4:1) - Freezer Batch')).toBeVisible()

    // Get original value
    const originalValue = await page.locator('.water-highlight .primary-amount').textContent()

    // Toggle on
    await page.getByRole('button', { name: /simplify measurements/i }).click()
    const simplifiedValue = await page.locator('.water-highlight .primary-amount').textContent()

    // Toggle off
    await page.getByRole('button', { name: /simplify measurements/i }).click()
    const restoredValue = await page.locator('.water-highlight .primary-amount').textContent()

    // Restored value should match original
    expect(restoredValue).toBe(originalValue)
    expect(restoredValue).not.toBe(simplifiedValue)
  })

  test('hint text appears when toggle is active', async ({ page }) => {
    // Wait for spirit selectors to load
    await expect(page.getByRole('heading', { name: 'Select Spirits' })).toBeVisible()

    // Calculate recipe
    await page.getByRole('button', { name: /calculate recipe/i }).click()

    // Wait for results
    await expect(page.getByText('Classic (4:1) - Freezer Batch')).toBeVisible()

    // Hint should not be visible
    await expect(page.getByText('Rounded for easier measuring')).not.toBeVisible()

    // Click toggle
    await page.getByRole('button', { name: /simplify measurements/i }).click()

    // Hint should be visible
    await expect(page.getByText('Rounded for easier measuring')).toBeVisible()

    // Click toggle off
    await page.getByRole('button', { name: /simplify measurements/i }).click()

    // Hint should be hidden again
    await expect(page.getByText('Rounded for easier measuring')).not.toBeVisible()
  })
})
