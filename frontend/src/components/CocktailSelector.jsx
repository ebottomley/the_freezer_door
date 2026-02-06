export default function CocktailSelector({ cocktails, selectedCocktail, selectedVariation, onCocktailChange, onVariationChange }) {
  const cocktail = cocktails.find(c => c.id === selectedCocktail);
  const variations = cocktail?.variations || [];

  return (
    <div className="card">
      <h2>Select Cocktail</h2>
      <div className="form-row">
        <div className="form-group">
          <label>Cocktail</label>
          <select
            value={selectedCocktail}
            onChange={(e) => onCocktailChange(e.target.value)}
          >
            <option value="">Choose a cocktail...</option>
            {cocktails.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Variation</label>
          <select
            value={selectedVariation}
            onChange={(e) => onVariationChange(e.target.value)}
            disabled={!selectedCocktail}
          >
            <option value="">Choose a variation...</option>
            {variations.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
