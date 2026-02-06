import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Header', () => {
  it('renders the app title', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('The Freezer Door')).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('Calculate perfect batch freezer cocktails')).toBeInTheDocument();
  });

  it('does not show back button by default', () => {
    renderWithRouter(<Header />);
    expect(screen.queryByLabelText('Back to home')).not.toBeInTheDocument();
  });

  it('shows back button when showBack is true', () => {
    renderWithRouter(<Header showBack={true} />);
    expect(screen.getByLabelText('Back to home')).toBeInTheDocument();
  });

  it('back button links to home', () => {
    renderWithRouter(<Header showBack={true} />);
    const backLink = screen.getByLabelText('Back to home');
    expect(backLink).toHaveAttribute('href', '/');
  });

  it('does not show back button when showBack is false', () => {
    renderWithRouter(<Header showBack={false} />);
    expect(screen.queryByLabelText('Back to home')).not.toBeInTheDocument();
  });
});
