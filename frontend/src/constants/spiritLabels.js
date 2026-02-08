/**
 * Human-readable labels for spirit/ingredient types
 * Used across the application for consistent display
 */
export const SPIRIT_LABELS = {
  // Base spirits
  gin: 'Gin',
  vodka: 'Vodka',
  bourbon: 'Bourbon',
  rye: 'Rye Whiskey',
  tequila: 'Tequila',
  mezcal: 'Mezcal',

  // Vermouths & aperitifs
  vermouth_dry: 'Dry Vermouth',
  vermouth_sweet: 'Sweet Vermouth',
  lillet_blanc: 'Lillet Blanc',

  // Liqueurs
  orange_liqueur: 'Orange Liqueur',
  campari: 'Campari',
  amaro: 'Amaro',
  suze: 'Suze',
  herbal_liqueur: 'Herbal Liqueur',
  coffee_liqueur: 'Coffee Liqueur',

  // Bitters
  angostura: 'Angostura Bitters',
  peychauds: "Peychaud's Bitters",
  orange_bitters: 'Orange Bitters',

  // Syrups
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

/**
 * Get the display label for a spirit type
 * Falls back to formatting the key if not found
 * @param {string} spiritType - The spirit type key
 * @returns {string} Human-readable label
 */
export function getSpiritLabel(spiritType) {
  if (SPIRIT_LABELS[spiritType]) {
    return SPIRIT_LABELS[spiritType];
  }
  // Fallback: convert snake_case to Title Case
  return spiritType
    .replace(/_\d+$/, '') // Remove trailing numbers (e.g., gin_1 -> gin)
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
