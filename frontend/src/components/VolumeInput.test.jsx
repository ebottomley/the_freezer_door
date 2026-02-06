import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import VolumeInput from './VolumeInput'

describe('VolumeInput', () => {
  const defaultProps = {
    volume: 750,
    unit: 'ml',
    onVolumeChange: vi.fn(),
    onUnitChange: vi.fn(),
    servingSizeMl: 90,
    mode: 'volume',
    onModeChange: vi.fn(),
  }

  it('renders with current volume value', () => {
    render(<VolumeInput {...defaultProps} />)

    const volumeInput = screen.getByRole('spinbutton')
    expect(volumeInput.value).toBe('750')
  })

  it('calls onVolumeChange when volume changed', () => {
    const onVolumeChange = vi.fn()
    render(<VolumeInput {...defaultProps} onVolumeChange={onVolumeChange} />)

    const volumeInput = screen.getByRole('spinbutton')
    fireEvent.change(volumeInput, { target: { value: '500' } })

    expect(onVolumeChange).toHaveBeenCalledWith(500)
  })

  it('calls onUnitChange when unit changed', () => {
    const onUnitChange = vi.fn()
    render(<VolumeInput {...defaultProps} onUnitChange={onUnitChange} />)

    const unitSelect = screen.getByRole('combobox')
    fireEvent.change(unitSelect, { target: { value: 'oz' } })

    expect(onUnitChange).toHaveBeenCalledWith('oz')
  })

  it('shows drinks mode when selected', () => {
    render(<VolumeInput {...defaultProps} mode="drinks" />)

    // In drinks mode, there's a label "Number of Drinks" and the input placeholder
    expect(screen.getByPlaceholderText('Enter number of drinks...')).toBeInTheDocument()
    // The mode button should be active
    const drinksButton = screen.getByRole('button', { name: /Number of Drinks/i })
    expect(drinksButton).toHaveClass('active')
  })

  it('disables drinks mode button when no serving size', () => {
    render(<VolumeInput {...defaultProps} servingSizeMl={null} />)

    const drinksButton = screen.getByRole('button', { name: /Number of Drinks/i })
    expect(drinksButton).toBeDisabled()
  })

  it('enables drinks mode button when serving size provided', () => {
    render(<VolumeInput {...defaultProps} servingSizeMl={90} />)

    const drinksButton = screen.getByRole('button', { name: /Number of Drinks/i })
    expect(drinksButton).not.toBeDisabled()
  })

  it('calls onModeChange when mode button clicked', () => {
    const onModeChange = vi.fn()
    render(<VolumeInput {...defaultProps} onModeChange={onModeChange} />)

    const drinksButton = screen.getByRole('button', { name: /Number of Drinks/i })
    fireEvent.click(drinksButton)

    expect(onModeChange).toHaveBeenCalledWith('drinks')
  })

  it('shows serving info calculation in drinks mode', () => {
    render(<VolumeInput {...defaultProps} mode="drinks" volume={720} servingSizeMl={90} />)

    // 720ml / 90ml per drink = 8 drinks
    expect(screen.getByText(/8 drinks × 90 ml = 720 ml total/)).toBeInTheDocument()
  })

  it('highlights active mode button', () => {
    render(<VolumeInput {...defaultProps} mode="volume" />)

    const volumeButton = screen.getByRole('button', { name: /^Volume$/i })
    expect(volumeButton).toHaveClass('active')
  })

  it('updates volume when drinks count changed', () => {
    const onVolumeChange = vi.fn()
    render(
      <VolumeInput
        {...defaultProps}
        mode="drinks"
        volume={720}
        onVolumeChange={onVolumeChange}
      />
    )

    const drinksInput = screen.getByRole('spinbutton')
    fireEvent.change(drinksInput, { target: { value: '10' } })

    // 10 drinks * 90ml = 900ml
    expect(onVolumeChange).toHaveBeenCalledWith(900)
  })
})
