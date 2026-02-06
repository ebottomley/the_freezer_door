import { describe, it, expect } from 'vitest'
import { simplifyMl, simplifyOz, formatSimplifiedAmount } from './simplifyMeasurements'

describe('simplifyMl', () => {
  describe('dash amounts (< 5ml)', () => {
    it('rounds to nearest 1ml for dash amounts', () => {
      expect(simplifyMl(2.3)).toEqual({ value: 2, unit: 'dash', display: '2 dashes' })
      expect(simplifyMl(3.7)).toEqual({ value: 4, unit: 'dash', display: '4 dashes' })
    })

    it('uses singular "dash" for 1 dash', () => {
      expect(simplifyMl(0.8)).toEqual({ value: 1, unit: 'dash', display: '1 dash' })
      expect(simplifyMl(1.4)).toEqual({ value: 1, unit: 'dash', display: '1 dash' })
    })

    it('handles very small amounts', () => {
      expect(simplifyMl(0.3)).toEqual({ value: 0, unit: 'dash', display: '0 dashes' })
    })
  })

  describe('bar teaspoon amounts (5ml - 7.4ml)', () => {
    it('converts 5ml to 1 bar tsp', () => {
      expect(simplifyMl(5)).toEqual({ value: 1, unit: 'bar tsp', display: '1 bar tsp' })
    })

    it('rounds to nearest 0.5 bar teaspoon', () => {
      expect(simplifyMl(6.2)).toEqual({ value: 1, unit: 'bar tsp', display: '1 bar tsp' })
      expect(simplifyMl(6.5)).toEqual({ value: 1.5, unit: 'bar tsp', display: '1.5 bar tsp' })
      expect(simplifyMl(7.4)).toEqual({ value: 1.5, unit: 'bar tsp', display: '1.5 bar tsp' })
    })
  })

  describe('standard ml amounts (>= 7.5ml)', () => {
    it('rounds to nearest 5ml', () => {
      expect(simplifyMl(68.5)).toEqual({ value: 70, unit: 'ml', display: '70 ml' })
      expect(simplifyMl(545.2)).toEqual({ value: 545, unit: 'ml', display: '545 ml' })
      expect(simplifyMl(136.3)).toEqual({ value: 135, unit: 'ml', display: '135 ml' })
    })

    it('handles exact values', () => {
      expect(simplifyMl(50)).toEqual({ value: 50, unit: 'ml', display: '50 ml' })
      expect(simplifyMl(100)).toEqual({ value: 100, unit: 'ml', display: '100 ml' })
    })

    it('handles edge case at 7.5ml boundary', () => {
      expect(simplifyMl(7.5)).toEqual({ value: 10, unit: 'ml', display: '10 ml' })
    })
  })

  describe('edge cases', () => {
    it('handles 0', () => {
      expect(simplifyMl(0)).toEqual({ value: 0, unit: 'dash', display: '0 dashes' })
    })

    it('handles negative values', () => {
      expect(simplifyMl(-5)).toEqual({ value: 0, unit: 'dash', display: '0 dashes' })
    })
  })
})

describe('simplifyOz', () => {
  describe('dash amounts (< 0.25 oz)', () => {
    it('converts small oz to dashes', () => {
      expect(simplifyOz(0.1)).toEqual({ value: 3, unit: 'dash', display: '3 dashes' })
      expect(simplifyOz(0.07)).toEqual({ value: 2, unit: 'dash', display: '2 dashes' })
    })

    it('uses singular dash for 1 dash', () => {
      expect(simplifyOz(0.03)).toEqual({ value: 1, unit: 'dash', display: '1 dash' })
    })
  })

  describe('bar teaspoon amounts (0.25 oz - 0.17 oz boundary)', () => {
    it('converts to bar teaspoons for small amounts', () => {
      expect(simplifyOz(0.17)).toEqual({ value: 1, unit: 'bar tsp', display: '1 bar tsp' })
      expect(simplifyOz(0.22)).toEqual({ value: 1.5, unit: 'bar tsp', display: '1.5 bar tsp' })
    })
  })

  describe('standard oz amounts (>= 0.25 oz)', () => {
    it('rounds to nearest 1/4 oz', () => {
      expect(simplifyOz(2.32)).toEqual({ value: 2.25, unit: 'oz', display: '2.25 oz' })
      expect(simplifyOz(18.43)).toEqual({ value: 18.5, unit: 'oz', display: '18.5 oz' })
      expect(simplifyOz(4.61)).toEqual({ value: 4.5, unit: 'oz', display: '4.5 oz' })
    })

    it('handles exact quarter values', () => {
      expect(simplifyOz(1.5)).toEqual({ value: 1.5, unit: 'oz', display: '1.5 oz' })
      expect(simplifyOz(2.25)).toEqual({ value: 2.25, unit: 'oz', display: '2.25 oz' })
    })
  })

  describe('edge cases', () => {
    it('handles 0', () => {
      expect(simplifyOz(0)).toEqual({ value: 0, unit: 'dash', display: '0 dashes' })
    })

    it('handles negative values', () => {
      expect(simplifyOz(-1)).toEqual({ value: 0, unit: 'dash', display: '0 dashes' })
    })
  })
})

describe('formatSimplifiedAmount', () => {
  it('uses ml when preferOz is false', () => {
    const result = formatSimplifiedAmount(68.5, 2.32, false)
    expect(result).toBe('70 ml')
  })

  it('uses oz when preferOz is true', () => {
    const result = formatSimplifiedAmount(68.5, 2.32, true)
    expect(result).toBe('2.25 oz')
  })

  it('handles dash amounts', () => {
    const result = formatSimplifiedAmount(2.5, 0.08, false)
    expect(result).toBe('3 dashes')
  })

  it('handles bar teaspoon amounts', () => {
    const result = formatSimplifiedAmount(5, 0.17, false)
    expect(result).toBe('1 bar tsp')
  })
})
