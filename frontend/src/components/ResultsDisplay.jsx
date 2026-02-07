import { useState } from 'react'
import { formatSimplifiedAmount } from '../utils/simplifyMeasurements'

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
  olive_brine: 'Olive Brine',
  amaro: 'Amaro',
  tequila: 'Tequila',
  mezcal: 'Mezcal',
  agave_nectar: 'Agave Nectar',
  suze: 'Suze',
  lillet_blanc: 'Lillet Blanc'
};

export default function ResultsDisplay({ results, unit, servingSizeMl }) {
  const [simplified, setSimplified] = useState(false)

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

  const showOzFirst = unit === 'oz';

  const formatAmount = (ml, oz) => {
    if (simplified) {
      return (
        <span className="primary-amount">
          {formatSimplifiedAmount(ml, oz, showOzFirst)}
        </span>
      );
    }
    if (showOzFirst) {
      return (
        <>
          <span className="primary-amount">{oz} oz</span>
          <span className="secondary-amount">{ml} ml</span>
        </>
      );
    }
    return (
      <>
        <span className="primary-amount">{ml} ml</span>
        <span className="secondary-amount">{oz} oz</span>
      </>
    );
  };

  return (
    <div className="card results">
      <h2>{cocktail_name}</h2>
      <p className="subtitle">{variation_name} - Freezer Batch</p>

      <div className="simplify-toggle">
        <button
          className={`toggle-btn${simplified ? ' active' : ''}`}
          onClick={() => setSimplified(!simplified)}
        >
          Simplify measurements
        </button>
        {simplified && (
          <span className="toggle-hint">Rounded for easier measuring</span>
        )}
      </div>

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
              {formatAmount(ml, ingredients_oz[ingredient])}
            </div>
          </li>
        ))}

        <li className="ingredient-item water-highlight">
          <div className="ingredient-name">Water (for dilution)</div>
          <div className="ingredient-amount">
            {formatAmount(water_ml, water_oz)}
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
          <div className="stat-value">
            {showOzFirst ? `${total_volume_oz} oz` : `${total_volume_ml} ml`}
          </div>
          <div className="stat-label">Total Volume</div>
        </div>
        {servingSizeMl && (
          <div className="stat">
            <div className="stat-value">
              {Math.round(total_volume_ml / servingSizeMl)}
            </div>
            <div className="stat-label">Drinks</div>
          </div>
        )}
      </div>

      {garnish && (
        <div className="garnish">
          Garnish: {garnish}
        </div>
      )}
    </div>
  );
}
