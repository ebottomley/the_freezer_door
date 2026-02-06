import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './HomePage';

const mockCocktails = [
  { id: 'martini', name: 'Martini' },
  { id: 'manhattan', name: 'Manhattan' },
  { id: 'old_fashioned', name: 'Old Fashioned' },
  { id: 'negroni', name: 'Negroni' },
];

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('HomePage', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('displays loading state initially', () => {
    global.fetch.mockImplementation(() => new Promise(() => {}));
    renderWithRouter(<HomePage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays the header', async () => {
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCocktails),
      })
    );

    renderWithRouter(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('The Freezer Door')).toBeInTheDocument();
    });
  });

  it('displays cocktail cards after loading', async () => {
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCocktails),
      })
    );

    renderWithRouter(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Martini')).toBeInTheDocument();
      expect(screen.getByText('Manhattan')).toBeInTheDocument();
      expect(screen.getByText('Old Fashioned')).toBeInTheDocument();
      expect(screen.getByText('Negroni')).toBeInTheDocument();
    });
  });

  it('displays the cocktail grid', async () => {
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCocktails),
      })
    );

    renderWithRouter(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId('cocktail-grid')).toBeInTheDocument();
    });
  });

  it('displays section title', async () => {
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCocktails),
      })
    );

    renderWithRouter(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Choose Your Cocktail')).toBeInTheDocument();
    });
  });

  it('displays error when data fails to load', async () => {
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    renderWithRouter(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load cocktails/)).toBeInTheDocument();
    });
  });

  it('renders all cocktail cards as links', async () => {
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCocktails),
      })
    );

    renderWithRouter(<HomePage />);

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      expect(links.length).toBe(4);
    });
  });
});
