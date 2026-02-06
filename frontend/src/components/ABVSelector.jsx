const DEFAULT_PRESETS = {
  mild: { name: 'Mild', abv: 22 },
  normal: { name: 'Normal', abv: 24 },
  strong: { name: 'Strong', abv: 26 },
};

export default function ABVSelector({ targetABV, onABVChange, presets }) {
  const activePresets = presets && Object.keys(presets).length > 0 ? presets : DEFAULT_PRESETS;
  const presetList = Object.entries(activePresets).map(([id, preset]) => ({
    id,
    ...preset
  }));

  const maxABV = Math.max(35, ...presetList.map(p => p.abv));

  return (
    <div className="card">
      <h2>Target ABV</h2>
      <div className="form-group">
        <label>Strength Presets</label>
        <div className="preset-buttons">
          {presetList.map(preset => (
            <button
              key={preset.id}
              className={`preset-btn ${targetABV === preset.abv ? 'active' : ''}`}
              onClick={() => onABVChange(preset.abv)}
            >
              {preset.name} ({preset.abv}%)
            </button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label>Custom ABV ({targetABV}%)</label>
        <input
          type="range"
          min="18"
          max={maxABV}
          step="0.5"
          value={targetABV}
          onChange={(e) => onABVChange(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}
