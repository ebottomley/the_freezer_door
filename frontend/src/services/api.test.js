import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCocktails, getSpirits, getPresets, calculateRecipe } from './api'

describe('API Service', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  describe('getCocktails', () => {
    it('fetches and returns cocktails data', async () => {
      const mockCocktails = [
        { id: 'martini', name: 'Martini', variations: [] },
        { id: 'negroni', name: 'Negroni', variations: [] },
      ]

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCocktails),
      })

      const result = await getCocktails()

      expect(global.fetch).toHaveBeenCalledWith('/api/cocktails')
      expect(result).toEqual(mockCocktails)
    })

    it('throws error on fetch failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      await expect(getCocktails()).rejects.toThrow('Failed to fetch cocktails')
    })
  })

  describe('getSpirits', () => {
    it('fetches and returns spirits data', async () => {
      const mockSpirits = {
        gin: [{ brand: 'Tanqueray', abv: 47.3 }],
        vodka: [{ brand: 'Absolut', abv: 40 }],
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSpirits),
      })

      const result = await getSpirits()

      expect(global.fetch).toHaveBeenCalledWith('/api/spirits')
      expect(result).toEqual(mockSpirits)
    })

    it('throws error on fetch failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      await expect(getSpirits()).rejects.toThrow('Failed to fetch spirits')
    })
  })

  describe('getPresets', () => {
    it('fetches and returns presets data', async () => {
      const mockPresets = {
        weak: { name: 'Weak', abv: 22 },
        normal: { name: 'Normal', abv: 24 },
        strong: { name: 'Strong', abv: 26 },
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPresets),
      })

      const result = await getPresets()

      expect(global.fetch).toHaveBeenCalledWith('/api/presets')
      expect(result).toEqual(mockPresets)
    })

    it('throws error on fetch failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      await expect(getPresets()).rejects.toThrow('Failed to fetch presets')
    })
  })

  describe('calculateRecipe', () => {
    const validRequest = {
      cocktail: 'martini',
      variation: 'classic',
      spirits: { gin: 'Tanqueray', vermouth_dry: 'Dolin Dry' },
      target_volume_ml: 750,
      target_abv: 24,
    }

    it('POSTs data and returns calculation result', async () => {
      const mockResult = {
        ingredients: { gin: 545.2, vermouth_dry: 136.3 },
        water_ml: 68.5,
        initial_abv: 40.2,
        final_abv: 24,
        total_volume_ml: 750,
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })

      const result = await calculateRecipe(validRequest)

      expect(global.fetch).toHaveBeenCalledWith('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validRequest),
      })
      expect(result).toEqual(mockResult)
    })

    it('throws error with API error message', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Cocktail not found' }),
      })

      await expect(calculateRecipe(validRequest)).rejects.toThrow('Cocktail not found')
    })

    it('throws generic error when no error message in response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      })

      await expect(calculateRecipe(validRequest)).rejects.toThrow('Calculation failed')
    })
  })
})
