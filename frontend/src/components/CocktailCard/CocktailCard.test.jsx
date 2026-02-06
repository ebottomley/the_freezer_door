import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CocktailCard from './CocktailCard';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('CocktailCard', () => {
  it('renders cocktail name', () => {
    renderWithRouter(<CocktailCard cocktailId="martini" name="Martini" />);
    expect(screen.getByText('Martini')).toBeInTheDocument();
  });

  it('renders cocktail icon', () => {
    renderWithRouter(<CocktailCard cocktailId="martini" name="Martini" />);
    expect(screen.getByTestId('cocktail-icon-martini')).toBeInTheDocument();
  });

  it('links to the correct cocktail page', () => {
    renderWithRouter(<CocktailCard cocktailId="manhattan" name="Manhattan" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/cocktail/manhattan');
  });

  it('has the correct test id', () => {
    renderWithRouter(<CocktailCard cocktailId="negroni" name="Negroni" />);
    expect(screen.getByTestId('cocktail-card-negroni')).toBeInTheDocument();
  });

  it('renders different cocktail names correctly', () => {
    renderWithRouter(<CocktailCard cocktailId="old_fashioned" name="Old Fashioned" />);
    expect(screen.getByText('Old Fashioned')).toBeInTheDocument();
  });
});
