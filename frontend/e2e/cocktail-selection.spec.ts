import { test, expect } from '@playwright/test'

test.describe('Cocktail Selection', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to the calculator with a pre-selected cocktail
    await page.goto('/cocktail/martini')
    await expect(page.getByText('The Freezer Door')).toBeVisible()
    // Wait for the cocktail selector to load
    await expect(page.getByText('Select Cocktail')).toBeVisible()
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
    // Cocktail is already pre-selected from URL, so variation dropdown should be enabled
    const variationSelect = page.locator('select').nth(1)
    await expect(variationSelect).toBeEnabled()

    // Should have martini variations as options
    const options = await variationSelect.locator('option').allTextContents()
    expect(options.some(opt => opt.includes('Classic'))).toBeTruthy()
  })

  test('updates spirit selectors for variation', async ({ page }) => {
    // With pre-selected cocktail and variation, spirit selectors should be visible
    await expect(page.getByRole('heading', { name: 'Select Spirits' })).toBeVisible()

    // Check for labels (using exact match to avoid matching dropdown options)
    await expect(page.locator('label').filter({ hasText: /^Gin$/ })).toBeVisible()
    await expect(page.locator('label').filter({ hasText: /^Dry Vermouth$/ })).toBeVisible()
  })

  test('changing cocktail updates variations', async ({ page }) => {
    // Verify current variation is classic (pre-selected)
    const variationSelect = page.locator('select').nth(1)
    await expect(variationSelect).toHaveValue('classic')

    // Change to a different cocktail
    const cocktailSelect = page.locator('select').first()
    await cocktailSelect.selectOption('negroni')

    // Should auto-select the default variation for negroni
    await expect(variationSelect).toHaveValue('classic')

    // URL should update
    await expect(page).toHaveURL(/\/cocktail\/negroni/)
  })

  test('variation dropdown shows options for selected cocktail', async ({ page }) => {
    // Change to old fashioned
    const cocktailSelect = page.locator('select').first()
    await cocktailSelect.selectOption('old_fashioned')

    const variationSelect = page.locator('select').nth(1)
    await expect(variationSelect).toBeEnabled()

    // Should have old fashioned variations
    const options = await variationSelect.locator('option').allTextContents()
    expect(options.some(opt => opt.includes('Bourbon Old Fashioned'))).toBeTruthy()
  })

  test('spirit selectors update when variation changes', async ({ page }) => {
    // Wait for spirit selectors
    await expect(page.getByRole('heading', { name: 'Select Spirits' })).toBeVisible()

    // Verify gin selector is visible for martini classic
    await expect(page.locator('label').filter({ hasText: /^Gin$/ })).toBeVisible()

    // Change to dry variation (still same ingredients for martini)
    const variationSelect = page.locator('select').nth(1)
    await variationSelect.selectOption('dry')

    // Spirit selectors should still be visible
    await expect(page.getByRole('heading', { name: 'Select Spirits' })).toBeVisible()
    await expect(page.locator('label').filter({ hasText: /^Gin$/ })).toBeVisible()
  })

  test('spirits are pre-selected when variation chosen', async ({ page }) => {
    // Wait for spirit selectors
    await expect(page.getByRole('heading', { name: 'Select Spirits' })).toBeVisible()

    // Spirits should be pre-selected (first option by default)
    // The gin dropdown should have a non-empty value
    const ginSelect = page.locator('select').nth(2)
    const ginValue = await ginSelect.inputValue()
    expect(ginValue).not.toBe('')
  })
})
