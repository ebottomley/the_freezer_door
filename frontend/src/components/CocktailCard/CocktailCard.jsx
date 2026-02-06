import { Link } from 'react-router-dom';
import CocktailIcon from '../CocktailIcon/CocktailIcon';

function CocktailCard({ cocktailId, name }) {
  return (
    <Link
      to={`/cocktail/${cocktailId}`}
      className="cocktail-card"
      data-testid={`cocktail-card-${cocktailId}`}
    >
      <div className="cocktail-card-icon">
        <CocktailIcon cocktailId={cocktailId} />
      </div>
      <h3 className="cocktail-card-name">{name}</h3>
    </Link>
  );
}

export default CocktailCard;
