import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import IngredientRow from './IngredientRow';
import ResultsDisplay from '../ResultsDisplay';
import { getIngredients, calculateCustomRecipe } from '../../services/api';
import { getRecipeById, saveRecipe, validateRecipe } from '../../services/localStorage';

const DEFAULT_INGREDIENT = {
  category: '',
  type: '',
  brand: '',
  parts: 1,
  abv: 0,
  isCustomBrand: false
};

const ML_PER_OZ = 29.5735;

export default function DrinkBuilder() {
  const { recipeId } = useParams();
  const navigate = useNavigate();

  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState([{ ...DEFAULT_INGREDIENT }]);
  const [garnish, setGarnish] = useState('');
  const [numDrinks, setNumDrinks] = useState(8);
  const [targetABV, setTargetABV] = useState(24);
  const [unit, setUnit] = useState('oz');

  const [ingredientCategories, setIngredientCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  // Load ingredient categories
  useEffect(() => {
    async function loadData() {
      try {
        const categories = await getIngredients();
        setIngredientCategories(categories);

        // If editing, load the recipe
        if (recipeId) {
          const recipe = getRecipeById(recipeId);
          if (recipe) {
            setRecipeName(recipe.name);
            setIngredients(recipe.ingredients);
            setGarnish(recipe.garnish || '');
            setNumDrinks(recipe.numDrinks || 8);
            setTargetABV(recipe.targetABV || 24);
            setUnit(recipe.unit || 'oz');
          } else {
            setError('Recipe not found');
          }
        }
      } catch (err) {
        setError('Failed to load ingredients. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [recipeId]);

  // Calculate total parts from valid ingredients
  const getTotalParts = () => {
    return ingredients
      .filter(ing => ing.type && ing.parts > 0)
      .reduce((sum, ing) => sum + ing.parts, 0);
  };

  // Calculate initial ABV (weighted average)
  const getInitialABV = () => {
    const validIngredients = ingredients.filter(ing => ing.type && ing.parts > 0);
    const totalParts = getTotalParts();
    if (totalParts === 0) return 0;

    const weightedABV = validIngredients.reduce((sum, ing) => sum + (ing.parts * ing.abv), 0);
    return weightedABV / totalParts;
  };

  // Calculate serving size: parts in oz + dilution needed
  const getServingSizeOz = () => {
    const totalParts = getTotalParts();
    const initialABV = getInitialABV();

    if (totalParts === 0 || targetABV <= 0 || targetABV >= initialABV) {
      return totalParts; // No dilution needed
    }

    // Dilution formula: final_volume = spirit_volume * initial_abv / target_abv
    const finalVolume = totalParts * initialABV / targetABV;
    return finalVolume;
  };

  const handleIngredientUpdate = (index, updatedIngredient) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = updatedIngredient;
    setIngredients(newIngredients);
    setResults(null);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { ...DEFAULT_INGREDIENT }]);
  };

  const handleRemoveIngredient = (index) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
      setResults(null);
    }
  };

  const handleCalculate = async () => {
    setError(null);
    setCalculating(true);
    setResults(null);

    const validIngredients = ingredients.filter(ing => ing.type && ing.parts > 0);

    if (validIngredients.length === 0) {
      setError('Please add at least one complete ingredient');
      setCalculating(false);
      return;
    }

    try {
      // Calculate total volume based on serving size * number of drinks
      const servingSizeOz = getServingSizeOz();
      const totalVolumeOz = servingSizeOz * numDrinks;
      const totalVolumeMl = Math.round(totalVolumeOz * ML_PER_OZ);

      const data = {
        ingredients: validIngredients.map(ing => ({
          type: ing.type,
          brand: ing.brand || 'Custom',
          parts: ing.parts,
          abv: ing.abv
        })),
        target_volume_ml: totalVolumeMl,
        target_abv: targetABV,
        recipe_name: recipeName || 'Custom Recipe',
        garnish
      };

      const result = await calculateCustomRecipe(data);
      setResults(result);
    } catch (err) {
      setError(err.message || 'Calculation failed');
    } finally {
      setCalculating(false);
    }
  };

  const handleSave = () => {
    const validIngredients = ingredients.filter(ing => ing.type && ing.parts > 0);

    const recipe = {
      id: recipeId || undefined,
      name: recipeName,
      ingredients: validIngredients,
      garnish,
      numDrinks,
      targetABV,
      unit
    };

    const validation = validateRecipe(recipe);
    if (!validation.valid) {
      setSaveStatus({ type: 'error', message: validation.error });
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }

    try {
      const saved = saveRecipe(recipe);
      setSaveStatus({ type: 'success', message: 'Recipe saved!' });

      if (!recipeId && saved.id) {
        navigate(`/build/${saved.id}`, { replace: true });
      }

      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.message });
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const isFormValid = () => {
    const validIngredients = ingredients.filter(ing => ing.type && ing.parts > 0);
    return validIngredients.length > 0;
  };

  const totalParts = getTotalParts();
  const servingSizeOz = getServingSizeOz();
  const initialABV = getInitialABV();

  if (loading) {
    return (
      <div className="builder-page">
        <Header showBack />
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="builder-page">
      <Header showBack />
      <main className="container">
        <div className="card">
          <h2>Build Your Own Drink</h2>
          <input
            type="text"
            className="recipe-name-input"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            placeholder="Recipe Name"
          />
        </div>

        <div className="card">
          <h2>Ingredients</h2>

          {ingredients.map((ingredient, index) => (
            <IngredientRow
              key={index}
              ingredient={ingredient}
              ingredientCategories={ingredientCategories}
              index={index}
              onUpdate={handleIngredientUpdate}
              onRemove={handleRemoveIngredient}
              canRemove={ingredients.length > 1}
            />
          ))}

          <button
            type="button"
            className="add-ingredient-btn"
            onClick={handleAddIngredient}
          >
            + Add Ingredient
          </button>

          {totalParts > 0 && (
            <div className="total-parts">
              <span className="total-parts-label">Total:</span>
              <span className="total-parts-value">{totalParts} parts</span>
              {initialABV > 0 && (
                <span className="initial-abv">({initialABV.toFixed(1)}% ABV before dilution)</span>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h2>Batch Settings</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Number of Drinks</label>
              <input
                type="number"
                min="1"
                max="50"
                step="1"
                value={numDrinks}
                onChange={(e) => {
                  setNumDrinks(parseInt(e.target.value) || 1);
                  setResults(null);
                }}
              />
            </div>
            <div className="form-group">
              <label>Target ABV (%)</label>
              <input
                type="number"
                min="10"
                max="40"
                step="0.5"
                value={targetABV}
                onChange={(e) => {
                  setTargetABV(parseFloat(e.target.value) || 20);
                  setResults(null);
                }}
              />
            </div>
            <div className="form-group">
              <label>Display Unit</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="oz">Ounces (oz)</option>
                <option value="ml">Milliliters (ml)</option>
              </select>
            </div>
          </div>
          {totalParts > 0 && initialABV > targetABV && (
            <p className="serving-info">
              Serving size: {servingSizeOz.toFixed(1)} oz ({Math.round(servingSizeOz * ML_PER_OZ)} ml) per drink
            </p>
          )}
        </div>

        <div className="card">
          <h2>Garnish (Optional)</h2>
          <div className="form-group">
            <input
              type="text"
              value={garnish}
              onChange={(e) => setGarnish(e.target.value)}
              placeholder="e.g., Lemon twist, Olive"
            />
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="action-buttons">
          <button
            className="calculate-btn"
            onClick={handleCalculate}
            disabled={!isFormValid() || calculating}
          >
            {calculating ? 'Calculating...' : 'Calculate Recipe'}
          </button>

          <button
            className="save-recipe-btn"
            onClick={handleSave}
            disabled={!recipeName.trim() || !isFormValid()}
          >
            {recipeId ? 'Update Recipe' : 'Save Recipe'}
          </button>
        </div>

        {saveStatus && (
          <div className={`save-status ${saveStatus.type}`}>
            {saveStatus.message}
          </div>
        )}

        {results && (
          <ResultsDisplay
            results={results}
            unit={unit}
            isCustomRecipe
            numDrinks={numDrinks}
          />
        )}
      </main>
    </div>
  );
}
