import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SpiritSelector from './SpiritSelector'

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

describe('SpiritSelector', () => {
  it('renders nothing when no spirits required', () => {
    const { container } = render(
      <SpiritSelector
        requiredSpirits={[]}
        allSpirits={mockSpirits}
        selectedSpirits={{}}
        onSpiritChange={vi.fn()}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when requiredSpirits is null', () => {
    const { container } = render(
      <SpiritSelector
        requiredSpirits={null}
        allSpirits={mockSpirits}
        selectedSpirits={{}}
        onSpiritChange={vi.fn()}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders dropdown for each required spirit', () => {
    render(
      <SpiritSelector
        requiredSpirits={['gin', 'vermouth_dry']}
        allSpirits={mockSpirits}
        selectedSpirits={{}}
        onSpiritChange={vi.fn()}
      />
    )

    expect(screen.getByText('Select Spirits')).toBeInTheDocument()
    expect(screen.getByText('Gin')).toBeInTheDocument()
    expect(screen.getByText('Dry Vermouth')).toBeInTheDocument()
  })

  it('displays spirit options with ABV', () => {
    render(
      <SpiritSelector
        requiredSpirits={['gin']}
        allSpirits={mockSpirits}
        selectedSpirits={{}}
        onSpiritChange={vi.fn()}
      />
    )

    expect(screen.getByText('Tanqueray (47.3%)')).toBeInTheDocument()
    expect(screen.getByText('Beefeater (40%)')).toBeInTheDocument()
  })

  it('calls onSpiritChange with type and brand when selected', () => {
    const onSpiritChange = vi.fn()

    render(
      <SpiritSelector
        requiredSpirits={['gin']}
        allSpirits={mockSpirits}
        selectedSpirits={{}}
        onSpiritChange={onSpiritChange}
      />
    )

    const ginSelect = screen.getByRole('combobox')
    fireEvent.change(ginSelect, { target: { value: 'Tanqueray' } })

    expect(onSpiritChange).toHaveBeenCalledWith('gin', 'Tanqueray')
  })

  it('shows selected spirit value', () => {
    render(
      <SpiritSelector
        requiredSpirits={['gin']}
        allSpirits={mockSpirits}
        selectedSpirits={{ gin: 'Beefeater' }}
        onSpiritChange={vi.fn()}
      />
    )

    const ginSelect = screen.getByRole('combobox')
    expect(ginSelect.value).toBe('Beefeater')
  })

  it('handles unknown spirit type gracefully', () => {
    render(
      <SpiritSelector
        requiredSpirits={['unknown_spirit']}
        allSpirits={mockSpirits}
        selectedSpirits={{}}
        onSpiritChange={vi.fn()}
      />
    )

    // Should display the spirit type as label when not in SPIRIT_LABELS
    expect(screen.getByText('unknown_spirit')).toBeInTheDocument()
  })
})
