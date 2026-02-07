import { test, expect } from '@playwright/test'

test.describe('Volume and Unit Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to the calculator with a pre-selected cocktail
    await page.goto('/cocktail/martini')
    await expect(page.getByText('The Freezer Door')).toBeVisible()
    // Wait for the cocktail selector to load
    await expect(page.getByText('Select Cocktail')).toBeVisible()
  })

  test('switches between oz and ml units', async ({ page }) => {
    // Find the unit select (the one with ml/oz options)
    const unitSelect = page.locator('select').filter({ has: page.locator('option[value="ml"]') }).first()
    // Default is now oz
    await expect(unitSelect).toHaveValue('oz')

    // Switch to ml
    await unitSelect.selectOption('ml')
    await expect(unitSelect).toHaveValue('ml')

    // Switch back to oz
    await unitSelect.selectOption('oz')
    await expect(unitSelect).toHaveValue('oz')
  })

  test('displays results in selected unit', async ({ page }) => {
    // Wait for spirit selectors
    await expect(page.getByRole('heading', { name: 'Select Spirits' })).toBeVisible()

    // Calculate with oz unit (now the default)
    await page.getByRole('button', { name: /Calculate Recipe/i }).click()
    await expect(page.getByText('Classic (4:1) - Freezer Batch')).toBeVisible()

    // Check that oz is shown as primary (now default)
    const totalVolumeStat = page.locator('.stat').filter({ hasText: 'Total Volume' })
    await expect(totalVolumeStat).toContainText('oz')

    // Switch to ml
    const unitSelect = page.locator('select').filter({ has: page.locator('option[value="ml"]') }).first()
    await unitSelect.selectOption('ml')

    // Recalculate
    await page.getByRole('button', { name: /Calculate Recipe/i }).click()

    // Check that ml is now shown as primary for total volume
    await expect(totalVolumeStat).toContainText('ml')
  })

  test('number of drinks mode calculates correctly', async ({ page }) => {
    // Wait for spirit selectors
    await expect(page.getByRole('heading', { name: 'Select Spirits' })).toBeVisible()

    // Switch to drinks mode
    await page.getByRole('button', { name: /Number of Drinks/i }).click()

    // Enter number of drinks
    const drinksInput = page.locator('input[type="number"]').first()
    await drinksInput.fill('8')

    // Should show serving info calculation
    await expect(page.getByText(/8 drinks × \d+ ml = \d+ ml total/)).toBeVisible()

    // Calculate
    await page.getByRole('button', { name: /Calculate Recipe/i }).click()

    // Verify results appear
    await expect(page.getByText('Classic (4:1) - Freezer Batch')).toBeVisible()
  })

  test('drinks mode button enabled when cocktail selected', async ({ page }) => {
    // With cocktail pre-selected from URL, drinks mode should be enabled
    const drinksButton = page.getByRole('button', { name: /Number of Drinks/i })
    await expect(drinksButton).toBeEnabled()
  })

  test('volume mode toggle works', async ({ page }) => {
    // Default should be volume mode
    const volumeButton = page.getByRole('button', { name: /^Volume$/i })
    await expect(volumeButton).toHaveClass(/active/)

    // Switch to drinks mode
    await page.getByRole('button', { name: /Number of Drinks/i }).click()

    // Drinks button should now be active
    const drinksButton = page.getByRole('button', { name: /Number of Drinks/i })
    await expect(drinksButton).toHaveClass(/active/)

    // Switch back to volume mode
    await volumeButton.click()
    await expect(volumeButton).toHaveClass(/active/)
  })

  test('volume input respects unit constraints', async ({ page }) => {
    // Default is now oz mode
    const volumeInput = page.locator('input[type="number"]').first()

    // Should have oz constraints (default)
    await expect(volumeInput).toHaveAttribute('min', '3')
    await expect(volumeInput).toHaveAttribute('max', '170')

    // Switch to ml
    const unitSelect = page.locator('select').filter({ has: page.locator('option[value="ml"]') }).first()
    await unitSelect.selectOption('ml')

    // Should now have ml constraints
    await expect(volumeInput).toHaveAttribute('min', '100')
    await expect(volumeInput).toHaveAttribute('max', '5000')
  })

  test('converts volume when switching units', async ({ page }) => {
    // Find the volume input - after selecting martini it should be ~18.3 oz (6 drinks x 90ml)
    const volumeInput = page.locator('input[type="number"]').first()

    // Set a known value in oz
    await volumeInput.fill('18')

    // Switch to ml
    const unitSelect = page.locator('select').filter({ has: page.locator('option[value="ml"]') }).first()
    await unitSelect.selectOption('ml')

    // 18oz * 29.5735 ≈ 532ml
    await expect(volumeInput).toHaveValue('532')

    // Switch back to oz
    await unitSelect.selectOption('oz')

    // 532ml / 29.5735 ≈ 18 oz
    await expect(volumeInput).toHaveValue('18')
  })

  test('default volume is 6 drinks worth in oz', async ({ page }) => {
    // Volume input should show ~18.3 oz (6 drinks x 90ml serving)
    const volumeInput = page.locator('input[type="number"]').first()
    const value = await volumeInput.inputValue()

    // Should be approximately 18.3 (6 * 90 / 29.5735)
    const numValue = parseFloat(value)
    expect(numValue).toBeGreaterThan(18)
    expect(numValue).toBeLessThan(19)
  })
})
