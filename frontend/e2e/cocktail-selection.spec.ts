import { test, expect } from '@playwright/test'

test.describe('Cocktail Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('The Freezer Door')).toBeVisible()
  })

  test('shows all cocktails in dropdown', async ({ page }) => {
    const cocktailSelect = page.locator('select').first()

    // Check that there are multiple options (including placeholder)
    const optionCount = await cocktailSelect.locator('option').count()
    expect(optionCount).toBeGreaterThan(1)

    // Martini should be available
    const options = await cocktailSelect.locator('option').allTextContents()
    expect(options.some(opt => opt.includes('Martini'))).toBeTruthy()
  })

  test('shows variations when cocktail selected', async ({ page }) => {
    const cocktailSelect = page.locator('select').first()
    await cocktailSelect.selectOption('martini')

    // Variation dropdown should now be enabled and have options
    const variationSelect = page.locator('select').nth(1)
    await expect(variationSelect).toBeEnabled()

    // Should have martini variations as options
    const options = await variationSelect.locator('option').allTextContents()
    expect(options.some(opt => opt.includes('Classic'))).toBeTruthy()
  })

  test('updates spirit selectors for variation', async ({ page }) => {
    // Initially, spirit selector heading should not be visible
    await expect(page.getByRole('heading', { name: 'Select Spirits' })).not.toBeVisible()

    // Select cocktail
    const cocktailSelect = page.locator('select').first()
    await cocktailSelect.selectOption('martini')

    // Select variation
    const variationSelect = page.locator('select').nth(1)
    await expect(variationSelect).toBeEnabled()
    await variationSelect.selectOption('classic')

    // Now spirit selectors should appear
    await expect(page.getByRole('heading', { name: 'Select Spirits' })).toBeVisible()
    // Check for labels (using exact match to avoid matching dropdown options)
    await expect(page.locator('label').filter({ hasText: /^Gin$/ })).toBeVisible()
    await expect(page.locator('label').filter({ hasText: /^Dry Vermouth$/ })).toBeVisible()
  })

  test('changing cocktail clears variation', async ({ page }) => {
    // Select martini and a variation
    const cocktailSelect = page.locator('select').first()
    await cocktailSelect.selectOption('martini')

    const variationSelect = page.locator('select').nth(1)
    await expect(variationSelect).toBeEnabled()
    await variationSelect.selectOption('classic')

    // Verify variation is selected
    await expect(variationSelect).toHaveValue('classic')

    // Change to a different cocktail
    await cocktailSelect.selectOption('negroni')

    // Variation should be cleared
    await expect(variationSelect).toHaveValue('')
  })

  test('variation dropdown disabled when no cocktail selected', async ({ page }) => {
    const variationSelect = page.locator('select').nth(1)
    await expect(variationSelect).toBeDisabled()
  })

  test('spirit selectors disappear when variation cleared', async ({ page }) => {
    // Select cocktail and variation
    const cocktailSelect = page.locator('select').first()
    await cocktailSelect.selectOption('martini')

    const variationSelect = page.locator('select').nth(1)
    await expect(variationSelect).toBeEnabled()
    await variationSelect.selectOption('classic')

    // Spirit selectors should be visible
    await expect(page.getByRole('heading', { name: 'Select Spirits' })).toBeVisible()

    // Clear the cocktail selection
    await cocktailSelect.selectOption('')

    // Spirit selectors should disappear
    await expect(page.getByRole('heading', { name: 'Select Spirits' })).not.toBeVisible()
  })

  test('spirits are pre-selected when variation chosen', async ({ page }) => {
    // Select cocktail and variation
    const cocktailSelect = page.locator('select').first()
    await cocktailSelect.selectOption('martini')

    const variationSelect = page.locator('select').nth(1)
    await expect(variationSelect).toBeEnabled()
    await variationSelect.selectOption('classic')

    // Wait for spirit selectors
    await expect(page.getByRole('heading', { name: 'Select Spirits' })).toBeVisible()

    // Spirits should be pre-selected (first option by default)
    // The gin dropdown should have a non-empty value
    const ginSelect = page.locator('select').nth(2)
    const ginValue = await ginSelect.inputValue()
    expect(ginValue).not.toBe('')
  })
})
