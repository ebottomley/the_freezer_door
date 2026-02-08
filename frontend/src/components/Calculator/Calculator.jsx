import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import CocktailSelector from '../CocktailSelector';
import SpiritSelector from '../SpiritSelector';
import VolumeInput from '../VolumeInput';
import ABVSelector from '../ABVSelector';
import ResultsDisplay from '../ResultsDisplay';
import Header from '../Header/Header';
import { getCocktails, getSpirits, calculateRecipe } from '../../services/api';
import { saveFavoriteFromCalculator, updateFavorite } from '../../services/localStorage';

const DEFAULT_VARIATIONS = {
  martini: 'classic',
  manhattan: 'classic',
  old_fashioned: 'bourbon',
  negroni: 'classic',
};

const ML_PER_OZ = 29.5735;
const DEFAULT_DRINKS = 6;
const DEFAULT_SERVING_OZ = 3.5;

const calculateDefaultVolume = (servingSizeMl, currentUnit) => {
  // Use clean oz values for oz mode, ml for ml mode
  if (currentUnit === 'oz') {
    const servingOz = servingSizeMl ? servingSizeMl / ML_PER_OZ : DEFAULT_SERVING_OZ;
    // Round serving to nearest 0.5 oz for clean numbers
    const cleanServingOz = Math.round(servingOz * 2) / 2;
    return DEFAULT_DRINKS * cleanServingOz;
  }
  const serving = servingSizeMl || Math.round(DEFAULT_SERVING_OZ * ML_PER_OZ);
  return DEFAULT_DRINKS * serving;
};

function Calculator() {
  const { cocktailId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're editing an existing favorite
  const editingFavoriteId = location.state?.favoriteId;
  const editingFavorite = location.state?.favorite;

  const [cocktails, setCocktails] = useState([]);
  const [spirits, setSpirits] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCocktail, setSelectedCocktail] = useState('');
  const [selectedVariation, setSelectedVariation] = useState('');
  const [selectedSpirits, setSelectedSpirits] = useState({});
  const [volume, setVolume] = useState(DEFAULT_DRINKS * DEFAULT_SERVING_OZ);
  const [unit, setUnit] = useState('oz');
  const [volumeMode, setVolumeMode] = useState('volume');
  const [targetABV, setTargetABV] = useState(24);
  const [customName, setCustomName] = useState('');

  const [results, setResults] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const [requiredSpirits, setRequiredSpirits] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [cocktailData, spiritData] = await Promise.all([
          getCocktails(),
          getSpirits()
        ]);
        setCocktails(cocktailData);
        setSpirits(spiritData);

        // If editing an existing favorite, use its settings
        if (editingFavorite) {
          setSelectedCocktail(editingFavorite.cocktailId);
          setSelectedVariation(editingFavorite.variationId);
          setTargetABV(editingFavorite.targetABV);
          setVolume(editingFavorite.volume);
          setUnit(editingFavorite.unit || 'oz');
          setCustomName(editingFavorite.name || '');
          // Spirits will be set after variation loads
          if (editingFavorite.spirits) {
            setSelectedSpirits(editingFavorite.spirits);
          }
        }
        // If we have a cocktailId from the URL but not editing, use defaults
        else if (cocktailId && cocktailData.some(c => c.id === cocktailId)) {
          setSelectedCocktail(cocktailId);
          const cocktail = cocktailData.find(c => c.id === cocktailId);
          if (cocktail?.presets?.classic) {
            setTargetABV(cocktail.presets.classic.abv);
          }
          if (cocktail?.serving_size_ml) {
            setVolume(calculateDefaultVolume(cocktail.serving_size_ml, 'oz'));
          }
          // Pre-select the default variation for this cocktail
          const defaultVariation = DEFAULT_VARIATIONS[cocktailId];
          if (defaultVariation) {
            setSelectedVariation(defaultVariation);
          }
        }
      } catch (err) {
        setError('Failed to load data. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [cocktailId, editingFavorite]);

  useEffect(() => {
    async function loadVariationDetails() {
      if (!selectedCocktail || !selectedVariation) {
        setRequiredSpirits([]);
        setSelectedSpirits({});
        return;
      }

      try {
        const response = await fetch(`/api/cocktails/${selectedCocktail}`);
        const data = await response.json();
        const variation = data.variations[selectedVariation];
        if (variation) {
          setRequiredSpirits(variation.ingredients);
          // Pre-select first option for each spirit
          const preSelected = {};
          variation.ingredients.forEach(ingredient => {
            if (spirits[ingredient] && spirits[ingredient].length > 0) {
              preSelected[ingredient] = spirits[ingredient][0].brand;
            }
          });
          setSelectedSpirits(preSelected);
        }
      } catch (err) {
        console.error('Failed to load variation details');
      }
    }
    loadVariationDetails();
  }, [selectedCocktail, selectedVariation, spirits]);

  const handleCocktailChange = (cocktailId) => {
    setSelectedCocktail(cocktailId);
    setResults(null);

    // Set default ABV and variation
    const cocktail = cocktails.find(c => c.id === cocktailId);
    if (cocktail?.presets?.classic) {
      setTargetABV(cocktail.presets.classic.abv);
    }
    if (cocktail?.serving_size_ml) {
      setVolume(calculateDefaultVolume(cocktail.serving_size_ml, unit));
    }

    // Pre-select the default variation for this cocktail
    const defaultVariation = DEFAULT_VARIATIONS[cocktailId];
    if (defaultVariation) {
      setSelectedVariation(defaultVariation);
    } else {
      setSelectedVariation('');
    }

    // Update URL to reflect selection
    if (cocktailId) {
      navigate(`/cocktail/${cocktailId}`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const selectedCocktailData = cocktails.find(c => c.id === selectedCocktail);

  const handleVariationChange = (variationId) => {
    setSelectedVariation(variationId);
    setResults(null);
  };

  const handleSpiritChange = (spiritType, brand) => {
    setSelectedSpirits(prev => ({
      ...prev,
      [spiritType]: brand
    }));
    setResults(null);
  };

  const handleCalculate = async () => {
    setCalculating(true);
    setError(null);

    try {
      const volumeInMl = unit === 'oz' ? volume * 29.5735 : volume;

      const result = await calculateRecipe({
        cocktail: selectedCocktail,
        variation: selectedVariation,
        spirits: selectedSpirits,
        target_volume_ml: volumeInMl,
        target_abv: targetABV
      });

      setResults(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setCalculating(false);
    }
  };

  const handleSaveToFavorites = () => {
    if (!results) return;

    // Use custom name if set, otherwise use cocktail name from results
    const favoriteName = customName.trim() || results.cocktail_name;

    // Calculate number of drinks from volume and serving size
    const servingSizeMl = selectedCocktailData?.serving_size_ml;
    const volumeInMl = unit === 'oz' ? volume * ML_PER_OZ : volume;
    const numDrinks = servingSizeMl ? Math.round(volumeInMl / servingSizeMl) : undefined;

    // Update results with custom name for display
    const resultsWithName = {
      ...results,
      cocktail_name: favoriteName
    };

    try {
      if (editingFavoriteId) {
        // Update existing favorite
        updateFavorite({
          id: editingFavoriteId,
          type: 'standard',
          name: favoriteName,
          cocktailId: selectedCocktail,
          variationId: selectedVariation,
          spirits: selectedSpirits,
          targetABV,
          volume,
          unit,
          numDrinks,
          results: resultsWithName
        });
        setSaveStatus({ type: 'success', message: 'Favorite updated!' });
      } else {
        // Create new favorite
        saveFavoriteFromCalculator({
          cocktailId: selectedCocktail,
          variationId: selectedVariation,
          spirits: selectedSpirits,
          results: resultsWithName,
          targetABV,
          volume,
          unit,
          numDrinks
        });
        setSaveStatus({ type: 'success', message: 'Saved to favorites!' });
      }
      // Navigate to favorites after saving
      setTimeout(() => {
        navigate('/my-favorites');
      }, 1000);
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.message });
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const canCalculate = selectedCocktail &&
    selectedVariation &&
    requiredSpirits.every(s => selectedSpirits[s]) &&
    volume > 0;

  if (loading) {
    return (
      <div className="calculator-page">
        <Header showBack={!!cocktailId} />
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="calculator-page">
      <Header showBack={!!cocktailId} />
      <div className="container">
        {error && <div className="error">{error}</div>}

        <CocktailSelector
          cocktails={cocktails}
          selectedCocktail={selectedCocktail}
          selectedVariation={selectedVariation}
          onCocktailChange={handleCocktailChange}
          onVariationChange={handleVariationChange}
        />

        {editingFavoriteId && (
          <div className="card">
            <h2>Favorite Name</h2>
            <input
              type="text"
              className="recipe-name-input"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={results?.cocktail_name || 'Custom name for this favorite'}
            />
          </div>
        )}

        <SpiritSelector
          requiredSpirits={requiredSpirits}
          allSpirits={spirits}
          selectedSpirits={selectedSpirits}
          onSpiritChange={handleSpiritChange}
        />

        <VolumeInput
          volume={volume}
          unit={unit}
          onVolumeChange={setVolume}
          onUnitChange={setUnit}
          servingSizeMl={selectedCocktailData?.serving_size_ml}
          mode={volumeMode}
          onModeChange={setVolumeMode}
        />

        <ABVSelector
          targetABV={targetABV}
          onABVChange={setTargetABV}
          presets={selectedCocktailData?.presets}
        />

        <button
          className="calculate-btn"
          onClick={handleCalculate}
          disabled={!canCalculate || calculating}
        >
          {calculating ? 'Calculating...' : 'Calculate Recipe'}
        </button>

        {saveStatus && (
          <div className={`save-status ${saveStatus.type}`}>
            {saveStatus.message}
          </div>
        )}

        <ResultsDisplay
          results={results}
          unit={unit}
          servingSizeMl={selectedCocktailData?.serving_size_ml}
          onSaveToFavorites={handleSaveToFavorites}
          showActionButtons
          saveButtonText={editingFavoriteId ? 'Update Favorite' : 'Save to Favorites'}
        />
      </div>
    </div>
  );
}

export default Calculator;
