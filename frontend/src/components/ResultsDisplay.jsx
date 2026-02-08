import { useState, useMemo } from 'react'
import { formatSimplifiedAmount, simplifyOz, simplifyMl } from '../utils/simplifyMeasurements'
import { generateRecipePdf } from './PdfExport/RecipePdf'
import { getSpiritLabel } from '../constants/spiritLabels'

export default function ResultsDisplay({ results, unit, servingSizeMl, isCustomRecipe, numDrinks, onSaveToFavorites, showActionButtons, saveButtonText }) {
  const [simplified, setSimplified] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Calculate simplified stats when in simplified mode
  // Note: useMemo must be called before any early returns (rules of hooks)
  const simplifiedStats = useMemo(() => {
    if (!simplified || !results) return null;

    const { ingredients, ingredients_oz, water_ml, water_oz, initial_abv } = results;

    // Get simplified values for each ingredient
    let sumSimplifiedIngredientsMl = 0;
    let sumSimplifiedIngredientsOz = 0;

    Object.entries(ingredients).forEach(([ingredient, ml]) => {
      const oz = ingredients_oz[ingredient];

      // Convert dashes and bar tsp back to ml/oz for summing
      const mlResult = simplifyMl(ml);
      const ozResult = simplifyOz(oz);

      let effectiveMl = mlResult.value;
      let effectiveOz = ozResult.value;

      if (mlResult.unit === 'dash') {
        effectiveMl = mlResult.value; // 1 dash ≈ 1ml
      } else if (mlResult.unit === 'bar tsp') {
        effectiveMl = mlResult.value * 5; // 1 bar tsp = 5ml
      }

      if (ozResult.unit === 'dash') {
        effectiveOz = ozResult.value / 29.57; // convert dashes (in ml) to oz
      } else if (ozResult.unit === 'bar tsp') {
        effectiveOz = (ozResult.value * 5) / 29.57; // convert bar tsp to oz
      }

      sumSimplifiedIngredientsMl += effectiveMl;
      sumSimplifiedIngredientsOz += effectiveOz;
    });

    // Get simplified water values
    const waterMlResult = simplifyMl(water_ml);
    const waterOzResult = simplifyOz(water_oz);

    let simplifiedWaterMl = waterMlResult.value;
    let simplifiedWaterOz = waterOzResult.value;

    if (waterMlResult.unit === 'bar tsp') {
      simplifiedWaterMl = waterMlResult.value * 5;
    }
    if (waterOzResult.unit === 'bar tsp') {
      simplifiedWaterOz = (waterOzResult.value * 5) / 29.57;
    }

    // Calculate simplified totals
    const simplifiedTotalMl = sumSimplifiedIngredientsMl + simplifiedWaterMl;
    const simplifiedTotalOz = sumSimplifiedIngredientsOz + simplifiedWaterOz;

    // Calculate simplified ABV values
    // Original alcohol content (in ml of pure alcohol)
    const originalSpiritVolume = Object.values(ingredients).reduce((sum, ml) => sum + ml, 0);
    const alcoholContentMl = originalSpiritVolume * (initial_abv / 100);

    // Simplified initial ABV = alcohol / sum of simplified ingredients
    const simplifiedInitialAbv = sumSimplifiedIngredientsMl > 0
      ? (alcoholContentMl / sumSimplifiedIngredientsMl) * 100
      : 0;

    // Simplified final ABV = alcohol / simplified total
    const simplifiedFinalAbv = simplifiedTotalMl > 0
      ? (alcoholContentMl / simplifiedTotalMl) * 100
      : 0;

    return {
      totalMl: Math.round(simplifiedTotalMl),
      totalOz: Math.round(simplifiedTotalOz * 4) / 4, // Round to nearest 1/4 oz
      initialAbv: Math.round(simplifiedInitialAbv * 10) / 10, // Round to 1 decimal
      finalAbv: Math.round(simplifiedFinalAbv * 10) / 10,
      waterMl: simplifiedWaterMl,
      waterOz: simplifiedWaterOz
    };
  }, [simplified, results]);

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
    if (simplified && simplifiedStats) {
      if (showOzFirst) {
        return `${simplifiedStats.totalOz} oz`;
      }
      return `${simplifiedStats.totalMl} ml`;
    }
    return showOzFirst ? `${total_volume_oz} oz` : `${total_volume_ml} ml`;
  };

  // Get displayed initial ABV (recalculated from simplified amounts if simplified)
  const getDisplayedInitialABV = () => {
    if (simplified && simplifiedStats) {
      return `${simplifiedStats.initialAbv}%`;
    }
    return `${initial_abv}%`;
  };

  // Get displayed final ABV (recalculated from simplified amounts if simplified)
  const getDisplayedFinalABV = () => {
    if (simplified && simplifiedStats) {
      return `${simplifiedStats.finalAbv}%`;
    }
    return `${final_abv}%`;
  };

  // Check if we should show drinks stat
  const showDrinksStat = numDrinks || servingSizeMl;

  // Get displayed drinks count
  const getDisplayedDrinks = () => {
    if (numDrinks) {
      return numDrinks;
    }
    if (servingSizeMl) {
      const volumeToUse = (simplified && simplifiedStats) ? simplifiedStats.totalMl : total_volume_ml;
      const drinks = volumeToUse / servingSizeMl;
      return Math.round(drinks);
    }
    return null;
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
          <span className="toggle-hint">Rounded for easier measuring. ABV and volume may vary slightly.</span>
        )}
      </div>

      <ul className="ingredients-list">
        {Object.entries(ingredients).map(([ingredient, ml]) => (
          <li key={ingredient} className="ingredient-item">
            <div className="ingredient-name">
              {getSpiritLabel(ingredient)}
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
          <div className="stat-value">{getDisplayedInitialABV()}</div>
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
        {showDrinksStat && (
          <div className="stat">
            <div className="stat-value">{getDisplayedDrinks()}</div>
            <div className="stat-label">Drinks</div>
          </div>
        )}
      </div>

      {garnish && (
        <div className="garnish">
          Garnish: {garnish}
        </div>
      )}

      {(isCustomRecipe || showActionButtons) && (
        <div className="results-actions">
          {onSaveToFavorites && (
            <button
              className="save-favorite-btn"
              onClick={onSaveToFavorites}
            >
              {saveButtonText || 'Save to Favorites'}
            </button>
          )}
          <button
            className="export-btn"
            onClick={async () => {
              setExporting(true);
              try {
                const displayedDrinks = getDisplayedDrinks();
                await generateRecipePdf(results, unit, simplified, displayedDrinks);
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
        </div>
      )}
    </div>
  );
}
