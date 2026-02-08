import { test, expect } from '@playwright/test'

test.describe('My Recipes', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test('shows empty state when no recipes saved', async ({ page }) => {
    await page.goto('/my-recipes')
    await expect(page.getByText('The Freezer Door')).toBeVisible()
    await expect(page.getByText("You haven't saved any recipes yet.")).toBeVisible()
    await expect(page.getByRole('link', { name: 'Build Your First Drink' })).toBeVisible()
  })

  test('can navigate to build page from empty state', async ({ page }) => {
    await page.goto('/my-recipes')
    await page.getByRole('link', { name: 'Build Your First Drink' }).click()
    await expect(page).toHaveURL('/build')
  })

  test('shows saved recipes', async ({ page }) => {
    // Add a recipe to localStorage
    await page.evaluate(() => {
      const recipe = {
        id: 'test_recipe_1',
        name: 'Test Recipe',
        ingredients: [
          { type: 'gin', brand: 'Tanqueray', parts: 2, abv: 47.3, category: 'spirits', isCustomBrand: false }
        ],
        garnish: 'Lemon',
        targetVolume: 750,
        volumeUnit: 'ml',
        targetABV: 24,
        createdAt: new Date().toISOString()
      }
      localStorage.setItem('freezer_door_recipes', JSON.stringify([recipe]))
    })

    await page.goto('/my-recipes')

    // Recipe card should be visible
    await expect(page.locator('.recipe-card')).toBeVisible()
    await expect(page.getByText('Test Recipe')).toBeVisible()
    await expect(page.getByText('24% ABV')).toBeVisible()
  })

  test('displays ingredient summary on recipe card', async ({ page }) => {
    // Add a recipe with multiple ingredients
    await page.evaluate(() => {
      const recipe = {
        id: 'test_recipe_2',
        name: 'Multi-Ingredient',
        ingredients: [
          { type: 'gin', brand: 'Tanqueray', parts: 2, abv: 47.3, category: 'spirits', isCustomBrand: false },
          { type: 'vermouth_dry', brand: 'Dolin Dry', parts: 0.5, abv: 17.5, category: 'vermouths', isCustomBrand: false },
          { type: 'orange_bitters', brand: 'Angostura Orange', parts: 0.1, abv: 28, category: 'bitters', isCustomBrand: false }
        ],
        garnish: '',
        targetVolume: 750,
        volumeUnit: 'ml',
        targetABV: 24,
        createdAt: new Date().toISOString()
      }
      localStorage.setItem('freezer_door_recipes', JSON.stringify([recipe]))
    })

    await page.goto('/my-recipes')

    // Should show ingredient types
    await expect(page.getByText('Gin')).toBeVisible()
  })

  test('can navigate to edit recipe', async ({ page }) => {
    // Add a recipe
    await page.evaluate(() => {
      const recipe = {
        id: 'test_recipe_edit',
        name: 'Edit Me',
        ingredients: [
          { type: 'vodka', brand: 'Absolut', parts: 2, abv: 40, category: 'spirits', isCustomBrand: false }
        ],
        garnish: '',
        targetVolume: 750,
        volumeUnit: 'ml',
        targetABV: 24,
        createdAt: new Date().toISOString()
      }
      localStorage.setItem('freezer_door_recipes', JSON.stringify([recipe]))
    })

    await page.goto('/my-recipes')
    await page.getByRole('link', { name: 'Edit' }).click()

    await expect(page).toHaveURL('/build/test_recipe_edit')
    // Recipe name should be pre-filled
    await expect(page.getByPlaceholder('My Custom Cocktail')).toHaveValue('Edit Me')
  })

  test('can delete recipe', async ({ page }) => {
    // Add a recipe
    await page.evaluate(() => {
      const recipe = {
        id: 'test_recipe_delete',
        name: 'Delete Me',
        ingredients: [
          { type: 'bourbon', brand: 'Buffalo Trace', parts: 2, abv: 45, category: 'spirits', isCustomBrand: false }
        ],
        garnish: '',
        targetVolume: 750,
        volumeUnit: 'ml',
        targetABV: 24,
        createdAt: new Date().toISOString()
      }
      localStorage.setItem('freezer_door_recipes', JSON.stringify([recipe]))
    })

    await page.goto('/my-recipes')
    await expect(page.getByText('Delete Me')).toBeVisible()

    // Handle the confirmation dialog
    page.on('dialog', dialog => dialog.accept())

    // Click delete
    await page.getByRole('button', { name: 'Delete' }).click()

    // Recipe should be gone
    await expect(page.getByText('Delete Me')).not.toBeVisible()
    await expect(page.getByText("You haven't saved any recipes yet.")).toBeVisible()
  })

  test('has create new recipe link', async ({ page }) => {
    await page.evaluate(() => {
      const recipe = {
        id: 'test_recipe_3',
        name: 'Existing Recipe',
        ingredients: [
          { type: 'gin', brand: 'Tanqueray', parts: 2, abv: 47.3, category: 'spirits', isCustomBrand: false }
        ],
        garnish: '',
        targetVolume: 750,
        volumeUnit: 'ml',
        targetABV: 24,
        createdAt: new Date().toISOString()
      }
      localStorage.setItem('freezer_door_recipes', JSON.stringify([recipe]))
    })

    await page.goto('/my-recipes')
    await expect(page.getByRole('link', { name: 'Create New Recipe' })).toBeVisible()
  })

  test('can access my recipes from homepage', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'My Recipes' }).click()
    await expect(page).toHaveURL('/my-recipes')
  })

  test('can access build from homepage', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Build Your Own Drink' }).click()
    await expect(page).toHaveURL('/build')
  })
})
