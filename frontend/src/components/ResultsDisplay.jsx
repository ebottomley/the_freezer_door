const SPIRIT_LABELS = {
  gin: 'Gin',
  vodka: 'Vodka',
  bourbon: 'Bourbon',
  rye: 'Rye Whiskey',
  vermouth_dry: 'Dry Vermouth',
  vermouth_sweet: 'Sweet Vermouth',
  orange_liqueur: 'Orange Liqueur',
  campari: 'Campari',
  angostura: 'Bitters',
  simple_syrup: 'Simple Syrup',
  olive_brine: 'Olive Brine'
};

export default function ResultsDisplay({ results }) {
  if (!results) return null;

  const {
    ingredients,
    ingredients_oz,
    water_ml,
    water_oz,
    initial_abv,
    final_abv,
    total_volume_ml,
    total_volume_oz,
    spirit_brands,
    cocktail_name,
    variation_name,
    garnish
  } = results;

  return (
    <div className="card results">
      <h2>{cocktail_name}</h2>
      <p className="subtitle">{variation_name} - Freezer Batch</p>

      <ul className="ingredients-list">
        {Object.entries(ingredients).map(([ingredient, ml]) => (
          <li key={ingredient} className="ingredient-item">
            <div className="ingredient-name">
              {SPIRIT_LABELS[ingredient] || ingredient}
              {spirit_brands[ingredient] && (
                <span className="ingredient-brand">{spirit_brands[ingredient]}</span>
              )}
            </div>
            <div className="ingredient-amount">
              <span className="ml">{ml} ml</span>
              <span className="oz">{ingredients_oz[ingredient]} oz</span>
            </div>
          </li>
        ))}

        <li className="ingredient-item water-highlight">
          <div className="ingredient-name">Water (for dilution)</div>
          <div className="ingredient-amount">
            <span className="ml">{water_ml} ml</span>
            <span className="oz">{water_oz} oz</span>
          </div>
        </li>
      </ul>

      <div className="stats">
        <div className="stat">
          <div className="stat-value">{initial_abv}%</div>
          <div className="stat-label">Initial ABV</div>
        </div>
        <div className="stat">
          <div className="stat-value">{final_abv}%</div>
          <div className="stat-label">Final ABV</div>
        </div>
        <div className="stat">
          <div className="stat-value">{total_volume_ml} ml</div>
          <div className="stat-label">Total Volume</div>
        </div>
      </div>

      {garnish && (
        <div className="garnish">
          Garnish: {garnish}
        </div>
      )}
    </div>
  );
}
