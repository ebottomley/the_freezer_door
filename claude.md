# The Freezer Door

A web application for home bartenders to calculate batch freezer cocktail recipes.

## Project Structure

```
the_freezer_door/
├── backend/           # Flask API server
│   ├── app.py         # Entry point
│   ├── data/          # JSON data files
│   ├── services/      # Business logic
│   └── routes/        # API endpoints
└── frontend/          # React (Vite) application
    └── src/
        ├── components/  # React components
        └── services/    # API client
```

## Running the Application

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
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
