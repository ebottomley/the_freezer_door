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
  olive_brine: 'Olive Brine'
};

export default function SpiritSelector({ requiredSpirits, allSpirits, selectedSpirits, onSpiritChange }) {
  if (!requiredSpirits || requiredSpirits.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <h2>Select Spirits</h2>
      <div className="form-row">
        {requiredSpirits.map(spiritType => {
          const options = allSpirits[spiritType] || [];
          const label = SPIRIT_LABELS[spiritType] || spiritType;

          return (
            <div className="form-group" key={spiritType}>
              <label>{label}</label>
              <select
                value={selectedSpirits[spiritType] || ''}
                onChange={(e) => onSpiritChange(spiritType, e.target.value)}
              >
                <option value="">Select {label}...</option>
                {options.map(spirit => (
                  <option key={spirit.brand} value={spirit.brand}>
                    {spirit.brand} ({spirit.abv}%)
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
