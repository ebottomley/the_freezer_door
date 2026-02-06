/**
 * Simplify ml amounts for practical bar measurements
 * @param {number} ml - The amount in milliliters
 * @returns {{ value: number, unit: string, display: string }}
 */
export function simplifyMl(ml) {
  // Handle zero and negative values
  if (ml <= 0) {
    return { value: 0, unit: 'dash', display: '0 dashes' }
  }

  // Dash amounts (< 5ml) - round to nearest 1ml (1 dash ≈ 1ml)
  if (ml < 5) {
    const dashes = Math.round(ml)
    const display = dashes === 1 ? '1 dash' : `${dashes} dashes`
    return { value: dashes, unit: 'dash', display }
  }

  // Bar teaspoon amounts (5ml - 7.4ml) - 1 bar tsp = 5ml
  // Round to nearest 0.5 bar teaspoon
  if (ml < 7.5) {
    const barTsp = Math.round((ml / 5) * 2) / 2
    return { value: barTsp, unit: 'bar tsp', display: `${barTsp} bar tsp` }
  }

  // Standard ml amounts (>= 7.5ml) - round to nearest 5ml
  const rounded = Math.round(ml / 5) * 5
  return { value: rounded, unit: 'ml', display: `${rounded} ml` }
}

/**
 * Simplify oz amounts for practical bar measurements
 * @param {number} oz - The amount in ounces
 * @returns {{ value: number, unit: string, display: string }}
 */
export function simplifyOz(oz) {
  // Handle zero and negative values
  if (oz <= 0) {
    return { value: 0, unit: 'dash', display: '0 dashes' }
  }

  // Convert to ml for small amount thresholds
  // 1 oz ≈ 29.57ml, so 5ml ≈ 0.17 oz, 7.5ml ≈ 0.25 oz
  const ML_PER_OZ = 29.57
  const ml = oz * ML_PER_OZ

  // Dash amounts (< 5ml / < 0.17 oz)
  if (ml < 5) {
    const dashes = Math.round(ml) // 1 dash ≈ 1ml
    const display = dashes === 1 ? '1 dash' : `${dashes} dashes`
    return { value: dashes, unit: 'dash', display }
  }

  // Bar teaspoon amounts (5ml - 7.4ml / 0.17 - 0.25 oz)
  if (ml < 7.5) {
    const barTsp = Math.round((ml / 5) * 2) / 2
    return { value: barTsp, unit: 'bar tsp', display: `${barTsp} bar tsp` }
  }

  // Standard oz amounts (>= 0.25 oz) - round to nearest 1/4 oz
  const rounded = Math.round(oz * 4) / 4
  return { value: rounded, unit: 'oz', display: `${rounded} oz` }
}

/**
 * Format a simplified amount based on unit preference
 * @param {number} ml - The amount in milliliters
 * @param {number} oz - The amount in ounces
 * @param {boolean} preferOz - Whether to prefer oz over ml
 * @returns {string} The formatted display string
 */
export function formatSimplifiedAmount(ml, oz, preferOz) {
  if (preferOz) {
    return simplifyOz(oz).display
  }
  return simplifyMl(ml).display
}
