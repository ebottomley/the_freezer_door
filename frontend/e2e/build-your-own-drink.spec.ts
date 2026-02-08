import { test, expect } from '@playwright/test'

test.describe('Build Your Own Drink', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/build')
    await expect(page.getByText('The Freezer Door')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Build Your Own Drink' })).toBeVisible()
  })

  test('displays recipe name input with placeholder', async ({ page }) => {
    const input = page.locator('.recipe-name-input')
    await expect(input).toBeVisible()
    await expect(input).toHaveAttribute('placeholder', 'Recipe Name')
  })

  test('displays ingredients section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Ingredients' })).toBeVisible()
    await expect(page.getByText('Category')).toBeVisible()
  })

  test('can select category, type, and brand', async ({ page }) => {
    // Select category
    const categorySelect = page.locator('.ingredient-row select').first()
    await categorySelect.selectOption('spirits')

    // Type dropdown should appear
    await expect(page.getByText('Type')).toBeVisible()
    const typeSelect = page.locator('.ingredient-row select').nth(1)
    await typeSelect.selectOption('gin')

    // Brand dropdown should appear
    await expect(page.getByText('Brand')).toBeVisible()
    const brandSelect = page.locator('.ingredient-row select').nth(2)
    const options = await brandSelect.locator('option').allTextContents()
    expect(options.some(opt => opt.includes('Tanqueray'))).toBeTruthy()
  })

  test('shows total parts after adding ingredients', async ({ page }) => {
    // Select category and type
    const categorySelect = page.locator('.ingredient-row select').first()
    await categorySelect.selectOption('spirits')
    const typeSelect = page.locator('.ingredient-row select').nth(1)
    await typeSelect.selectOption('gin')
    const brandSelect = page.locator('.ingredient-row select').nth(2)
    await brandSelect.selectOption('Tanqueray')

    // Set parts
    const partsInput = page.locator('.ingredient-row-amount input')
    await partsInput.fill('2')

    // Total should appear
    await expect(page.locator('.total-parts')).toBeVisible()
    await expect(page.getByText('2 parts')).toBeVisible()
  })

  test('can add and remove ingredients', async ({ page }) => {
    const ingredientRows = page.locator('.ingredient-row')
    await expect(ingredientRows).toHaveCount(1)

    await page.getByText('+ Add Ingredient').click()
    await expect(ingredientRows).toHaveCount(2)

    const removeBtn = page.locator('.remove-ingredient-btn').first()
    await expect(removeBtn).toBeVisible()

    await removeBtn.click()
    await expect(ingredientRows).toHaveCount(1)
  })

  test('can enter custom brand with ABV', async ({ page }) => {
    const categorySelect = page.locator('.ingredient-row select').first()
    await categorySelect.selectOption('spirits')
    const typeSelect = page.locator('.ingredient-row select').nth(1)
    await typeSelect.selectOption('gin')

    const brandSelect = page.locator('.ingredient-row select').nth(2)
    await brandSelect.selectOption('__custom__')

    await expect(page.getByPlaceholder('Enter brand name...')).toBeVisible()
    await expect(page.getByLabel('ABV (%)')).toBeVisible()
  })

  test('has batch settings with number of drinks and target ABV', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Batch Settings' })).toBeVisible()
    await expect(page.getByLabel('Number of Drinks')).toBeVisible()
    await expect(page.getByLabel('Target ABV (%)')).toBeVisible()
    await expect(page.getByLabel('Display Unit')).toBeVisible()
  })

  test('calculates recipe when valid ingredients added', async ({ page }) => {
    // Fill in recipe name
    await page.locator('.recipe-name-input').fill('Test Martini')

    // Add gin
    const categorySelect = page.locator('.ingredient-row select').first()
    await categorySelect.selectOption('spirits')
    const typeSelect = page.locator('.ingredient-row select').nth(1)
    await typeSelect.selectOption('gin')
    const brandSelect = page.locator('.ingredient-row select').nth(2)
    await brandSelect.selectOption('Tanqueray')

    const partsInput = page.locator('.ingredient-row-amount input')
    await partsInput.fill('2')

    // Add vermouth
    await page.getByText('+ Add Ingredient').click()
    const secondRow = page.locator('.ingredient-row').nth(1)
    await secondRow.locator('select').first().selectOption('vermouths')
    await secondRow.locator('select').nth(1).selectOption('vermouth_dry')
    await secondRow.locator('select').nth(2).selectOption('Dolin Dry')
    await secondRow.locator('.ingredient-row-amount input').fill('0.5')

    // Calculate
    await page.getByRole('button', { name: 'Calculate Recipe' }).click()

    // Results should appear
    await expect(page.locator('.results')).toBeVisible()
    await expect(page.getByText('Test Martini')).toBeVisible()
    await expect(page.getByText('Initial ABV')).toBeVisible()
    await expect(page.getByText('Final ABV')).toBeVisible()
  })

  test('save button is disabled without recipe name', async ({ page }) => {
    const categorySelect = page.locator('.ingredient-row select').first()
    await categorySelect.selectOption('spirits')
    const typeSelect = page.locator('.ingredient-row select').nth(1)
    await typeSelect.selectOption('gin')
    const brandSelect = page.locator('.ingredient-row select').nth(2)
    await brandSelect.selectOption('Tanqueray')

    const saveBtn = page.getByRole('button', { name: /Save Recipe|Update Recipe/ })
    await expect(saveBtn).toBeDisabled()
  })

  test('can save recipe', async ({ page }) => {
    await page.locator('.recipe-name-input').fill('My Saved Recipe')

    const categorySelect = page.locator('.ingredient-row select').first()
    await categorySelect.selectOption('spirits')
    const typeSelect = page.locator('.ingredient-row select').nth(1)
    await typeSelect.selectOption('bourbon')
    const brandSelect = page.locator('.ingredient-row select').nth(2)
    await brandSelect.selectOption('Buffalo Trace')

    await page.getByRole('button', { name: /Save Recipe/ }).click()

    await expect(page.getByText('Recipe saved!')).toBeVisible()
    await expect(page).toHaveURL(/\/build\/recipe_/)
  })

  test('shows export PDF button after calculation', async ({ page }) => {
    await page.locator('.recipe-name-input').fill('Export Test')

    const categorySelect = page.locator('.ingredient-row select').first()
    await categorySelect.selectOption('spirits')
    const typeSelect = page.locator('.ingredient-row select').nth(1)
    await typeSelect.selectOption('vodka')
    const brandSelect = page.locator('.ingredient-row select').nth(2)
    await brandSelect.selectOption('Absolut')

    await page.getByRole('button', { name: 'Calculate Recipe' }).click()

    await expect(page.locator('.results')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Export as PDF' })).toBeVisible()
  })

  test('garnish comes after batch settings', async ({ page }) => {
    // Check order: Ingredients, Batch Settings, Garnish
    const cards = page.locator('.card')
    const headings = await cards.locator('h2').allTextContents()

    const ingredientsIndex = headings.indexOf('Ingredients')
    const batchIndex = headings.indexOf('Batch Settings')
    const garnishIndex = headings.indexOf('Garnish (Optional)')

    expect(ingredientsIndex).toBeLessThan(batchIndex)
    expect(batchIndex).toBeLessThan(garnishIndex)
  })
})
