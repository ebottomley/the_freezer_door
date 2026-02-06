import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CocktailSelector from './CocktailSelector'

const mockCocktails = [
  {
    id: 'martini',
    name: 'Martini',
    variations: [
      { id: 'classic', name: 'Classic (4:1)' },
      { id: 'dry', name: 'Dry (6:1)' },
    ],
  },
  {
    id: 'negroni',
    name: 'Negroni',
    variations: [
      { id: 'classic', name: 'Classic (Equal Parts)' },
    ],
  },
]

describe('CocktailSelector', () => {
  it('renders cocktail dropdown with options', () => {
    render(
      <CocktailSelector
        cocktails={mockCocktails}
        selectedCocktail=""
        selectedVariation=""
        onCocktailChange={vi.fn()}
        onVariationChange={vi.fn()}
      />
    )

    expect(screen.getByText('Select Cocktail')).toBeInTheDocument()
    expect(screen.getByText('Choose a cocktail...')).toBeInTheDocument()
    expect(screen.getByText('Martini')).toBeInTheDocument()
    expect(screen.getByText('Negroni')).toBeInTheDocument()
  })

  it('calls onCocktailChange when cocktail selected', () => {
    const onCocktailChange = vi.fn()

    render(
      <CocktailSelector
        cocktails={mockCocktails}
        selectedCocktail=""
        selectedVariation=""
        onCocktailChange={onCocktailChange}
        onVariationChange={vi.fn()}
      />
    )

    const cocktailSelect = screen.getAllByRole('combobox')[0]
    fireEvent.change(cocktailSelect, { target: { value: 'martini' } })

    expect(onCocktailChange).toHaveBeenCalledWith('martini')
  })

  it('shows variations when cocktail selected', () => {
    render(
      <CocktailSelector
        cocktails={mockCocktails}
        selectedCocktail="martini"
        selectedVariation=""
        onCocktailChange={vi.fn()}
        onVariationChange={vi.fn()}
      />
    )

    expect(screen.getByText('Classic (4:1)')).toBeInTheDocument()
    expect(screen.getByText('Dry (6:1)')).toBeInTheDocument()
  })

  it('disables variation dropdown when no cocktail selected', () => {
    render(
      <CocktailSelector
        cocktails={mockCocktails}
        selectedCocktail=""
        selectedVariation=""
        onCocktailChange={vi.fn()}
        onVariationChange={vi.fn()}
      />
    )

    const variationSelect = screen.getAllByRole('combobox')[1]
    expect(variationSelect).toBeDisabled()
  })

  it('enables variation dropdown when cocktail selected', () => {
    render(
      <CocktailSelector
        cocktails={mockCocktails}
        selectedCocktail="martini"
        selectedVariation=""
        onCocktailChange={vi.fn()}
        onVariationChange={vi.fn()}
      />
    )

    const variationSelect = screen.getAllByRole('combobox')[1]
    expect(variationSelect).not.toBeDisabled()
  })

  it('calls onVariationChange when variation selected', () => {
    const onVariationChange = vi.fn()

    render(
      <CocktailSelector
        cocktails={mockCocktails}
        selectedCocktail="martini"
        selectedVariation=""
        onCocktailChange={vi.fn()}
        onVariationChange={onVariationChange}
      />
    )

    const variationSelect = screen.getAllByRole('combobox')[1]
    fireEvent.change(variationSelect, { target: { value: 'classic' } })

    expect(onVariationChange).toHaveBeenCalledWith('classic')
  })
})
