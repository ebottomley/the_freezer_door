import { Link } from 'react-router-dom';
import { getSpiritLabel } from '../../constants/spiritLabels';

export default function RecipeCard({ recipe, onDelete }) {
  // Handle both custom recipes (with ingredients array) and standard favorites (with results)
  const isStandard = recipe.type === 'standard';

  let ingredientSummary = '';
  let moreCount = 0;

  if (isStandard && recipe.results?.ingredients) {
    // Standard favorites store ingredients in results object
    const ingredientKeys = Object.keys(recipe.results.ingredients);
    ingredientSummary = ingredientKeys
      .slice(0, 3)
      .map(key => getSpiritLabel(key))
      .join(', ');
    moreCount = ingredientKeys.length - 3;
  } else if (recipe.ingredients) {
    // Custom recipes have ingredients array
    ingredientSummary = recipe.ingredients
      .filter(ing => ing.type)
      .map(ing => getSpiritLabel(ing.type))
      .slice(0, 3)
      .join(', ');
    moreCount = recipe.ingredients.filter(ing => ing.type).length - 3;
  }

  const handleDelete = (e) => {
    e.preventDefault();
    if (window.confirm(`Delete "${recipe.name}"?`)) {
      onDelete(recipe.id);
    }
  };

  return (
    <div className="recipe-card">
      <h3 className="recipe-card-name">{recipe.name}</h3>

      <p className="recipe-card-ingredients">
        {ingredientSummary}
        {moreCount > 0 && <span className="more-count"> +{moreCount} more</span>}
      </p>

      <div className="recipe-card-meta">
        <span className="recipe-card-abv">{recipe.targetABV}% ABV</span>
        {recipe.numDrinks && (
          <span className="recipe-card-drinks">{recipe.numDrinks} drinks</span>
        )}
      </div>

      <div className="recipe-card-actions">
        <Link to={`/favorite/${recipe.id}`} className="recipe-action-btn view">
          View
        </Link>
        <button type="button" onClick={handleDelete} className="recipe-action-btn delete">
          Delete
        </button>
      </div>
    </div>
  );
}
