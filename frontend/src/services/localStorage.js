const STORAGE_KEY = 'freezer_door_recipes';

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
 * Generate a unique ID for a recipe
 * @returns {string} Unique ID
 */
function generateId() {
  return `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
