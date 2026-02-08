import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FreezerBarBasics from './FreezerBarBasics';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('FreezerBarBasics', () => {
  it('renders the page title', () => {
    renderWithRouter(<FreezerBarBasics />);
    expect(screen.getByRole('heading', { name: 'Freezer Bar Basics', level: 1 })).toBeInTheDocument();
  });

  it('renders the header with back button', () => {
    renderWithRouter(<FreezerBarBasics />);
    expect(screen.getByText('The Freezer Door')).toBeInTheDocument();
    expect(screen.getByLabelText('Back to home')).toBeInTheDocument();
  });

  it('renders the ABV section', () => {
    renderWithRouter(<FreezerBarBasics />);
    expect(screen.getByRole('heading', { name: /What is ABV/i })).toBeInTheDocument();
    expect(screen.getByText(/Alcohol By Volume/i)).toBeInTheDocument();
  });

  it('renders the ABV freezing point table with key values', () => {
    renderWithRouter(<FreezerBarBasics />);
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
    // Use getAllBy since "Freezes solid" appears in both table and intro paragraph
    expect(screen.getAllByText(/Freezes solid/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Stays liquid, very viscous/i)).toBeInTheDocument();
  });

  it('renders the dilution section', () => {
    renderWithRouter(<FreezerBarBasics />);
    expect(screen.getByRole('heading', { name: /The Importance of Dilution/i })).toBeInTheDocument();
    expect(screen.getByText(/15-25%/i)).toBeInTheDocument();
  });

  it('renders the best cocktails section', () => {
    renderWithRouter(<FreezerBarBasics />);
    expect(screen.getByRole('heading', { name: /What Makes a Drink Good/i })).toBeInTheDocument();
    expect(screen.getByText(/Spirit-forward, shelf-stable drinks/i)).toBeInTheDocument();
    expect(screen.getByText(/Fresh citrus drinks/i)).toBeInTheDocument();
  });

  it('renders the intro text', () => {
    renderWithRouter(<FreezerBarBasics />);
    expect(screen.getByText(/A freezer bar is a collection of pre-batched cocktails/i)).toBeInTheDocument();
  });

  it('renders the bitters section', () => {
    renderWithRouter(<FreezerBarBasics />);
    expect(screen.getByRole('heading', { name: /Adjusting Bitters/i })).toBeInTheDocument();
    expect(screen.getByText(/Cut bitters in half/i)).toBeInTheDocument();
  });

  it('renders the scaling section', () => {
    renderWithRouter(<FreezerBarBasics />);
    expect(screen.getByRole('heading', { name: /Scaling Recipes/i })).toBeInTheDocument();
    expect(screen.getByText(/750ml bottle/i)).toBeInTheDocument();
  });

  it('renders the sources section', () => {
    renderWithRouter(<FreezerBarBasics />);
    expect(screen.getByRole('heading', { name: /Sources/i })).toBeInTheDocument();
    expect(screen.getByText(/Death & Co/i)).toBeInTheDocument();
    expect(screen.getByText(/Punch/i)).toBeInTheDocument();
    expect(screen.getByText(/Imbibe/i)).toBeInTheDocument();
  });
});
