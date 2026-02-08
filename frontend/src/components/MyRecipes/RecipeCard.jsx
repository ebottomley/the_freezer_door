import { Link } from 'react-router-dom';

const TYPE_LABELS = {
  vodka: 'Vodka',
  gin: 'Gin',
  bourbon: 'Bourbon',
  rye: 'Rye',
  tequila: 'Tequila',
  mezcal: 'Mezcal',
  orange_liqueur: 'Orange Liqueur',
  campari: 'Campari',
  amaro: 'Amaro',
  suze: 'Suze',
  coffee_liqueur: 'Coffee Liqueur',
  vermouth_dry: 'Dry Vermouth',
  vermouth_sweet: 'Sweet Vermouth',
  lillet_blanc: 'Lillet Blanc',
  angostura: 'Angostura',
  peychauds: "Peychaud's",
  orange_bitters: 'Orange Bitters',
  simple_syrup: 'Simple Syrup',
  agave_nectar: 'Agave',
  honey_syrup: 'Honey Syrup',
  demerara_syrup: 'Demerara',
  lime_juice: 'Lime',
  lemon_juice: 'Lemon',
  grapefruit_juice: 'Grapefruit',
  orange_juice: 'Orange',
  olive_brine: 'Olive Brine',
  cream: 'Cream',
  egg_white: 'Egg White'
};

export default function RecipeCard({ recipe, onDelete }) {
  const ingredientSummary = recipe.ingredients
    .filter(ing => ing.type)
    .map(ing => TYPE_LABELS[ing.type] || ing.type)
    .slice(0, 3)
    .join(', ');

  const moreCount = recipe.ingredients.filter(ing => ing.type).length - 3;

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
        <Link to={`/build/${recipe.id}`} className="recipe-action-btn edit">
          Edit
        </Link>
        <button onClick={handleDelete} className="recipe-action-btn delete">
          Delete
        </button>
      </div>
    </div>
  );
}
