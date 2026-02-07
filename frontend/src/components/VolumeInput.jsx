const ML_PER_OZ = 29.5735;

export default function VolumeInput({ volume, unit, onVolumeChange, onUnitChange, servingSizeMl, mode, onModeChange }) {
  const handleUnitChange = (newUnit) => {
    if (newUnit !== unit && volume > 0) {
      const convertedVolume = newUnit === 'oz'
        ? parseFloat((volume / ML_PER_OZ).toFixed(1))  // ml -> oz
        : Math.round(volume * ML_PER_OZ);               // oz -> ml
      onVolumeChange(convertedVolume);
    }
    onUnitChange(newUnit);
  };

  const handleDrinksChange = (numDrinks) => {
    const drinks = parseInt(numDrinks) || 0;
    if (servingSizeMl && drinks > 0) {
      const totalMl = drinks * servingSizeMl;
      onVolumeChange(unit === 'oz' ? totalMl / 29.5735 : totalMl);
    }
  };

  const currentDrinks = servingSizeMl ? Math.round((unit === 'oz' ? volume * 29.5735 : volume) / servingSizeMl) : 0;

  return (
    <div className="card">
      <h2>Batch Size</h2>
      <div className="form-group">
        <label>Calculate by</label>
        <div className="preset-buttons">
          <button
            className={`preset-btn ${mode === 'volume' ? 'active' : ''}`}
            onClick={() => onModeChange('volume')}
          >
            Volume
          </button>
          <button
            className={`preset-btn ${mode === 'drinks' ? 'active' : ''}`}
            onClick={() => onModeChange('drinks')}
            disabled={!servingSizeMl}
          >
            Number of Drinks
          </button>
        </div>
      </div>

      {mode === 'volume' ? (
        <div className="form-row">
          <div className="form-group">
            <label>Target Volume</label>
            <input
              type="number"
              min={unit === 'oz' ? 3 : 100}
              max={unit === 'oz' ? 170 : 5000}
              step={unit === 'oz' ? 1 : 50}
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value) || 0)}
              placeholder="Enter volume..."
            />
          </div>
          <div className="form-group">
            <label>Unit</label>
            <select value={unit} onChange={(e) => handleUnitChange(e.target.value)}>
              <option value="ml">Milliliters (ml)</option>
              <option value="oz">Fluid Ounces (oz)</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="form-row">
          <div className="form-group">
            <label>Number of Drinks</label>
            <input
              type="number"
              min="1"
              max="50"
              step="1"
              value={currentDrinks}
              onChange={(e) => handleDrinksChange(e.target.value)}
              placeholder="Enter number of drinks..."
            />
          </div>
          <div className="form-group">
            <label>Display Unit</label>
            <select value={unit} onChange={(e) => handleUnitChange(e.target.value)}>
              <option value="ml">Milliliters (ml)</option>
              <option value="oz">Fluid Ounces (oz)</option>
            </select>
          </div>
        </div>
      )}

      {mode === 'drinks' && servingSizeMl && (
        <p className="serving-info">
          {currentDrinks} drink{currentDrinks !== 1 ? 's' : ''} × {servingSizeMl} ml = {currentDrinks * servingSizeMl} ml total
        </p>
      )}
    </div>
  );
}
