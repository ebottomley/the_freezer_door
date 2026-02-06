import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import Calculator from './components/Calculator/Calculator';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cocktail/:cocktailId" element={<Calculator />} />
    </Routes>
  );
}

export default App;
