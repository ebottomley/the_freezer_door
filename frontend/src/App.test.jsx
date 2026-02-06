import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

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
  {
    id: 'manhattan',
    name: 'Manhattan',
    variations: [{ id: 'classic', name: 'Classic (Rye)' }],
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

const renderWithRouter = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>
  );
};

describe('App', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  describe('HomePage (root route)', () => {
    it('displays loading state initially', () => {
      global.fetch.mockImplementation(() => new Promise(() => {}));
      renderWithRouter(['/']);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('displays the homepage with cocktail cards', async () => {
      global.fetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCocktails),
        })
      );

      renderWithRouter(['/']);

      await waitFor(() => {
        expect(screen.getByText('The Freezer Door')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Martini')).toBeInTheDocument();
        expect(screen.getByText('Manhattan')).toBeInTheDocument();
      });
    });

    it('displays Choose Your Cocktail section title', async () => {
      global.fetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCocktails),
        })
      );

      renderWithRouter(['/']);

      await waitFor(() => {
        expect(screen.getByText('Choose Your Cocktail')).toBeInTheDocument();
      });
    });
  });

  describe('Calculator route', () => {
    it('displays calculator when navigating to /cocktail/:id', async () => {
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

      renderWithRouter(['/cocktail/martini']);

      await waitFor(() => {
        expect(screen.getByText('The Freezer Door')).toBeInTheDocument();
      });

      // Should have a back button on calculator page
      await waitFor(() => {
        expect(screen.getByLabelText('Back to home')).toBeInTheDocument();
      });
    });

    it('pre-selects cocktail from URL', async () => {
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

      renderWithRouter(['/cocktail/martini']);

      await waitFor(() => {
        const cocktailSelect = screen.getAllByRole('combobox')[0];
        expect(cocktailSelect.value).toBe('martini');
      });
    });
  });

  describe('Navigation', () => {
    it('navigates from home to calculator when clicking a cocktail card', async () => {
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

      renderWithRouter(['/']);

      await waitFor(() => {
        expect(screen.getByText('Martini')).toBeInTheDocument();
      });

      // Click on the Martini card
      const martiniCard = screen.getByTestId('cocktail-card-martini');
      fireEvent.click(martiniCard);

      // Should navigate to calculator with martini pre-selected
      await waitFor(() => {
        expect(screen.getByLabelText('Back to home')).toBeInTheDocument();
      });
    });
  });
});
