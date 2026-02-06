import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ResultsDisplay from './ResultsDisplay'

const mockResults = {
  ingredients: {
    gin: 545.2,
    vermouth_dry: 136.3,
  },
  ingredients_oz: {
    gin: 18.43,
    vermouth_dry: 4.61,
  },
  water_ml: 68.5,
  water_oz: 2.32,
  initial_abv: 40.2,
  final_abv: 24,
  total_volume_ml: 750,
  total_volume_oz: 25.36,
  spirit_brands: {
    gin: 'Tanqueray',
    vermouth_dry: 'Dolin Dry',
  },
  cocktail_name: 'Martini',
  variation_name: 'Classic (4:1)',
  garnish: 'Olive or lemon twist',
}

describe('ResultsDisplay', () => {
  it('renders nothing when no results', () => {
    const { container } = render(<ResultsDisplay results={null} unit="ml" />)
    expect(container.firstChild).toBeNull()
  })

  it('displays cocktail name and variation', () => {
    render(<ResultsDisplay results={mockResults} unit="ml" />)

    expect(screen.getByText('Martini')).toBeInTheDocument()
    expect(screen.getByText('Classic (4:1) - Freezer Batch')).toBeInTheDocument()
  })

  it('displays ingredients with amounts', () => {
    render(<ResultsDisplay results={mockResults} unit="ml" />)

    expect(screen.getByText('Gin')).toBeInTheDocument()
    expect(screen.getByText('Dry Vermouth')).toBeInTheDocument()
  })

  it('displays water for dilution', () => {
    render(<ResultsDisplay results={mockResults} unit="ml" />)

    expect(screen.getByText('Water (for dilution)')).toBeInTheDocument()
  })

  it('displays ABV stats', () => {
    render(<ResultsDisplay results={mockResults} unit="ml" />)

    expect(screen.getByText('40.2%')).toBeInTheDocument()
    expect(screen.getByText('Initial ABV')).toBeInTheDocument()
    expect(screen.getByText('24%')).toBeInTheDocument()
    expect(screen.getByText('Final ABV')).toBeInTheDocument()
  })

  it('shows ml as primary when unit is ml', () => {
    render(<ResultsDisplay results={mockResults} unit="ml" />)

    // Check that ml values appear as primary amounts
    const primaryAmounts = screen.getAllByText(/ml$/)
    expect(primaryAmounts.length).toBeGreaterThan(0)
  })

  it('shows oz as primary when unit is oz', () => {
    render(<ResultsDisplay results={mockResults} unit="oz" />)

    // Total volume should show oz first
    expect(screen.getByText('25.36 oz')).toBeInTheDocument()
  })

  it('displays garnish', () => {
    render(<ResultsDisplay results={mockResults} unit="ml" />)

    expect(screen.getByText(/Garnish:/)).toBeInTheDocument()
    expect(screen.getByText(/Olive or lemon twist/)).toBeInTheDocument()
  })

  it('displays spirit brands', () => {
    render(<ResultsDisplay results={mockResults} unit="ml" />)

    expect(screen.getByText('Tanqueray')).toBeInTheDocument()
    expect(screen.getByText('Dolin Dry')).toBeInTheDocument()
  })

  it('does not display garnish section when no garnish', () => {
    const resultsWithoutGarnish = {
      ...mockResults,
      garnish: '',
    }

    render(<ResultsDisplay results={resultsWithoutGarnish} unit="ml" />)

    expect(screen.queryByText(/Garnish:/)).not.toBeInTheDocument()
  })

  it('displays total volume stat', () => {
    render(<ResultsDisplay results={mockResults} unit="ml" />)

    expect(screen.getByText('750 ml')).toBeInTheDocument()
    expect(screen.getByText('Total Volume')).toBeInTheDocument()
  })

  it('handles unknown ingredient types gracefully', () => {
    const resultsWithUnknown = {
      ...mockResults,
      ingredients: {
        unknown_spirit: 100,
      },
      ingredients_oz: {
        unknown_spirit: 3.38,
      },
      spirit_brands: {},
    }

    render(<ResultsDisplay results={resultsWithUnknown} unit="ml" />)

    // Should display the ingredient key as-is
    expect(screen.getByText('unknown_spirit')).toBeInTheDocument()
  })

  describe('Simplify measurements toggle', () => {
    it('renders toggle and is inactive by default', () => {
      render(<ResultsDisplay results={mockResults} unit="ml" />)

      const toggle = screen.getByRole('button', { name: /simplify measurements/i })
      expect(toggle).toBeInTheDocument()
      expect(toggle).not.toHaveClass('active')
    })

    it('activates toggle when clicked', () => {
      render(<ResultsDisplay results={mockResults} unit="ml" />)

      const toggle = screen.getByRole('button', { name: /simplify measurements/i })
      fireEvent.click(toggle)
      expect(toggle).toHaveClass('active')
    })

    it('displays simplified values when toggle is active', () => {
      render(<ResultsDisplay results={mockResults} unit="ml" />)

      // Before toggle: shows exact value 68.5 ml for water
      expect(screen.getByText('68.5 ml')).toBeInTheDocument()

      const toggle = screen.getByRole('button', { name: /simplify measurements/i })
      fireEvent.click(toggle)

      // After toggle: shows rounded value 70 ml
      expect(screen.getByText('70 ml')).toBeInTheDocument()
      expect(screen.queryByText('68.5 ml')).not.toBeInTheDocument()
    })

    it('hides secondary units when simplified', () => {
      render(<ResultsDisplay results={mockResults} unit="ml" />)

      // Before toggle: secondary amounts are visible
      expect(screen.getByText('2.32 oz')).toBeInTheDocument()

      const toggle = screen.getByRole('button', { name: /simplify measurements/i })
      fireEvent.click(toggle)

      // After toggle: no secondary amounts
      expect(screen.queryByText('2.32 oz')).not.toBeInTheDocument()
    })

    it('shows hint text when toggle is active', () => {
      render(<ResultsDisplay results={mockResults} unit="ml" />)

      expect(screen.queryByText(/rounded for easier measuring/i)).not.toBeInTheDocument()

      const toggle = screen.getByRole('button', { name: /simplify measurements/i })
      fireEvent.click(toggle)

      expect(screen.getByText(/rounded for easier measuring/i)).toBeInTheDocument()
    })

    it('shows small amounts as dashes when simplified', () => {
      const resultsWithBitters = {
        ...mockResults,
        ingredients: {
          gin: 545.2,
          angostura: 2.5,
        },
        ingredients_oz: {
          gin: 18.43,
          angostura: 0.08,
        },
      }

      render(<ResultsDisplay results={resultsWithBitters} unit="ml" />)

      const toggle = screen.getByRole('button', { name: /simplify measurements/i })
      fireEvent.click(toggle)

      expect(screen.getByText('3 dashes')).toBeInTheDocument()
    })

    it('can toggle off to restore exact values', () => {
      render(<ResultsDisplay results={mockResults} unit="ml" />)

      const toggle = screen.getByRole('button', { name: /simplify measurements/i })

      // Toggle on
      fireEvent.click(toggle)
      expect(screen.getByText('70 ml')).toBeInTheDocument()

      // Toggle off
      fireEvent.click(toggle)
      expect(screen.getByText('68.5 ml')).toBeInTheDocument()
      expect(screen.queryByText('70 ml')).not.toBeInTheDocument()
    })
  })
})
