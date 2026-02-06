import { test, expect } from '@playwright/test'

test.describe('Recipe Calculation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('calculate martini recipe successfully', async ({ page }) => {
    // Wait for app to load
    await expect(page.getByText('The Freezer Door')).toBeVisible()
    await expect(page.getByText('Select Cocktail')).toBeVisible()

    // Select cocktail
    const cocktailSelect = page.locator('select').first()
    await cocktailSelect.selectOption('martini')

    // Wait for variation dropdown to be enabled and select one
    const variationSelect = page.locator('select').nth(1)
    await expect(variationSelect).toBeEnabled()
    await variationSelect.selectOption('classic')

    // Wait for spirit selectors to appear (check for the card heading)
    await expect(page.getByRole('heading', { name: 'Select Spirits' })).toBeVisible()

    // Set volume (default should already be 750ml)
    const volumeInput = page.locator('input[type="number"]').first()
    await volumeInput.fill('750')

    // Click calculate
    await page.getByRole('button', { name: /Calculate Recipe/i }).click()

    // Verify results are displayed
    await expect(page.getByText('Classic (4:1) - Freezer Batch')).toBeVisible()

    // Verify ingredients are shown
    await expect(page.getByText('Water (for dilution)')).toBeVisible()

    // Verify ABV stats are displayed
    await expect(page.getByText('Initial ABV')).toBeVisible()
    await expect(page.getByText('Final ABV')).toBeVisible()
    await expect(page.getByText('Total Volume')).toBeVisible()

    // Verify garnish is shown
    await expect(page.getByText(/Garnish:/)).toBeVisible()
  })

  test('display correct water dilution amount', async ({ page }) => {
    await expect(page.getByText('The Freezer Door')).toBeVisible()

    // Select cocktail and variation
    const cocktailSelect = page.locator('select').first()
    await cocktailSelect.selectOption('martini')

    const variationSelect = page.locator('select').nth(1)
    await expect(variationSelect).toBeEnabled()
    await variationSelect.selectOption('classic')

    // Wait for spirit selectors
    await expect(page.getByRole('heading', { name: 'Select Spirits' })).toBeVisible()

    // Click calculate
    await page.getByRole('button', { name: /Calculate Recipe/i }).click()

    // Verify water amount is shown (should be a non-zero value for martini at 24% ABV)
    const waterSection = page.locator('.water-highlight')
    await expect(waterSection).toBeVisible()

    // The water amount should contain "ml" or "oz"
    await expect(waterSection).toContainText(/\d+(\.\d+)?\s*(ml|oz)/)
  })

  test('update calculation when ABV changed', async ({ page }) => {
    await expect(page.getByText('The Freezer Door')).toBeVisible()

    // Select cocktail and variation
    const cocktailSelect = page.locator('select').first()
    await cocktailSelect.selectOption('martini')

    const variationSelect = page.locator('select').nth(1)
    await expect(variationSelect).toBeEnabled()
    await variationSelect.selectOption('classic')

    // Wait for spirit selectors
    await expect(page.getByRole('heading', { name: 'Select Spirits' })).toBeVisible()

    // Click Strong preset first and verify it's selected
    const strongButton = page.getByRole('button', { name: /Strong \(32%\)/ })
    await strongButton.click()
    await expect(strongButton).toHaveClass(/active/)
    // Verify the custom ABV label updated
    await expect(page.getByText('Custom ABV (32%)')).toBeVisible()

    // Calculate
    await page.getByRole('button', { name: /Calculate Recipe/i }).click()
    await expect(page.getByText('Classic (4:1) - Freezer Batch')).toBeVisible()

    // Verify the Final ABV shows the Strong preset value (32%)
    await expect(page.locator('.stat').filter({ hasText: 'Final ABV' }).locator('.stat-value')).toHaveText('32%')

    // Now click Mild preset and verify it's selected
    const mildButton = page.getByRole('button', { name: /Mild \(28%\)/ })
    await mildButton.click()
    await expect(mildButton).toHaveClass(/active/)
    // Verify the custom ABV label updated
    await expect(page.getByText('Custom ABV (28%)')).toBeVisible()

    // Recalculate
    await page.getByRole('button', { name: /Calculate Recipe/i }).click()
    await expect(page.getByText('Classic (4:1) - Freezer Batch')).toBeVisible()

    // Verify the Final ABV now shows the Mild preset value (28%)
    await expect(page.locator('.stat').filter({ hasText: 'Final ABV' }).locator('.stat-value')).toHaveText('28%')
  })

  test('calculate with custom volume', async ({ page }) => {
    await expect(page.getByText('The Freezer Door')).toBeVisible()

    // Select cocktail and variation
    const cocktailSelect = page.locator('select').first()
    await cocktailSelect.selectOption('martini')

    const variationSelect = page.locator('select').nth(1)
    await expect(variationSelect).toBeEnabled()
    await variationSelect.selectOption('classic')

    // Wait for spirit selectors
    await expect(page.getByRole('heading', { name: 'Select Spirits' })).toBeVisible()

    // Set custom volume
    const volumeInput = page.locator('input[type="number"]').first()
    await volumeInput.fill('500')

    // Calculate
    await page.getByRole('button', { name: /Calculate Recipe/i }).click()

    // Verify total volume in results matches
    await expect(page.getByText('500 ml')).toBeVisible()
  })
})
