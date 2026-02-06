import { useState, useEffect } from 'react';
import Header from '../Header/Header';
import CocktailCard from '../CocktailCard/CocktailCard';
import { getCocktails } from '../../services/api';

function HomePage() {
  const [cocktails, setCocktails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCocktails() {
      try {
        const data = await getCocktails();
        setCocktails(data);
      } catch (err) {
        setError('Failed to load cocktails. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    }
    loadCocktails();
  }, []);

  if (loading) {
    return (
      <div className="home-page">
        <Header />
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <Header />
        <div className="container">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Header />
      <main className="container">
        <div className="refrigerator-frame">
          <h2 className="shelf-title">Choose Your Cocktail</h2>
          <div className="cocktail-grid" data-testid="cocktail-grid">
            {cocktails.map((cocktail) => (
              <CocktailCard
                key={cocktail.id}
                cocktailId={cocktail.id}
                name={cocktail.name}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
