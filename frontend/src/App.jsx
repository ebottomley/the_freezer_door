import { useState, useEffect } from 'react';
import CocktailSelector from './components/CocktailSelector';
import SpiritSelector from './components/SpiritSelector';
import VolumeInput from './components/VolumeInput';
import ABVSelector from './components/ABVSelector';
import ResultsDisplay from './components/ResultsDisplay';
import { getCocktails, getSpirits, calculateRecipe } from './services/api';

function App() {
  const [cocktails, setCocktails] = useState([]);
  const [spirits, setSpirits] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCocktail, setSelectedCocktail] = useState('');
  const [selectedVariation, setSelectedVariation] = useState('');
  const [selectedSpirits, setSelectedSpirits] = useState({});
  const [volume, setVolume] = useState(750);
  const [unit, setUnit] = useState('ml');
  const [volumeMode, setVolumeMode] = useState('volume');
  const [targetABV, setTargetABV] = useState(24);

  const [results, setResults] = useState(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [cocktailData, spiritData] = await Promise.all([
          getCocktails(),
          getSpirits()
        ]);
        setCocktails(cocktailData);
        setSpirits(spiritData);
      } catch (err) {
        setError('Failed to load data. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getRequiredSpirits = () => {
    const cocktail = cocktails.find(c => c.id === selectedCocktail);
    if (!cocktail || !selectedVariation) return [];

    const response = fetch(`/api/cocktails/${selectedCocktail}`);
    return [];
  };

  const [requiredSpirits, setRequiredSpirits] = useState([]);

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
    setSelectedVariation('');
    setResults(null);
    // Set default ABV to the cocktail's "normal" preset
    const cocktail = cocktails.find(c => c.id === cocktailId);
    if (cocktail?.presets?.normal) {
      setTargetABV(cocktail.presets.normal.abv);
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
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h1>The Freezer Door</h1>
        <p>Calculate perfect batch freezer cocktails</p>
      </header>

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

      <ResultsDisplay results={results} unit={unit} />
    </div>
  );
}

export default App;
