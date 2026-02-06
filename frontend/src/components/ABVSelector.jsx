export default function ABVSelector({ targetABV, onABVChange }) {
  const presets = [
    { id: 'weak', name: 'Weak', abv: 22 },
    { id: 'normal', name: 'Normal', abv: 24 },
    { id: 'strong', name: 'Strong', abv: 26 },
  ];

  return (
    <div className="card">
      <h2>Target ABV</h2>
      <div className="form-group">
        <label>Strength Presets</label>
        <div className="preset-buttons">
          {presets.map(preset => (
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
          max="30"
          step="0.5"
          value={targetABV}
          onChange={(e) => onABVChange(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}
