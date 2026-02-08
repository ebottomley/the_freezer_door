# Build Your Own Drink Feature - Implementation Plan

## Overview

Add a custom drink builder allowing users to create recipes from scratch, save them to localStorage, and export as PDF.

## User Decisions Summary

| Question | Answer |
|----------|--------|
| Storage | localStorage + PDF export |
| Navigation | New route `/build` |
| Brands | Existing + custom (with custom ABV) |
| Calculation | Same as Calculator (parts → volume/ABV → water dilution) |
| Home display | Separate "My Recipes" section |
| PDF content | Recipe + definition |
| N/A ingredients | Syrups, juices, mixers, + custom |
| Bitters | Measured in dashes (1 dash ≈ 1ml) |
| Variations | Single recipe, no variations |

---

## New Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/build` | DrinkBuilder | Create/edit custom recipes |
| `/my-recipes` | MyRecipes | View saved recipes grid |

---

## Files to Create

### Backend

1. **`backend/data/ingredient_categories.json`** - Organize ingredients by category
   ```json
   {
     "spirit": { "label": "Spirit", "types": ["vodka", "gin", "bourbon", "rye", "tequila", "mezcal"] },
     "liqueur": { "label": "Liqueur", "types": ["orange_liqueur", "coffee_liqueur", "maraschino"] },
     "aromatized_wine": { "label": "Aromatized Wine", "types": ["vermouth_dry", "vermouth_sweet", "lillet_blanc"] },
     "amaro": { "label": "Amaro", "types": ["campari", "amaro", "aperol"] },
     "na": { "label": "N/A Ingredients", "types": ["simple_syrup", "lime_juice", "lemon_juice", "soda_water", "tonic_water", "ginger_beer"] },
     "bitters": { "label": "Bitters", "types": ["angostura", "peychauds", "orange_bitters"] },
     "other": { "label": "Other", "types": [] }
   }
   ```

### Frontend

2. **`frontend/src/components/DrinkBuilder/DrinkBuilder.jsx`** - Main builder page
3. **`frontend/src/components/DrinkBuilder/IngredientRow.jsx`** - Single ingredient controls
4. **`frontend/src/components/MyRecipes/MyRecipes.jsx`** - Saved recipes page
5. **`frontend/src/components/MyRecipes/RecipeCard.jsx`** - Recipe card component
6. **`frontend/src/components/PdfExport/RecipePdf.jsx`** - PDF generation
7. **`frontend/src/services/localStorage.js`** - localStorage CRUD operations

---

## Files to Modify

### Backend

1. **`backend/routes/api.py`**
   - Add `GET /api/ingredients` - Returns categories with brands
   - Extend `POST /api/calculate` - Support custom recipe format:
     ```json
     {
       "custom": true,
       "name": "My Drink",
       "ingredients": [
         {"ingredientType": "gin", "brand": "Tanqueray", "abv": 47.3, "parts": 2.5}
       ],
       "target_volume_ml": 750,
       "target_abv": 24
     }
     ```

2. **`backend/data/spirits.json`** - Add missing ingredients:
   - Bitters: Peychaud's, orange bitters
   - N/A: lime_juice, lemon_juice, honey_syrup, ginger_beer, tonic_water, soda_water
   - Liqueurs: coffee_liqueur, maraschino

### Frontend

3. **`frontend/src/App.jsx`** - Add routes for `/build` and `/my-recipes`

4. **`frontend/src/components/HomePage/HomePage.jsx`** - Add action buttons:
   ```jsx
   <div className="action-buttons">
     <Link to="/build" className="action-btn build-btn">Build a Drink</Link>
     <Link to="/my-recipes" className="action-btn recipes-btn">My Recipes</Link>
   </div>
   ```

5. **`frontend/src/services/api.js`** - Add functions:
   - `getIngredients()` - Fetch ingredient categories
   - `calculateCustomRecipe(data)` - Calculate custom recipe

6. **`frontend/src/index.css`** - Add styles for new components

---

## Component Architecture

### DrinkBuilder State

```jsx
const [recipeName, setRecipeName] = useState('');
const [ingredients, setIngredients] = useState([]);   // CustomIngredient[]
const [volume, setVolume] = useState(21);             // ~6 drinks at 3.5oz
const [unit, setUnit] = useState('oz');
const [volumeMode, setVolumeMode] = useState('volume');
const [targetABV, setTargetABV] = useState(24);
const [results, setResults] = useState(null);
```

### IngredientRow Props

- Category dropdown → Type dropdown → Brand dropdown (or Custom + ABV input)
- Parts input (shows "dashes" for bitters category)
- Remove button

### Reuse Existing Components

- `VolumeInput` - Volume/drinks toggle and input
- `ABVSelector` - ABV presets and slider
- `ResultsDisplay` - Show calculated recipe (add PDF export button)

---

## Data Structures

### CustomIngredient (frontend)

```typescript
{
  id: string;              // UUID for React key
  category: string;        // 'spirit' | 'liqueur' | 'aromatized_wine' | 'amaro' | 'na' | 'bitters' | 'other'
  ingredientType: string;  // e.g., 'gin', 'vodka', or custom name
  brand: string;           // Brand name or 'Custom'
  abv: number;             // ABV percentage
  parts: number;           // Parts in recipe (dashes for bitters)
  isCustom: boolean;       // Custom ingredient flag
}
```

### CustomRecipe (localStorage)

```typescript
{
  id: string;                    // UUID
  name: string;                  // User-provided name
  ingredients: CustomIngredient[];
  servingSizeMl: number;         // For drinks calculation
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}
```

**localStorage key:** `freezerDoor_customRecipes`

---

## PDF Export

**Library:** `@react-pdf/renderer`

**Contents:**
- Recipe name and subtitle
- Ingredients list with amounts (ml or oz)
- Water for dilution
- Stats: Initial ABV, Final ABV, Total Volume
- Garnish (if set)

---

## Implementation Order

### Phase 1: Backend API
1. Create `ingredient_categories.json`
2. Extend `spirits.json` with missing ingredients
3. Add `GET /api/ingredients` endpoint
4. Extend `POST /api/calculate` for custom recipes
5. Write backend tests

### Phase 2: Frontend Core
1. Create `localStorage.js` service
2. Update `api.js` with new functions
3. Create `IngredientRow` component
4. Create `DrinkBuilder` component
5. Write component tests

### Phase 3: Routes & Navigation
1. Create `MyRecipes` and `RecipeCard` components
2. Update `App.jsx` with new routes
3. Update `HomePage.jsx` with action buttons
4. Write tests

### Phase 4: PDF Export
1. Install `@react-pdf/renderer`
2. Create `RecipePdf` component
3. Add export button to results display
4. Write tests

### Phase 5: Styling & Polish
1. Add CSS for all new components
2. Responsive design
3. Error handling
4. E2E tests

---

## Verification Plan

### Unit Tests
- Backend: Test custom recipe calculation, ingredients endpoint
- Frontend: Test DrinkBuilder state, IngredientRow interactions, localStorage service

### Integration Tests
- API: Test `POST /api/calculate` with custom format
- API: Test `GET /api/ingredients` returns categories

### E2E Tests
1. Navigate to `/build` from homepage
2. Add ingredients, set name, calculate
3. Verify results display
4. Save recipe, navigate to `/my-recipes`
5. Verify recipe appears, can edit/delete
6. Test PDF export downloads file

### Manual Testing
1. Create recipe with mixed categories (spirit + bitters + N/A)
2. Test custom ingredient with custom ABV
3. Test bitters in dashes
4. Save, refresh browser, verify persistence
5. Export PDF, verify contents
