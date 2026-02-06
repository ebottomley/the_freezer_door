export default function VolumeInput({ volume, unit, onVolumeChange, onUnitChange }) {
  return (
    <div className="card">
      <h2>Batch Size</h2>
      <div className="form-row">
        <div className="form-group">
          <label>Target Volume</label>
          <input
            type="number"
            min="100"
            max="5000"
            step="50"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value) || 0)}
            placeholder="Enter volume..."
          />
        </div>
        <div className="form-group">
          <label>Unit</label>
          <select value={unit} onChange={(e) => onUnitChange(e.target.value)}>
            <option value="ml">Milliliters (ml)</option>
            <option value="oz">Fluid Ounces (oz)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
