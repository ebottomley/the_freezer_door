import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import Calculator from './components/Calculator/Calculator';
import FreezerBarBasics from './components/FreezerBarBasics/FreezerBarBasics';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cocktail/:cocktailId" element={<Calculator />} />
      <Route path="/basics" element={<FreezerBarBasics />} />
    </Routes>
  );
}

export default App;
