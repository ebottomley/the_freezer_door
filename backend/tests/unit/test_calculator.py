"""Unit tests for calculator.py functions."""

import pytest
from services.calculator import (
    calculate_initial_abv,
    calculate_water_dilution,
    calculate_recipe,
    ml_to_oz,
    oz_to_ml,
)


class TestCalculateInitialABV:
    """Tests for calculate_initial_abv function."""

    def test_single_spirit_returns_own_abv(self, sample_spirits):
        """Single spirit returns its own ABV."""
        ingredients = {"gin": 1.0}
        result = calculate_initial_abv(ingredients, sample_spirits)
        assert result == 47.3

    def test_equal_parts_returns_simple_average(self, sample_spirits):
        """Equal parts of two spirits returns simple average."""
        ingredients = {"gin": 1.0, "vermouth_dry": 1.0}
        result = calculate_initial_abv(ingredients, sample_spirits)
        expected = (47.3 + 17.5) / 2
        assert result == expected

    def test_weighted_average_respects_ratios(self, martini_ingredients, sample_spirits):
        """4:1 martini ratio produces weighted average."""
        result = calculate_initial_abv(martini_ingredients, sample_spirits)
        # 2.4 parts gin (47.3%) + 0.6 parts vermouth (17.5%)
        # = (2.4 * 47.3 + 0.6 * 17.5) / 3.0
        expected = (2.4 * 47.3 + 0.6 * 17.5) / 3.0
        assert result == pytest.approx(expected)

    def test_empty_ingredients_returns_zero(self, sample_spirits):
        """Empty ingredients dict returns 0."""
        result = calculate_initial_abv({}, sample_spirits)
        assert result == 0

    def test_missing_spirit_abv_treated_as_zero(self):
        """Missing spirit ABV is treated as 0%."""
        ingredients = {"gin": 1.0, "unknown_spirit": 1.0}
        spirit_abvs = {"gin": 40.0}
        result = calculate_initial_abv(ingredients, spirit_abvs)
        # (1 * 40 + 1 * 0) / 2 = 20
        assert result == 20.0

    def test_negroni_three_equal_parts(self, negroni_ingredients, sample_spirits):
        """Negroni with equal parts calculates correctly."""
        result = calculate_initial_abv(negroni_ingredients, sample_spirits)
        # (47.3 + 25.0 + 16.0) / 3
        expected = (47.3 + 25.0 + 16.0) / 3
        assert result == pytest.approx(expected)


class TestCalculateWaterDilution:
    """Tests for calculate_water_dilution function."""

    def test_standard_dilution_calculation(self):
        """Standard dilution calculates correctly."""
        # 100ml at 40% ABV diluted to 20% ABV
        # final_volume = 100 * 40 / 20 = 200
        # water = 200 - 100 = 100
        result = calculate_water_dilution(100, 40, 20)
        assert result == 100

    def test_target_equals_initial_returns_zero(self):
        """No water needed when target equals initial."""
        result = calculate_water_dilution(100, 40, 40)
        assert result == 0

    def test_target_higher_than_initial_returns_zero(self):
        """Cannot increase ABV by adding water."""
        result = calculate_water_dilution(100, 40, 50)
        assert result == 0

    def test_target_abv_zero_returns_zero(self):
        """Target ABV of 0 returns 0 (avoid division by zero)."""
        result = calculate_water_dilution(100, 40, 0)
        assert result == 0

    def test_negative_target_abv_returns_zero(self):
        """Negative target ABV returns 0."""
        result = calculate_water_dilution(100, 40, -10)
        assert result == 0

    def test_typical_freezer_cocktail_dilution(self):
        """Typical freezer cocktail 40% to 24% ABV."""
        # 100ml at 40% to 24%
        # final_volume = 100 * 40 / 24 = 166.67
        # water = 166.67 - 100 = 66.67
        result = calculate_water_dilution(100, 40, 24)
        assert result == pytest.approx(66.67, rel=0.01)


class TestCalculateRecipe:
    """Tests for calculate_recipe function."""

    def test_full_martini_recipe(self, martini_ingredients, sample_spirits):
        """Full martini recipe calculation."""
        result = calculate_recipe(
            martini_ingredients,
            sample_spirits,
            target_volume_ml=750,
            target_abv=24
        )

        assert "ingredients" in result
        assert "gin" in result["ingredients"]
        assert "vermouth_dry" in result["ingredients"]
        assert "water_ml" in result
        assert "initial_abv" in result
        assert "final_abv" in result
        assert "total_volume_ml" in result

        # Check total volume is correct
        assert result["total_volume_ml"] == 750

        # Check final ABV matches target
        assert result["final_abv"] == 24

        # Verify ingredients + water = total volume
        total_ingredients = sum(result["ingredients"].values())
        assert total_ingredients + result["water_ml"] == pytest.approx(750, rel=0.01)

    def test_no_dilution_when_target_exceeds_initial(self, sample_spirits):
        """No water added when target ABV >= initial ABV."""
        ingredients = {"vermouth_dry": 1.0}  # 17.5% ABV
        result = calculate_recipe(
            ingredients,
            sample_spirits,
            target_volume_ml=500,
            target_abv=24  # Higher than vermouth ABV
        )

        assert result["water_ml"] == 0
        # Final ABV should be the initial ABV, not the target
        assert result["final_abv"] == 17.5

    def test_recipe_scaling_to_target_volume(self, martini_ingredients, sample_spirits):
        """Recipe scales proportionally to target volume."""
        result_small = calculate_recipe(
            martini_ingredients,
            sample_spirits,
            target_volume_ml=375,
            target_abv=24
        )

        result_large = calculate_recipe(
            martini_ingredients,
            sample_spirits,
            target_volume_ml=750,
            target_abv=24
        )

        # Large batch should be 2x the small batch
        ratio = result_large["ingredients"]["gin"] / result_small["ingredients"]["gin"]
        assert ratio == pytest.approx(2.0, rel=0.01)

    def test_negroni_recipe(self, negroni_ingredients, sample_spirits):
        """Negroni recipe with three equal parts."""
        result = calculate_recipe(
            negroni_ingredients,
            sample_spirits,
            target_volume_ml=750,
            target_abv=22
        )

        # All three spirits should have equal amounts
        gin = result["ingredients"]["gin"]
        campari = result["ingredients"]["campari"]
        vermouth = result["ingredients"]["vermouth_sweet"]

        assert gin == pytest.approx(campari, rel=0.01)
        assert gin == pytest.approx(vermouth, rel=0.01)


class TestConversions:
    """Tests for unit conversion functions."""

    def test_ml_to_oz_standard(self):
        """Standard ml to oz conversion."""
        # 29.5735 ml = 1 oz
        result = ml_to_oz(29.5735)
        assert result == 1.0

    def test_ml_to_oz_common_values(self):
        """Common volume conversions."""
        assert ml_to_oz(750) == pytest.approx(25.36, rel=0.01)
        assert ml_to_oz(90) == pytest.approx(3.04, rel=0.01)

    def test_oz_to_ml_standard(self):
        """Standard oz to ml conversion."""
        result = oz_to_ml(1)
        assert result == pytest.approx(29.5735, rel=0.01)

    def test_roundtrip_conversion_accuracy(self):
        """Converting ml -> oz -> ml preserves value."""
        original_ml = 100
        oz = ml_to_oz(original_ml)
        back_to_ml = oz_to_ml(oz)
        # Allow for rounding errors
        assert back_to_ml == pytest.approx(original_ml, abs=0.5)

    def test_ml_to_oz_zero(self):
        """Zero ml equals zero oz."""
        assert ml_to_oz(0) == 0

    def test_oz_to_ml_zero(self):
        """Zero oz equals zero ml."""
        assert oz_to_ml(0) == 0
