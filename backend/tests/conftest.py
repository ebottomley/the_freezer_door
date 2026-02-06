"""Pytest fixtures for backend tests."""

import pytest
import sys
import os

# Add backend directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app as flask_app


@pytest.fixture
def app():
    """Create application for testing."""
    flask_app.config.update({
        "TESTING": True,
    })
    yield flask_app


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture
def sample_spirits():
    """Sample spirit ABVs for testing."""
    return {
        "gin": 47.3,
        "vermouth_dry": 17.5,
        "vodka": 40.0,
        "bourbon": 45.0,
        "campari": 25.0,
        "vermouth_sweet": 16.0,
    }


@pytest.fixture
def martini_ingredients():
    """Classic martini recipe (4:1 ratio)."""
    return {
        "gin": 2.4,
        "vermouth_dry": 0.6,
    }


@pytest.fixture
def negroni_ingredients():
    """Negroni recipe (equal parts)."""
    return {
        "gin": 1.0,
        "campari": 1.0,
        "vermouth_sweet": 1.0,
    }
