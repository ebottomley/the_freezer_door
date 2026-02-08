import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Header/Header';
import RecipeCard from './RecipeCard';
import { getRecipes, deleteRecipe } from '../../services/localStorage';

export default function MyRecipes() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    setRecipes(getRecipes());
  }, []);

  const handleDelete = (id) => {
    deleteRecipe(id);
    setRecipes(getRecipes());
  };

  return (
    <div className="my-recipes-page">
      <Header showBack />
      <main className="container">
        <div className="refrigerator-frame">
          <h2 className="shelf-title">My Favorites</h2>

          {recipes.length === 0 ? (
            <div className="empty-state">
              <p>You haven't saved any favorites yet.</p>
              <Link to="/build" className="build-link">
                Build Your First Drink
              </Link>
            </div>
          ) : (
            <div className="recipes-grid">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        <Link to="/build" className="build-link">
          Create New Recipe
        </Link>
      </main>
    </div>
  );
}
