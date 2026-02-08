import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import Calculator from './components/Calculator/Calculator';
import FreezerBarBasics from './components/FreezerBarBasics/FreezerBarBasics';
import DrinkBuilder from './components/DrinkBuilder/DrinkBuilder';
import MyRecipes from './components/MyRecipes/MyRecipes';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cocktail/:cocktailId" element={<Calculator />} />
      <Route path="/basics" element={<FreezerBarBasics />} />
      <Route path="/build" element={<DrinkBuilder />} />
      <Route path="/build/:recipeId" element={<DrinkBuilder />} />
      <Route path="/my-recipes" element={<MyRecipes />} />
    </Routes>
  );
}

export default App;
