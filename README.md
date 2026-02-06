# The Freezer Door

A web application for home bartenders to calculate batch freezer cocktail recipes. Select a cocktail type, spirit brands, target volume, and desired ABV, and the app calculates exact ingredient amounts including water dilution.

## Features

- Select from classic cocktails (Martini, Manhattan, Old Fashioned) with variations
- Choose specific spirit brands with accurate ABV data
- Calculate water dilution for perfect freezer cocktails
- Preset strength options (Weak 22%, Normal 24%, Strong 26%)
- Scale recipes to any batch size

## Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## How Freezer Cocktails Work

Freezer cocktails are pre-batched cocktails stored in the freezer. They need to be diluted with water to:
1. Achieve the proper ABV (typically 20-25%) so they don't freeze solid
2. Provide the same dilution you'd get from stirring with ice

The app calculates the exact amount of water needed based on your spirit selections and target ABV.

## Tech Stack

- **Frontend**: React with Vite
- **Backend**: Flask (Python)
- **Data**: JSON files for spirits and recipes
