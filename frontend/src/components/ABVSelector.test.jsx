import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ABVSelector from './ABVSelector'

describe('ABVSelector', () => {
  const defaultPresets = {
    mild: { name: 'Mild', abv: 22 },
    classic: { name: 'Classic', abv: 24 },
    strong: { name: 'Strong', abv: 26 },
  }

  it('renders preset buttons', () => {
    render(
      <ABVSelector
        targetABV={24}
        onABVChange={vi.fn()}
        presets={defaultPresets}
      />
    )

    expect(screen.getByText('Target ABV')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Mild \(22%\)/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Classic \(24%\)/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Strong \(26%\)/ })).toBeInTheDocument()
  })

  it('highlights active preset', () => {
    render(
      <ABVSelector
        targetABV={24}
        onABVChange={vi.fn()}
        presets={defaultPresets}
      />
    )

    const classicButton = screen.getByRole('button', { name: /Classic \(24%\)/ })
    expect(classicButton).toHaveClass('active')
  })

  it('calls onABVChange when preset clicked', () => {
    const onABVChange = vi.fn()

    render(
      <ABVSelector
        targetABV={24}
        onABVChange={onABVChange}
        presets={defaultPresets}
      />
    )

    const strongButton = screen.getByRole('button', { name: /Strong \(26%\)/ })
    fireEvent.click(strongButton)

    expect(onABVChange).toHaveBeenCalledWith(26)
  })

  it('calls onABVChange when slider moved', () => {
    const onABVChange = vi.fn()

    render(
      <ABVSelector
        targetABV={24}
        onABVChange={onABVChange}
        presets={defaultPresets}
      />
    )

    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '25' } })

    expect(onABVChange).toHaveBeenCalledWith(25)
  })

  it('displays current ABV value in label', () => {
    render(
      <ABVSelector
        targetABV={23.5}
        onABVChange={vi.fn()}
        presets={defaultPresets}
      />
    )

    expect(screen.getByText('Custom ABV (23.5%)')).toBeInTheDocument()
  })

  it('uses default presets when none provided', () => {
    render(
      <ABVSelector
        targetABV={24}
        onABVChange={vi.fn()}
        presets={null}
      />
    )

    // Should show default presets
    expect(screen.getByRole('button', { name: /Mild \(22%\)/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Classic \(24%\)/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Strong \(26%\)/ })).toBeInTheDocument()
  })

  it('uses default presets when empty object provided', () => {
    render(
      <ABVSelector
        targetABV={24}
        onABVChange={vi.fn()}
        presets={{}}
      />
    )

    // Should show default presets
    expect(screen.getByRole('button', { name: /Classic \(24%\)/ })).toBeInTheDocument()
  })

  it('sets slider max based on highest preset ABV', () => {
    const customPresets = {
      classic: { name: 'Classic', abv: 24 },
      very_strong: { name: 'Very Strong', abv: 30 },
    }

    render(
      <ABVSelector
        targetABV={24}
        onABVChange={vi.fn()}
        presets={customPresets}
      />
    )

    const slider = screen.getByRole('slider')
    // Max should be at least 35 (the component sets min of 35 or max preset + some)
    expect(parseInt(slider.max)).toBeGreaterThanOrEqual(35)
  })
})
