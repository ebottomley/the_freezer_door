const STORAGE_KEY = 'freezer_door_favorites';
const OLD_STORAGE_KEY = 'freezer_door_recipes';

// Migrate old data on first load
(function migrateOldData() {
  try {
    const oldData = localStorage.getItem(OLD_STORAGE_KEY);
    const newData = localStorage.getItem(STORAGE_KEY);
    if (oldData && !newData) {
      localStorage.setItem(STORAGE_KEY, oldData);
      localStorage.removeItem(OLD_STORAGE_KEY);
    }
  } catch (e) {
    // Ignore migration errors
  }
})();

/**
 * Get all saved recipes from localStorage
 * @returns {Array} Array of recipe objects
 */
export function getRecipes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading recipes from localStorage:', error);
    return [];
  }
}

/**
 * Get a single recipe by ID
 * @param {string} id - Recipe ID
 * @returns {Object|null} Recipe object or null if not found
 */
export function getRecipeById(id) {
  const recipes = getRecipes();
  return recipes.find(recipe => recipe.id === id) || null;
}

/**
 * Save a recipe to localStorage
 * @param {Object} recipe - Recipe object (will be assigned an ID if not present)
 * @returns {Object} The saved recipe with ID
 */
export function saveRecipe(recipe) {
  const validation = validateRecipe(recipe);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const recipes = getRecipes();

  if (recipe.id) {
    // Update existing recipe
    const index = recipes.findIndex(r => r.id === recipe.id);
    if (index !== -1) {
      recipes[index] = { ...recipe, updatedAt: new Date().toISOString() };
    } else {
      // ID provided but not found, treat as new
      recipes.push({ ...recipe, createdAt: new Date().toISOString() });
    }
  } else {
    // New recipe
    const newRecipe = {
      ...recipe,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    recipes.push(newRecipe);
    recipe = newRecipe;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    return recipe;
  } catch (error) {
    console.error('Error saving recipe to localStorage:', error);
    throw new Error('Failed to save recipe');
  }
}

/**
 * Delete a recipe from localStorage
 * @param {string} id - Recipe ID to delete
 * @returns {boolean} True if deleted, false if not found
 */
export function deleteRecipe(id) {
  const recipes = getRecipes();
  const filteredRecipes = recipes.filter(recipe => recipe.id !== id);

  if (filteredRecipes.length === recipes.length) {
    return false; // Recipe not found
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRecipes));
    return true;
  } catch (error) {
    console.error('Error deleting recipe from localStorage:', error);
    throw new Error('Failed to delete recipe');
  }
}

/**
 * Validate a recipe object
 * @param {Object} recipe - Recipe to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateRecipe(recipe) {
  if (!recipe) {
    return { valid: false, error: 'Recipe is required' };
  }

  if (!recipe.name || recipe.name.trim() === '') {
    return { valid: false, error: 'Recipe name is required' };
  }

  if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
    return { valid: false, error: 'Ingredients must be an array' };
  }

  if (recipe.ingredients.length === 0) {
    return { valid: false, error: 'At least one ingredient is required' };
  }

  for (const ingredient of recipe.ingredients) {
    if (!ingredient.type) {
      return { valid: false, error: 'Each ingredient must have a type' };
    }
    if (typeof ingredient.parts !== 'number' || ingredient.parts <= 0) {
      return { valid: false, error: 'Each ingredient must have parts > 0' };
    }
    if (typeof ingredient.abv !== 'number' || ingredient.abv < 0) {
      return { valid: false, error: 'Each ingredient must have a valid ABV' };
    }
  }

  return { valid: true };
}

/**
 * Update an existing favorite by ID (without validation)
 * @param {Object} favorite - The updated favorite object with id
 * @returns {Object} The updated favorite
 */
export function updateFavorite(favorite) {
  if (!favorite.id) {
    throw new Error('Favorite ID is required');
  }

  const favorites = getRecipes();
  const index = favorites.findIndex(f => f.id === favorite.id);

  if (index === -1) {
    throw new Error('Favorite not found');
  }

  favorites[index] = { ...favorite, updatedAt: new Date().toISOString() };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    return favorites[index];
  } catch (error) {
    console.error('Error updating favorite:', error);
    throw new Error('Failed to update favorite');
  }
}

/**
 * Save a favorite from Calculator results (standard cocktails)
 * @param {Object} params - Parameters for the favorite
 * @param {string} params.cocktailId - Cocktail ID (e.g., 'martini')
 * @param {string} params.variationId - Variation ID (e.g., 'classic')
 * @param {Object} params.spirits - Selected spirit brands
 * @param {Object} params.results - Calculated results from API
 * @param {number} params.targetABV - Target ABV
 * @param {number} params.volume - Target volume
 * @param {string} params.unit - Unit ('oz' or 'ml')
 * @returns {Object} The saved favorite
 */
export function saveFavoriteFromCalculator({ cocktailId, variationId, spirits, results, targetABV, volume, unit, numDrinks }) {
  const favorites = getRecipes();

  const favorite = {
    id: generateId(),
    type: 'standard', // Distinguishes from custom recipes
    name: results.cocktail_name,
    cocktailId,
    variationId,
    spirits,
    targetABV,
    volume,
    unit,
    numDrinks,
    results, // Store the full results for viewing later
    createdAt: new Date().toISOString()
  };

  favorites.push(favorite);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    return favorite;
  } catch (error) {
    console.error('Error saving favorite to localStorage:', error);
    throw new Error('Failed to save favorite');
  }
}

/**
 * Generate a unique ID for a recipe
 * @returns {string} Unique ID
 */
function generateId() {
  return `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
