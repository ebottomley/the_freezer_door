import { Link } from 'react-router-dom';

const TYPE_LABELS = {
  vodka: 'Vodka',
  gin: 'Gin',
  bourbon: 'Bourbon',
  rye: 'Rye Whiskey',
  tequila: 'Tequila',
  mezcal: 'Mezcal',
  orange_liqueur: 'Orange Liqueur',
  campari: 'Campari',
  amaro: 'Amaro',
  suze: 'Suze',
  herbal_liqueur: 'Herbal Liqueur',
  coffee_liqueur: 'Coffee Liqueur',
  vermouth_dry: 'Dry Vermouth',
  vermouth_sweet: 'Sweet Vermouth',
  lillet_blanc: 'Lillet Blanc',
  angostura: 'Angostura Bitters',
  peychauds: "Peychaud's Bitters",
  orange_bitters: 'Orange Bitters',
  simple_syrup: 'Simple Syrup',
  agave_nectar: 'Agave Nectar',
  honey_syrup: 'Honey Syrup',
  demerara_syrup: 'Demerara Syrup',
  lime_juice: 'Lime Juice',
  lemon_juice: 'Lemon Juice',
  grapefruit_juice: 'Grapefruit Juice',
  orange_juice: 'Orange Juice',
  olive_brine: 'Olive Brine',
  cream: 'Cream',
  egg_white: 'Egg White'
};

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
      .map(key => TYPE_LABELS[key] || key.replace(/_/g, ' '))
      .join(', ');
    moreCount = ingredientKeys.length - 3;
  } else if (recipe.ingredients) {
    // Custom recipes have ingredients array
    ingredientSummary = recipe.ingredients
      .filter(ing => ing.type)
      .map(ing => TYPE_LABELS[ing.type] || ing.type)
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
      </div>

      <div className="recipe-card-actions">
        <Link to={`/favorite/${recipe.id}`} className="recipe-action-btn view">
          View
        </Link>
        <button onClick={handleDelete} className="recipe-action-btn delete">
          Delete
        </button>
      </div>
    </div>
  );
}
