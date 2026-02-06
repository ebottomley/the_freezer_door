const icons = {
  martini: (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Martini glass */}
      <path
        d="M20 25 L50 55 L80 25"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M20 25 L80 25"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Stem */}
      <line x1="50" y1="55" x2="50" y2="80" stroke="currentColor" strokeWidth="3" />
      {/* Base */}
      <path
        d="M35 80 L65 80"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Olive */}
      <circle cx="50" cy="40" r="5" fill="currentColor" />
      {/* Olive pick */}
      <line x1="45" y1="30" x2="55" y2="50" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  manhattan: (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Coupe glass bowl */}
      <path
        d="M25 35 Q25 55 50 60 Q75 55 75 35"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M25 35 L75 35"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Stem */}
      <line x1="50" y1="60" x2="50" y2="80" stroke="currentColor" strokeWidth="3" />
      {/* Base */}
      <ellipse cx="50" cy="82" rx="15" ry="4" stroke="currentColor" strokeWidth="3" fill="none" />
      {/* Cherry */}
      <circle cx="50" cy="45" r="6" fill="currentColor" />
      {/* Cherry stem */}
      <path d="M50 39 Q55 32 58 28" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  old_fashioned: (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rocks glass */}
      <path
        d="M28 30 L32 80 L68 80 L72 30"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Liquid level */}
      <path
        d="M30 40 L70 40"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 2"
      />
      {/* Ice cubes */}
      <rect x="38" y="45" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" rx="2" />
      <rect x="52" y="50" width="10" height="10" stroke="currentColor" strokeWidth="2" fill="none" rx="2" />
      {/* Orange peel */}
      <path
        d="M55 35 Q65 30 70 25"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  ),
  negroni: (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rocks glass with straight sides */}
      <path
        d="M28 25 L30 80 L70 80 L72 25"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Liquid - filled area suggesting the red color */}
      <path
        d="M30 35 L70 35"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Large ice cube */}
      <rect x="40" y="42" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" rx="2" />
      {/* Orange slice on rim */}
      <path
        d="M60 25 Q75 20 78 30 Q75 40 65 35"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M65 27 L70 32"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M68 25 L71 30"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  ),
};

function CocktailIcon({ cocktailId, className = '' }) {
  const icon = icons[cocktailId];

  if (!icon) {
    return null;
  }

  return (
    <div className={`cocktail-icon ${className}`} data-testid={`cocktail-icon-${cocktailId}`}>
      {icon}
    </div>
  );
}

export default CocktailIcon;
