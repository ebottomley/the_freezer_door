import { useState } from 'react'
import { formatSimplifiedAmount, simplifyOz, simplifyMl } from '../utils/simplifyMeasurements'
import { generateRecipePdf } from './PdfExport/RecipePdf'

const SPIRIT_LABELS = {
  gin: 'Gin',
  vodka: 'Vodka',
  bourbon: 'Bourbon',
  rye: 'Rye Whiskey',
  vermouth_dry: 'Dry Vermouth',
  vermouth_sweet: 'Sweet Vermouth',
  orange_liqueur: 'Orange Liqueur',
  campari: 'Campari',
  suze: 'Suze',
  green_chartreuse: 'Green Chartreuse',
  yellow_chartreuse: 'Yellow Chartreuse',
  angostura: 'Angostura Bitters',
  peychauds: "Peychaud's Bitters",
  orange_bitters: 'Orange Bitters',
  simple_syrup: 'Simple Syrup',
  olive_brine: 'Olive Brine',
  amaro: 'Amaro',
  tequila: 'Tequila',
  mezcal: 'Mezcal',
  agave_nectar: 'Agave Nectar',
  lillet_blanc: 'Lillet Blanc',
  coffee_liqueur: 'Coffee Liqueur',
  lime_juice: 'Lime Juice',
  lemon_juice: 'Lemon Juice',
  grapefruit_juice: 'Grapefruit Juice',
  orange_juice: 'Orange Juice',
  honey_syrup: 'Honey Syrup',
  demerara_syrup: 'Demerara Syrup',
  cream: 'Cream',
  egg_white: 'Egg White'
};

export default function ResultsDisplay({ results, unit, servingSizeMl, isCustomRecipe, numDrinks }) {
  const [simplified, setSimplified] = useState(false)
  const [exporting, setExporting] = useState(false)

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

  // Get simplified or exact total volume
  const getDisplayedTotalVolume = () => {
    if (simplified) {
      if (showOzFirst) {
        return simplifyOz(total_volume_oz).display;
      }
      return simplifyMl(total_volume_ml).display;
    }
    return showOzFirst ? `${total_volume_oz} oz` : `${total_volume_ml} ml`;
  };

  // Get displayed final ABV (rounded if simplified)
  const getDisplayedFinalABV = () => {
    if (simplified) {
      return `${Math.round(final_abv)}%`;
    }
    return `${final_abv}%`;
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
              {SPIRIT_LABELS[ingredient] || ingredient.replace(/_\d+$/, '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
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
          <div className="stat-value">{getDisplayedFinalABV()}</div>
          <div className="stat-label">Final ABV</div>
        </div>
        <div className="stat">
          <div className="stat-value">{getDisplayedTotalVolume()}</div>
          <div className="stat-label">Total Volume</div>
        </div>
        {numDrinks && (
          <div className="stat">
            <div className="stat-value">{numDrinks}</div>
            <div className="stat-label">Drinks</div>
          </div>
        )}
        {!numDrinks && servingSizeMl && (
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

      {isCustomRecipe && (
        <button
          className="export-btn"
          onClick={async () => {
            setExporting(true);
            try {
              await generateRecipePdf(results, unit);
            } catch (err) {
              console.error('PDF export failed:', err);
            } finally {
              setExporting(false);
            }
          }}
          disabled={exporting}
        >
          {exporting ? 'Generating PDF...' : 'Export as PDF'}
        </button>
      )}
    </div>
  );
}
