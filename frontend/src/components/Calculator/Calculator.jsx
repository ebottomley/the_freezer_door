import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CocktailSelector from '../CocktailSelector';
import SpiritSelector from '../SpiritSelector';
import VolumeInput from '../VolumeInput';
import ABVSelector from '../ABVSelector';
import ResultsDisplay from '../ResultsDisplay';
import Header from '../Header/Header';
import { getCocktails, getSpirits, calculateRecipe } from '../../services/api';

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

  const [results, setResults] = useState(null);
  const [calculating, setCalculating] = useState(false);

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

        // If we have a cocktailId from the URL, pre-select it and its default variation
        if (cocktailId && cocktailData.some(c => c.id === cocktailId)) {
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
  }, [cocktailId]);

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

        <ResultsDisplay results={results} unit={unit} servingSizeMl={selectedCocktailData?.serving_size_ml} />
      </div>
    </div>
  );
}

export default Calculator;
