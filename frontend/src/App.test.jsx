import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import App from './App'

const mockCocktails = [
  {
    id: 'martini',
    name: 'Martini',
    variations: [
      { id: 'classic', name: 'Classic (4:1)' },
      { id: 'dry', name: 'Dry (6:1)' },
    ],
    presets: {
      mild: { name: 'Mild', abv: 22 },
      normal: { name: 'Normal', abv: 24 },
      strong: { name: 'Strong', abv: 26 },
    },
    serving_size_ml: 90,
  },
]

const mockSpirits = {
  gin: [
    { brand: 'Tanqueray', abv: 47.3 },
    { brand: 'Beefeater', abv: 40 },
  ],
  vermouth_dry: [
    { brand: 'Dolin Dry', abv: 17.5 },
    { brand: 'Noilly Prat', abv: 18 },
  ],
}

const mockCocktailDetail = {
  id: 'martini',
  name: 'Martini',
  variations: {
    classic: {
      name: 'Classic (4:1)',
      ingredients: ['gin', 'vermouth_dry'],
    },
    dry: {
      name: 'Dry (6:1)',
      ingredients: ['gin', 'vermouth_dry'],
    },
  },
}

const mockCalculationResult = {
  ingredients: { gin: 545.2, vermouth_dry: 136.3 },
  ingredients_oz: { gin: 18.43, vermouth_dry: 4.61 },
  water_ml: 68.5,
  water_oz: 2.32,
  initial_abv: 40.2,
  final_abv: 24,
  total_volume_ml: 750,
  total_volume_oz: 25.36,
  spirit_brands: { gin: 'Tanqueray', vermouth_dry: 'Dolin Dry' },
  cocktail_name: 'Martini',
  variation_name: 'Classic (4:1)',
  garnish: 'Olive or lemon twist',
}

describe('App', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it('displays loading state initially', () => {
    global.fetch.mockImplementation(() => new Promise(() => {}))

    render(<App />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('loads and displays cocktails on mount', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/cocktails') && !url.includes('/api/cocktails/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCocktails),
        })
      }
      if (url.includes('/api/spirits')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSpirits),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('The Freezer Door')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('Martini')).toBeInTheDocument()
    })
  })

  it('displays error when data fails to load', async () => {
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    )

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to load data/)).toBeInTheDocument()
    })
  })

  it('enables calculate button when all fields filled', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/cocktails') && !url.includes('/api/cocktails/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCocktails),
        })
      }
      if (url.includes('/api/spirits')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSpirits),
        })
      }
      if (url.includes('/api/cocktails/martini')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCocktailDetail),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('The Freezer Door')).toBeInTheDocument()
    })

    // Select cocktail
    const cocktailSelect = screen.getAllByRole('combobox')[0]
    fireEvent.change(cocktailSelect, { target: { value: 'martini' } })

    // Wait for variations to load
    await waitFor(() => {
      expect(screen.getByText('Classic (4:1)')).toBeInTheDocument()
    })

    // Select variation
    const variationSelect = screen.getAllByRole('combobox')[1]
    fireEvent.change(variationSelect, { target: { value: 'classic' } })

    // Wait for spirits to be pre-selected
    await waitFor(() => {
      expect(screen.getByText('Gin')).toBeInTheDocument()
    })

    // Calculate button should be enabled (spirits are auto-selected)
    await waitFor(() => {
      const calculateButton = screen.getByRole('button', { name: /Calculate Recipe/i })
      expect(calculateButton).not.toBeDisabled()
    })
  })

  it('disables calculate button when no cocktail selected', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/cocktails')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCocktails),
        })
      }
      if (url.includes('/api/spirits')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSpirits),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('The Freezer Door')).toBeInTheDocument()
    })

    const calculateButton = screen.getByRole('button', { name: /Calculate Recipe/i })
    expect(calculateButton).toBeDisabled()
  })

  it('displays results after successful calculation', async () => {
    global.fetch.mockImplementation((url, options) => {
      if (url.includes('/api/cocktails') && !url.includes('/api/cocktails/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCocktails),
        })
      }
      if (url.includes('/api/spirits')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSpirits),
        })
      }
      if (url.includes('/api/cocktails/martini')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCocktailDetail),
        })
      }
      if (url.includes('/api/calculate') && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCalculationResult),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('The Freezer Door')).toBeInTheDocument()
    })

    // Select cocktail and variation
    const cocktailSelect = screen.getAllByRole('combobox')[0]
    fireEvent.change(cocktailSelect, { target: { value: 'martini' } })

    await waitFor(() => {
      expect(screen.getByText('Classic (4:1)')).toBeInTheDocument()
    })

    const variationSelect = screen.getAllByRole('combobox')[1]
    fireEvent.change(variationSelect, { target: { value: 'classic' } })

    // Wait for spirits to load and calculate button to be enabled
    await waitFor(() => {
      const calculateButton = screen.getByRole('button', { name: /Calculate Recipe/i })
      expect(calculateButton).not.toBeDisabled()
    })

    // Click calculate
    const calculateButton = screen.getByRole('button', { name: /Calculate Recipe/i })
    fireEvent.click(calculateButton)

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Classic (4:1) - Freezer Batch')).toBeInTheDocument()
    })
  })

  it('displays error message when calculation fails', async () => {
    global.fetch.mockImplementation((url, options) => {
      if (url.includes('/api/cocktails') && !url.includes('/api/cocktails/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCocktails),
        })
      }
      if (url.includes('/api/spirits')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSpirits),
        })
      }
      if (url.includes('/api/cocktails/martini')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCocktailDetail),
        })
      }
      if (url.includes('/api/calculate') && options?.method === 'POST') {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: 'Invalid calculation' }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('The Freezer Door')).toBeInTheDocument()
    })

    // Select cocktail and variation
    const cocktailSelect = screen.getAllByRole('combobox')[0]
    fireEvent.change(cocktailSelect, { target: { value: 'martini' } })

    await waitFor(() => {
      expect(screen.getByText('Classic (4:1)')).toBeInTheDocument()
    })

    const variationSelect = screen.getAllByRole('combobox')[1]
    fireEvent.change(variationSelect, { target: { value: 'classic' } })

    await waitFor(() => {
      const calculateButton = screen.getByRole('button', { name: /Calculate Recipe/i })
      expect(calculateButton).not.toBeDisabled()
    })

    // Click calculate
    const calculateButton = screen.getByRole('button', { name: /Calculate Recipe/i })
    fireEvent.click(calculateButton)

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Invalid calculation')).toBeInTheDocument()
    })
  })

  it('clears results when cocktail selection changes', async () => {
    global.fetch.mockImplementation((url, options) => {
      if (url.includes('/api/cocktails') && !url.includes('/api/cocktails/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCocktails),
        })
      }
      if (url.includes('/api/spirits')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSpirits),
        })
      }
      if (url.includes('/api/cocktails/martini')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCocktailDetail),
        })
      }
      if (url.includes('/api/calculate') && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCalculationResult),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('The Freezer Door')).toBeInTheDocument()
    })

    // Select cocktail and variation, then calculate
    const cocktailSelect = screen.getAllByRole('combobox')[0]
    fireEvent.change(cocktailSelect, { target: { value: 'martini' } })

    await waitFor(() => {
      expect(screen.getByText('Classic (4:1)')).toBeInTheDocument()
    })

    const variationSelect = screen.getAllByRole('combobox')[1]
    fireEvent.change(variationSelect, { target: { value: 'classic' } })

    await waitFor(() => {
      const calculateButton = screen.getByRole('button', { name: /Calculate Recipe/i })
      expect(calculateButton).not.toBeDisabled()
    })

    const calculateButton = screen.getByRole('button', { name: /Calculate Recipe/i })
    fireEvent.click(calculateButton)

    await waitFor(() => {
      expect(screen.getByText('Classic (4:1) - Freezer Batch')).toBeInTheDocument()
    })

    // Change cocktail - should clear results
    fireEvent.change(cocktailSelect, { target: { value: '' } })

    await waitFor(() => {
      expect(screen.queryByText('Classic (4:1) - Freezer Batch')).not.toBeInTheDocument()
    })
  })
})
