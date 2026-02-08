import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../Header/Header';
import ResultsDisplay from '../ResultsDisplay';
import { getRecipeById, deleteRecipe } from '../../services/localStorage';

export default function FavoriteView() {
  const { favoriteId } = useParams();
  const navigate = useNavigate();
  const [favorite, setFavorite] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fav = getRecipeById(favoriteId);
    if (fav) {
      setFavorite(fav);
    } else {
      setError('Favorite not found');
    }
  }, [favoriteId]);

  const handleDelete = () => {
    if (window.confirm(`Delete "${favorite.name}"?`)) {
      deleteRecipe(favoriteId);
      navigate('/my-favorites');
    }
  };

  const handleEdit = () => {
    if (favorite.type === 'standard') {
      // Pass favoriteId in state so Calculator can update existing favorite
      navigate(`/cocktail/${favorite.cocktailId}`, {
        state: { favoriteId: favoriteId, favorite }
      });
    } else {
      navigate(`/build/${favoriteId}`);
    }
  };

  if (error) {
    return (
      <div className="favorite-view-page">
        <Header showBack />
        <main className="container">
          <div className="error">{error}</div>
          <Link to="/my-favorites" className="back-link">Back to Favorites</Link>
        </main>
      </div>
    );
  }

  if (!favorite) {
    return (
      <div className="favorite-view-page">
        <Header showBack />
        <main className="container">
          <div className="loading">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="favorite-view-page">
      <Header showBack />
      <main className="container">
        {favorite.results ? (
          <ResultsDisplay
            results={favorite.results}
            unit={favorite.unit || 'oz'}
            numDrinks={favorite.numDrinks}
            servingSizeMl={favorite.results?.serving_size_ml}
            showActionButtons
          />
        ) : (
          <div className="card">
            <h2>{favorite.name}</h2>
            <p className="error">No calculated results available. Please edit and recalculate.</p>
          </div>
        )}

        <div className="favorite-actions">
          <button onClick={handleEdit} className="edit-btn">
            Edit
          </button>
          <button onClick={handleDelete} className="delete-btn">
            Delete
          </button>
        </div>
      </main>
    </div>
  );
}
