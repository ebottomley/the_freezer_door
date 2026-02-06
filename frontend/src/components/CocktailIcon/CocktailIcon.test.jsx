import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CocktailIcon from './CocktailIcon';

describe('CocktailIcon', () => {
  it('renders martini icon', () => {
    render(<CocktailIcon cocktailId="martini" />);
    expect(screen.getByTestId('cocktail-icon-martini')).toBeInTheDocument();
  });

  it('renders manhattan icon', () => {
    render(<CocktailIcon cocktailId="manhattan" />);
    expect(screen.getByTestId('cocktail-icon-manhattan')).toBeInTheDocument();
  });

  it('renders old_fashioned icon', () => {
    render(<CocktailIcon cocktailId="old_fashioned" />);
    expect(screen.getByTestId('cocktail-icon-old_fashioned')).toBeInTheDocument();
  });

  it('renders negroni icon', () => {
    render(<CocktailIcon cocktailId="negroni" />);
    expect(screen.getByTestId('cocktail-icon-negroni')).toBeInTheDocument();
  });

  it('returns null for unknown cocktail', () => {
    const { container } = render(<CocktailIcon cocktailId="unknown" />);
    expect(container.firstChild).toBeNull();
  });

  it('applies custom className', () => {
    render(<CocktailIcon cocktailId="martini" className="custom-class" />);
    expect(screen.getByTestId('cocktail-icon-martini')).toHaveClass('custom-class');
  });

  it('contains an SVG element', () => {
    render(<CocktailIcon cocktailId="martini" />);
    const icon = screen.getByTestId('cocktail-icon-martini');
    expect(icon.querySelector('svg')).toBeInTheDocument();
  });
});
