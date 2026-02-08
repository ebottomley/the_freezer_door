const TYPE_LABELS = {
  // Spirits
  vodka: 'Vodka',
  gin: 'Gin',
  bourbon: 'Bourbon',
  rye: 'Rye Whiskey',
  tequila: 'Tequila',
  mezcal: 'Mezcal',
  // Liqueurs
  orange_liqueur: 'Orange Liqueur',
  amaro: 'Amaro',
  coffee_liqueur: 'Coffee Liqueur',
  // Herbal Liqueurs
  green_chartreuse: 'Green Chartreuse',
  yellow_chartreuse: 'Yellow Chartreuse',
  // Bitter Aperitifs
  campari: 'Campari',
  suze: 'Suze',
  // Vermouths
  vermouth_dry: 'Dry Vermouth',
  vermouth_sweet: 'Sweet Vermouth',
  lillet_blanc: 'Lillet Blanc',
  // Bitters
  angostura: 'Angostura Bitters',
  peychauds: "Peychaud's Bitters",
  orange_bitters: 'Orange Bitters',
  // Sweeteners
  simple_syrup: 'Simple Syrup',
  agave_nectar: 'Agave Nectar',
  honey_syrup: 'Honey Syrup',
  demerara_syrup: 'Demerara Syrup',
  // Juices
  lime_juice: 'Lime Juice',
  lemon_juice: 'Lemon Juice',
  grapefruit_juice: 'Grapefruit Juice',
  orange_juice: 'Orange Juice',
  // Other
  olive_brine: 'Olive Brine',
  cream: 'Cream',
  egg_white: 'Egg White'
};

export default function IngredientRow({
  ingredient,
  ingredientCategories,
  index,
  onUpdate,
  onRemove,
  canRemove
}) {
  const { category, type, brand, parts, abv, isCustomBrand } = ingredient;

  const handleCategoryChange = (newCategory) => {
    onUpdate(index, {
      category: newCategory,
      type: '',
      brand: '',
      parts: parts || 1,
      abv: 0,
      isCustomBrand: false
    });
  };

  const handleTypeChange = (newType) => {
    const categoryData = ingredientCategories[category];
    const brands = categoryData?.types?.[newType] || [];
    const firstBrand = brands[0];

    onUpdate(index, {
      ...ingredient,
      type: newType,
      brand: firstBrand?.brand || '',
      abv: firstBrand?.abv || 0,
      isCustomBrand: false
    });
  };

  const handleBrandChange = (newBrand) => {
    if (newBrand === '__custom__') {
      onUpdate(index, {
        ...ingredient,
        brand: '',
        abv: 0,
        isCustomBrand: true
      });
    } else {
      const categoryData = ingredientCategories[category];
      const brands = categoryData?.types?.[type] || [];
      const selectedBrand = brands.find(b => b.brand === newBrand);

      onUpdate(index, {
        ...ingredient,
        brand: newBrand,
        abv: selectedBrand?.abv || 0,
        isCustomBrand: false
      });
    }
  };

  const handlePartsChange = (newParts) => {
    onUpdate(index, {
      ...ingredient,
      parts: parseFloat(newParts) || 0
    });
  };

  const handleCustomBrandChange = (customBrand) => {
    onUpdate(index, {
      ...ingredient,
      brand: customBrand
    });
  };

  const handleCustomABVChange = (customABV) => {
    onUpdate(index, {
      ...ingredient,
      abv: parseFloat(customABV) || 0
    });
  };

  const categoryData = ingredientCategories[category];
  const measurementUnit = categoryData?.measurement_unit || 'parts';
  const availableTypes = categoryData?.types ? Object.keys(categoryData.types) : [];
  const availableBrands = categoryData?.types?.[type] || [];

  return (
    <div className="ingredient-row">
      <div className="ingredient-row-selectors">
        <div className="form-group">
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">Select category...</option>
            {Object.entries(ingredientCategories).map(([catId, cat]) => (
              <option key={catId} value={catId}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {category && (
          <div className="form-group">
            <label>Type</label>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              <option value="">Select type...</option>
              {availableTypes.map((typeId) => (
                <option key={typeId} value={typeId}>
                  {TYPE_LABELS[typeId] || typeId}
                </option>
              ))}
            </select>
          </div>
        )}

        {type && (
          <div className="form-group">
            <label>Brand</label>
            <select
              value={isCustomBrand ? '__custom__' : brand}
              onChange={(e) => handleBrandChange(e.target.value)}
            >
              <option value="">Select brand...</option>
              {availableBrands.map((b) => (
                <option key={b.brand} value={b.brand}>
                  {b.brand} ({b.abv}%)
                </option>
              ))}
              <option value="__custom__">Custom...</option>
            </select>
          </div>
        )}

        {isCustomBrand && (
          <>
            <div className="form-group">
              <label>Custom Brand Name</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => handleCustomBrandChange(e.target.value)}
                placeholder="Enter brand name..."
              />
            </div>
            <div className="form-group">
              <label>ABV (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={abv}
                onChange={(e) => handleCustomABVChange(e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      <div className="ingredient-row-amount">
        <div className="form-group">
          <label>{measurementUnit === 'dashes' ? 'Dashes' : 'Parts'}</label>
          <input
            type="number"
            min="0.1"
            max="10"
            step="0.1"
            value={parts}
            onChange={(e) => handlePartsChange(e.target.value)}
            disabled={!type}
          />
        </div>
      </div>

      {canRemove && (
        <button
          type="button"
          className="remove-ingredient-btn"
          onClick={() => onRemove(index)}
          aria-label="Remove ingredient"
        >
          &times;
        </button>
      )}
    </div>
  );
}
