"""Integration tests for custom recipe API endpoints."""

import pytest


class TestGetIngredients:
    """Tests for GET /api/ingredients endpoint."""

    def test_returns_ingredients_by_category(self, client):
        """Returns ingredients organized by category."""
        response = client.get('/api/ingredients')
        assert response.status_code == 200

        data = response.get_json()
        assert isinstance(data, dict)
        assert "spirits" in data
        assert "liqueurs" in data
        assert "vermouths" in data
        assert "bitters" in data
        assert "sweeteners" in data

    def test_each_category_has_required_fields(self, client):
        """Each category has label, measurement_unit, and types."""
        response = client.get('/api/ingredients')
        data = response.get_json()

        for category_id, category in data.items():
            assert "label" in category, f"Category {category_id} missing label"
            assert "measurement_unit" in category, f"Category {category_id} missing measurement_unit"
            assert "types" in category, f"Category {category_id} missing types"
            assert isinstance(category["types"], dict)

    def test_bitters_have_dashes_unit(self, client):
        """Bitters category uses dashes as measurement unit."""
        response = client.get('/api/ingredients')
        data = response.get_json()

        assert data["bitters"]["measurement_unit"] == "dashes"

    def test_spirits_have_parts_unit(self, client):
        """Spirits category uses parts as measurement unit."""
        response = client.get('/api/ingredients')
        data = response.get_json()

        assert data["spirits"]["measurement_unit"] == "parts"

    def test_types_contain_brand_options(self, client):
        """Each type contains list of brand options with ABV."""
        response = client.get('/api/ingredients')
        data = response.get_json()

        # Check that gin has brands
        gin_brands = data["spirits"]["types"].get("gin", [])
        assert len(gin_brands) > 0
        assert "brand" in gin_brands[0]
        assert "abv" in gin_brands[0]


class TestPostCalculateCustom:
    """Tests for POST /api/calculate with custom mode."""

    def test_successful_custom_calculation(self, client):
        """Successful custom calculation returns all expected fields."""
        response = client.post('/api/calculate', json={
            "mode": "custom",
            "ingredients": [
                {"type": "gin", "brand": "Tanqueray", "parts": 2.5, "abv": 47.3},
                {"type": "vermouth_dry", "brand": "Dolin Dry", "parts": 0.5, "abv": 17.5}
            ],
            "target_volume_ml": 750,
            "target_abv": 24,
            "recipe_name": "My Custom Martini"
        })
        assert response.status_code == 200

        data = response.get_json()
        assert "ingredients" in data
        assert "water_ml" in data
        assert "initial_abv" in data
        assert "final_abv" in data
        assert "total_volume_ml" in data
        assert data.get("is_custom") is True

    def test_custom_response_includes_oz_conversions(self, client):
        """Custom response includes oz unit conversions."""
        response = client.post('/api/calculate', json={
            "mode": "custom",
            "ingredients": [
                {"type": "gin", "brand": "Tanqueray", "parts": 2, "abv": 47},
                {"type": "vermouth_dry", "brand": "Dolin Dry", "parts": 1, "abv": 17}
            ],
            "target_volume_ml": 750,
            "target_abv": 24
        })

        data = response.get_json()
        assert "ingredients_oz" in data
        assert "water_oz" in data
        assert "total_volume_oz" in data

    def test_custom_uses_provided_recipe_name(self, client):
        """Custom calculation uses the provided recipe name."""
        response = client.post('/api/calculate', json={
            "mode": "custom",
            "ingredients": [
                {"type": "bourbon", "brand": "Buffalo Trace", "parts": 2, "abv": 45}
            ],
            "target_volume_ml": 500,
            "target_abv": 22,
            "recipe_name": "Test Recipe"
        })

        data = response.get_json()
        assert data["cocktail_name"] == "Test Recipe"
        assert data["variation_name"] == "Custom"

    def test_custom_defaults_recipe_name_if_not_provided(self, client):
        """Custom calculation defaults to 'Custom Recipe' if no name provided."""
        response = client.post('/api/calculate', json={
            "mode": "custom",
            "ingredients": [
                {"type": "vodka", "brand": "Absolut", "parts": 2, "abv": 40}
            ],
            "target_volume_ml": 500,
            "target_abv": 20
        })

        data = response.get_json()
        assert data["cocktail_name"] == "Custom Recipe"

    def test_custom_includes_garnish(self, client):
        """Custom calculation includes garnish when provided."""
        response = client.post('/api/calculate', json={
            "mode": "custom",
            "ingredients": [
                {"type": "gin", "brand": "Tanqueray", "parts": 2, "abv": 47}
            ],
            "target_volume_ml": 500,
            "target_abv": 22,
            "garnish": "Olive"
        })

        data = response.get_json()
        assert data["garnish"] == "Olive"

    def test_custom_missing_ingredients_returns_400(self, client):
        """Custom mode without ingredients returns 400."""
        response = client.post('/api/calculate', json={
            "mode": "custom",
            "target_volume_ml": 750,
            "target_abv": 24
        })
        assert response.status_code == 400

        data = response.get_json()
        assert "error" in data

    def test_custom_empty_ingredients_returns_400(self, client):
        """Custom mode with empty ingredients list returns 400."""
        response = client.post('/api/calculate', json={
            "mode": "custom",
            "ingredients": [],
            "target_volume_ml": 750,
            "target_abv": 24
        })
        assert response.status_code == 400

        data = response.get_json()
        assert "error" in data

    def test_custom_ingredient_missing_type_returns_400(self, client):
        """Custom ingredient without type returns 400."""
        response = client.post('/api/calculate', json={
            "mode": "custom",
            "ingredients": [
                {"brand": "Tanqueray", "parts": 2, "abv": 47}
            ],
            "target_volume_ml": 750,
            "target_abv": 24
        })
        assert response.status_code == 400

        data = response.get_json()
        assert "error" in data

    def test_custom_ingredient_missing_parts_returns_400(self, client):
        """Custom ingredient without parts returns 400."""
        response = client.post('/api/calculate', json={
            "mode": "custom",
            "ingredients": [
                {"type": "gin", "brand": "Tanqueray", "abv": 47}
            ],
            "target_volume_ml": 750,
            "target_abv": 24
        })
        assert response.status_code == 400

        data = response.get_json()
        assert "error" in data

    def test_custom_handles_multiple_same_type_ingredients(self, client):
        """Custom calculation handles multiple ingredients of same type."""
        response = client.post('/api/calculate', json={
            "mode": "custom",
            "ingredients": [
                {"type": "gin", "brand": "Tanqueray", "parts": 1.5, "abv": 47},
                {"type": "gin", "brand": "Hendrick's", "parts": 1.5, "abv": 44}
            ],
            "target_volume_ml": 750,
            "target_abv": 24
        })
        assert response.status_code == 200

        data = response.get_json()
        # Should have two gin entries (gin and gin_2)
        assert "gin" in data["ingredients"]
        assert "gin_2" in data["ingredients"]

    def test_custom_calculation_math_is_correct(self, client):
        """Custom calculation produces mathematically correct results."""
        response = client.post('/api/calculate', json={
            "mode": "custom",
            "ingredients": [
                {"type": "gin", "brand": "Custom", "parts": 1, "abv": 40}
            ],
            "target_volume_ml": 1000,
            "target_abv": 20
        })
        assert response.status_code == 200

        data = response.get_json()
        # With 40% ABV spirit diluted to 20% ABV:
        # spirit_volume = 1000 * 20 / 40 = 500ml
        # water = 1000 - 500 = 500ml
        assert abs(data["ingredients"]["gin"] - 500) < 1
        assert abs(data["water_ml"] - 500) < 1
        assert data["initial_abv"] == 40
        assert data["final_abv"] == 20

    def test_custom_with_zero_abv_ingredients(self, client):
        """Custom calculation handles 0% ABV ingredients (juices, syrups)."""
        response = client.post('/api/calculate', json={
            "mode": "custom",
            "ingredients": [
                {"type": "vodka", "brand": "Absolut", "parts": 2, "abv": 40},
                {"type": "lime_juice", "brand": "Fresh", "parts": 1, "abv": 0},
                {"type": "simple_syrup", "brand": "1:1", "parts": 0.5, "abv": 0}
            ],
            "target_volume_ml": 750,
            "target_abv": 15
        })
        assert response.status_code == 200

        data = response.get_json()
        # 2 parts vodka at 40% in 3.5 total parts = ~22.9% initial ABV
        assert data["initial_abv"] > 20
        assert data["initial_abv"] < 25

    def test_custom_includes_spirit_brands(self, client):
        """Custom response includes spirit brands mapping."""
        response = client.post('/api/calculate', json={
            "mode": "custom",
            "ingredients": [
                {"type": "gin", "brand": "Tanqueray", "parts": 2, "abv": 47},
                {"type": "vermouth_dry", "brand": "Dolin Dry", "parts": 1, "abv": 17}
            ],
            "target_volume_ml": 750,
            "target_abv": 24
        })

        data = response.get_json()
        assert "spirit_brands" in data
        assert data["spirit_brands"]["gin"] == "Tanqueray"
        assert data["spirit_brands"]["vermouth_dry"] == "Dolin Dry"
