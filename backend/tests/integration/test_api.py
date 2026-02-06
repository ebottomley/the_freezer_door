"""Integration tests for API endpoints."""

import pytest


class TestGetCocktails:
    """Tests for GET /api/cocktails endpoint."""

    def test_returns_list_of_cocktails(self, client):
        """Returns list of all cocktails."""
        response = client.get('/api/cocktails')
        assert response.status_code == 200

        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_each_cocktail_has_required_fields(self, client):
        """Each cocktail has required fields."""
        response = client.get('/api/cocktails')
        data = response.get_json()

        for cocktail in data:
            assert "id" in cocktail
            assert "name" in cocktail
            assert "variations" in cocktail
            assert "presets" in cocktail
            assert "serving_size_ml" in cocktail

    def test_martini_has_variations(self, client):
        """Martini has expected variations."""
        response = client.get('/api/cocktails')
        data = response.get_json()

        martini = next((c for c in data if c["id"] == "martini"), None)
        assert martini is not None
        assert len(martini["variations"]) >= 4  # At least 4 variations


class TestGetCocktailById:
    """Tests for GET /api/cocktails/<id> endpoint."""

    def test_returns_detailed_cocktail_info(self, client):
        """Returns detailed info for specific cocktail."""
        response = client.get('/api/cocktails/martini')
        assert response.status_code == 200

        data = response.get_json()
        assert data["id"] == "martini"
        assert data["name"] == "Martini"

    def test_variations_include_ingredients(self, client):
        """Variations include ingredient lists."""
        response = client.get('/api/cocktails/martini')
        data = response.get_json()

        assert "variations" in data
        assert "classic" in data["variations"]
        assert "ingredients" in data["variations"]["classic"]
        assert isinstance(data["variations"]["classic"]["ingredients"], list)

    def test_unknown_id_returns_404(self, client):
        """Unknown cocktail ID returns 404."""
        response = client.get('/api/cocktails/unknown_cocktail')
        assert response.status_code == 404

        data = response.get_json()
        assert "error" in data


class TestGetSpirits:
    """Tests for GET /api/spirits endpoint."""

    def test_returns_spirits_by_category(self, client):
        """Returns spirits organized by category."""
        response = client.get('/api/spirits')
        assert response.status_code == 200

        data = response.get_json()
        assert isinstance(data, dict)
        assert "gin" in data
        assert "vodka" in data
        assert "bourbon" in data

    def test_each_spirit_has_brand_and_abv(self, client):
        """Each spirit has brand and ABV fields."""
        response = client.get('/api/spirits')
        data = response.get_json()

        for category, spirits in data.items():
            for spirit in spirits:
                assert "brand" in spirit, f"Spirit in {category} missing brand"
                assert "abv" in spirit, f"Spirit in {category} missing abv"


class TestGetSpiritsByCategory:
    """Tests for GET /api/spirits/<category> endpoint."""

    def test_returns_spirits_for_category(self, client):
        """Returns spirits for specific category."""
        response = client.get('/api/spirits/gin')
        assert response.status_code == 200

        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_unknown_category_returns_404(self, client):
        """Unknown category returns 404."""
        response = client.get('/api/spirits/unknown_category')
        assert response.status_code == 404

        data = response.get_json()
        assert "error" in data


class TestPostCalculate:
    """Tests for POST /api/calculate endpoint."""

    def test_successful_calculation_returns_all_fields(self, client):
        """Successful calculation returns all expected fields."""
        response = client.post('/api/calculate', json={
            "cocktail": "martini",
            "variation": "classic",
            "spirits": {
                "gin": "Tanqueray",
                "vermouth_dry": "Dolin Dry"
            },
            "target_volume_ml": 750,
            "target_abv": 24
        })
        assert response.status_code == 200

        data = response.get_json()
        assert "ingredients" in data
        assert "water_ml" in data
        assert "initial_abv" in data
        assert "final_abv" in data
        assert "total_volume_ml" in data

    def test_response_includes_oz_conversions(self, client):
        """Response includes oz unit conversions."""
        response = client.post('/api/calculate', json={
            "cocktail": "martini",
            "variation": "classic",
            "spirits": {
                "gin": "Tanqueray",
                "vermouth_dry": "Dolin Dry"
            },
            "target_volume_ml": 750,
            "target_abv": 24
        })

        data = response.get_json()
        assert "ingredients_oz" in data
        assert "water_oz" in data
        assert "total_volume_oz" in data

    def test_missing_required_field_returns_400(self, client):
        """Missing required field returns 400."""
        response = client.post('/api/calculate', json={
            "cocktail": "martini",
            # Missing variation, spirits, etc.
        })
        assert response.status_code == 400

        data = response.get_json()
        assert "error" in data

    def test_unknown_cocktail_returns_404(self, client):
        """Unknown cocktail returns 404."""
        response = client.post('/api/calculate', json={
            "cocktail": "unknown_cocktail",
            "variation": "classic",
            "spirits": {},
            "target_volume_ml": 750,
            "target_abv": 24
        })
        assert response.status_code == 404

        data = response.get_json()
        assert "error" in data

    def test_unknown_variation_returns_404(self, client):
        """Unknown variation returns 404."""
        response = client.post('/api/calculate', json={
            "cocktail": "martini",
            "variation": "unknown_variation",
            "spirits": {
                "gin": "Tanqueray",
                "vermouth_dry": "Dolin Dry"
            },
            "target_volume_ml": 750,
            "target_abv": 24
        })
        assert response.status_code == 404

        data = response.get_json()
        assert "error" in data

    def test_includes_cocktail_metadata(self, client):
        """Response includes cocktail name, variation name, and garnish."""
        response = client.post('/api/calculate', json={
            "cocktail": "martini",
            "variation": "classic",
            "spirits": {
                "gin": "Tanqueray",
                "vermouth_dry": "Dolin Dry"
            },
            "target_volume_ml": 750,
            "target_abv": 24
        })

        data = response.get_json()
        assert "cocktail_name" in data
        assert data["cocktail_name"] == "Martini"
        assert "variation_name" in data
        assert "garnish" in data

    def test_includes_spirit_brands(self, client):
        """Response includes selected spirit brands."""
        response = client.post('/api/calculate', json={
            "cocktail": "martini",
            "variation": "classic",
            "spirits": {
                "gin": "Tanqueray",
                "vermouth_dry": "Dolin Dry"
            },
            "target_volume_ml": 750,
            "target_abv": 24
        })

        data = response.get_json()
        assert "spirit_brands" in data
        assert data["spirit_brands"]["gin"] == "Tanqueray"


class TestGetPresets:
    """Tests for GET /api/presets endpoint."""

    def test_returns_abv_presets(self, client):
        """Returns ABV strength presets."""
        response = client.get('/api/presets')
        assert response.status_code == 200

        data = response.get_json()
        assert isinstance(data, dict)
        assert "weak" in data or "mild" in data
        assert "normal" in data
        assert "strong" in data

    def test_each_preset_has_name_and_abv(self, client):
        """Each preset has name and ABV fields."""
        response = client.get('/api/presets')
        data = response.get_json()

        for preset_id, preset in data.items():
            assert "name" in preset
            assert "abv" in preset
            assert isinstance(preset["abv"], (int, float))
