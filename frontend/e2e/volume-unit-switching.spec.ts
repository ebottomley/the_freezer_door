import { test, expect } from '@playwright/test'

test.describe('Volume and Unit Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('The Freezer Door')).toBeVisible()
  })

  test('switches between ml and oz units', async ({ page }) => {
    // Find the unit select (the one with ml/oz options)
    const unitSelect = page.locator('select').filter({ has: page.locator('option[value="ml"]') }).first()
    await expect(unitSelect).toHaveValue('ml')

    // Switch to oz
    await unitSelect.selectOption('oz')
    await expect(unitSelect).toHaveValue('oz')

    // Switch back to ml
    await unitSelect.selectOption('ml')
    await expect(unitSelect).toHaveValue('ml')
  })

  test('displays results in selected unit', async ({ page }) => {
    // Select cocktail and variation
    const cocktailSelect = page.locator('select').first()
    await cocktailSelect.selectOption('martini')

    const variationSelect = page.locator('select').nth(1)
    await expect(variationSelect).toBeEnabled()
    await variationSelect.selectOption('classic')

    await expect(page.getByRole('heading', { name: 'Select Spirits' })).toBeVisible()

    // Calculate with ml unit
    await page.getByRole('button', { name: /Calculate Recipe/i }).click()
    await expect(page.getByText('Classic (4:1) - Freezer Batch')).toBeVisible()

    // Check that ml is shown as primary
    const totalVolumeStat = page.locator('.stat').filter({ hasText: 'Total Volume' })
    await expect(totalVolumeStat).toContainText('ml')

    // Switch to oz
    const unitSelect = page.locator('select').filter({ has: page.locator('option[value="ml"]') }).first()
    await unitSelect.selectOption('oz')

    // Recalculate
    await page.getByRole('button', { name: /Calculate Recipe/i }).click()

    // Check that oz is now shown as primary for total volume
    await expect(totalVolumeStat).toContainText('oz')
  })

  test('number of drinks mode calculates correctly', async ({ page }) => {
    // Select cocktail and variation first (to enable drinks mode)
    const cocktailSelect = page.locator('select').first()
    await cocktailSelect.selectOption('martini')

    const variationSelect = page.locator('select').nth(1)
    await expect(variationSelect).toBeEnabled()
    await variationSelect.selectOption('classic')

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

  test('drinks mode button disabled without cocktail', async ({ page }) => {
    // Without selecting a cocktail, drinks mode should be disabled
    // (because serving_size_ml is not available)
    const drinksButton = page.getByRole('button', { name: /Number of Drinks/i })
    await expect(drinksButton).toBeDisabled()
  })

  test('drinks mode button enabled after selecting cocktail', async ({ page }) => {
    // Select cocktail
    const cocktailSelect = page.locator('select').first()
    await cocktailSelect.selectOption('martini')

    // Drinks mode should now be enabled
    const drinksButton = page.getByRole('button', { name: /Number of Drinks/i })
    await expect(drinksButton).toBeEnabled()
  })

  test('volume mode toggle works', async ({ page }) => {
    // Select cocktail first
    const cocktailSelect = page.locator('select').first()
    await cocktailSelect.selectOption('martini')

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
    // In ml mode, verify constraints
    const volumeInput = page.locator('input[type="number"]').first()

    // Should have ml constraints
    await expect(volumeInput).toHaveAttribute('min', '100')
    await expect(volumeInput).toHaveAttribute('max', '5000')

    // Switch to oz
    const unitSelect = page.locator('select').filter({ has: page.locator('option[value="ml"]') }).first()
    await unitSelect.selectOption('oz')

    // Should now have oz constraints
    await expect(volumeInput).toHaveAttribute('min', '3')
    await expect(volumeInput).toHaveAttribute('max', '170')
  })
})
