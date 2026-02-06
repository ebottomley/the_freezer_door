const API_BASE = '/api';

export async function getCocktails() {
  const response = await fetch(`${API_BASE}/cocktails`);
  if (!response.ok) throw new Error('Failed to fetch cocktails');
  return response.json();
}

export async function getSpirits() {
  const response = await fetch(`${API_BASE}/spirits`);
  if (!response.ok) throw new Error('Failed to fetch spirits');
  return response.json();
}

export async function getPresets() {
  const response = await fetch(`${API_BASE}/presets`);
  if (!response.ok) throw new Error('Failed to fetch presets');
  return response.json();
}

export async function calculateRecipe(data) {
  const response = await fetch(`${API_BASE}/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Calculation failed');
  }
  return response.json();
}
