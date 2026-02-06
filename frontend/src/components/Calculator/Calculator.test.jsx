import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import Calculator from './Calculator';

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
];

const mockSpirits = {
  gin: [
    { brand: 'Tanqueray', abv: 47.3 },
    { brand: 'Beefeater', abv: 40 },
  ],
  vermouth_dry: [
    { brand: 'Dolin Dry', abv: 17.5 },
    { brand: 'Noilly Prat', abv: 18 },
  ],
};

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
};

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
};

const renderWithRouter = (component, initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/cocktail/:cocktailId" element={component} />
      </Routes>
    </MemoryRouter>
  );
};

const renderWithoutParams = (component) => {
  return render(
    <MemoryRouter initialEntries={['/cocktail/test']}>
      <Routes>
        <Route path="/cocktail/:cocktailId" element={component} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Calculator', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('displays loading state initially', () => {
    global.fetch.mockImplementation(() => new Promise(() => {}));

    renderWithRouter(<Calculator />, ['/cocktail/martini']);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays the header', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/cocktails') && !url.includes('/api/cocktails/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCocktails),
        });
      }
      if (url.includes('/api/spirits')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSpirits),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    renderWithRouter(<Calculator />, ['/cocktail/martini']);

    await waitFor(() => {
      expect(screen.getByText('The Freezer Door')).toBeInTheDocument();
    });
  });

  it('pre-selects cocktail from URL parameter', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/cocktails') && !url.includes('/api/cocktails/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCocktails),
        });
      }
      if (url.includes('/api/spirits')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSpirits),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    renderWithRouter(<Calculator />, ['/cocktail/martini']);

    await waitFor(() => {
      const cocktailSelect = screen.getAllByRole('combobox')[0];
      expect(cocktailSelect.value).toBe('martini');
    });
  });

  it('shows back button when accessed with cocktailId', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/cocktails') && !url.includes('/api/cocktails/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCocktails),
        });
      }
      if (url.includes('/api/spirits')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSpirits),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    renderWithRouter(<Calculator />, ['/cocktail/martini']);

    await waitFor(() => {
      expect(screen.getByLabelText('Back to home')).toBeInTheDocument();
    });
  });

  it('displays error when data fails to load', async () => {
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    renderWithRouter(<Calculator />, ['/cocktail/martini']);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load data/)).toBeInTheDocument();
    });
  });

  it('enables calculate button when all fields are filled', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/cocktails') && !url.includes('/api/cocktails/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCocktails),
        });
      }
      if (url.includes('/api/spirits')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSpirits),
        });
      }
      if (url.includes('/api/cocktails/martini')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCocktailDetail),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    renderWithRouter(<Calculator />, ['/cocktail/martini']);

    await waitFor(() => {
      expect(screen.getByText('The Freezer Door')).toBeInTheDocument();
    });

    // Select variation
    await waitFor(() => {
      expect(screen.getByText('Classic (4:1)')).toBeInTheDocument();
    });

    const variationSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(variationSelect, { target: { value: 'classic' } });

    // Wait for spirits to be pre-selected and button to enable
    await waitFor(() => {
      const calculateButton = screen.getByRole('button', { name: /Calculate Recipe/i });
      expect(calculateButton).not.toBeDisabled();
    });
  });
});
