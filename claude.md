# The Freezer Door

A web application for home bartenders to calculate batch freezer cocktail recipes.

## Project Structure

```
the_freezer_door/
├── backend/           # Flask API server
│   ├── app.py         # Entry point
│   ├── data/          # JSON data files
│   ├── services/      # Business logic
│   ├── routes/        # API endpoints
│   └── tests/         # Pytest test suite
│       ├── unit/      # Unit tests for services
│       └── integration/  # API endpoint tests
└── frontend/          # React (Vite) application
    ├── src/
    │   ├── components/
    │   │   ├── Calculator/     # Main calculator form
    │   │   ├── CocktailCard/   # Clickable cocktail cards
    │   │   ├── CocktailIcon/   # SVG icons for each cocktail
    │   │   ├── Header/         # Site header with back nav
    │   │   ├── HomePage/       # Landing page with grid
    │   │   └── ...             # Form components
    │   └── services/    # API client
    └── e2e/           # Playwright E2E tests
```

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomePage | Landing page with cocktail icon grid |
| `/cocktail/:cocktailId` | Calculator | Recipe calculator, pre-selects cocktail from URL |

## Design System

**Theme: Retrofuturist (SMEG-inspired)**
- Clean, modern aesthetic with retro rounded shapes
- Bold cardinal red accent (#C41E3A)
- Nunito font for logo, Inter for body text
- Pill-shaped buttons, generous border-radius
- Light gray background with white cards

**Typography:**
- Logo: Nunito (900 weight, uppercase, letter-spacing)
- Body: Inter (400-700 weights)
- Display: Libre Baskerville (for results headings)

## Running the Application

### Backend
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python3 app.py
```
Runs on http://localhost:5000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173

## API Endpoints

- `GET /api/cocktails` - List available cocktails with variations
- `GET /api/spirits` - List spirits by category with ABV
- `POST /api/calculate` - Calculate recipe given inputs

### Calculate Endpoint Request Format
```json
{
  "cocktail": "martini",
  "variation": "classic",
  "spirits": {
    "gin": "Tanqueray",
    "vermouth_dry": "Dolin Dry"
  },
  "target_volume_ml": 750,
  "target_abv": 24
}
```

## Key Formulas

- **Initial ABV** = weighted average of spirit ABVs based on recipe ratios
- **Water to add** = `(spirit_volume * initial_abv / target_abv) - spirit_volume`

## Conventions

- ABV values stored as percentages (e.g., 40 for 40%)
- Recipe ratios are in parts (e.g., 2.5 parts gin)
- Volumes calculated in milliliters, displayed in both ml and oz

## Development Practices

This project follows Test-Driven Development (TDD) and web development best practices:

### TDD Workflow
1. **Write tests first** - Before implementing new features or fixing bugs, write failing tests that define the expected behavior
2. **Make tests pass** - Write the minimum code necessary to make tests pass
3. **Refactor** - Clean up the code while keeping tests green
4. **Repeat** - Continue the red-green-refactor cycle

### Testing Strategy
- **Unit tests** - Test individual functions and components in isolation
- **Integration tests** - Test API endpoints and component interactions
- **E2E tests** - Test complete user workflows through the browser

### Running Tests

**Backend:**
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements-dev.txt
pytest                    # Run all tests
pytest --cov=services --cov=routes  # With coverage
```

**Frontend Unit/Component Tests:**
```bash
cd frontend
npm install
npm test                  # Watch mode
npm test -- --run         # Single run
npm run test:coverage     # With coverage
```

**E2E Tests:**
```bash
cd frontend
npx playwright install    # First time only
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Interactive UI mode
```

Note: E2E tests require the backend to be running. On macOS, port 5000 may be used by AirPlay Receiver - disable it in System Settings or run the backend on a different port.

### Code Quality Guidelines
- Write tests for all new features and bug fixes
- Maintain test coverage above 90%
- Keep components small and focused
- Use meaningful variable and function names
- Handle errors gracefully with user-friendly messages
- Validate inputs at API boundaries
