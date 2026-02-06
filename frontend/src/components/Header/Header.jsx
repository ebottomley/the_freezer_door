import { Link } from 'react-router-dom';

function Header({ showBack = false }) {
  return (
    <header className="site-header">
      <div className="header-content">
        {showBack && (
          <Link to="/" className="back-link" aria-label="Back to home">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
        )}
        <div className="header-title">
          <h1>The Freezer Door</h1>
          <p>Calculate perfect batch freezer cocktails</p>
        </div>
      </div>
    </header>
  );
}

export default Header;
