"""
Freezer cocktail dilution calculator.

Core formula:
- Initial ABV = weighted average of spirit ABVs based on recipe ratios
- Water to add = (spirit_volume * initial_abv / target_abv) - spirit_volume
"""


def calculate_initial_abv(ingredients: dict, spirit_abvs: dict) -> float:
    """
    Calculate the weighted average ABV of a cocktail mixture.

    Args:
        ingredients: dict of ingredient_type -> parts (e.g., {"gin": 2.5, "vermouth_dry": 0.5})
        spirit_abvs: dict of ingredient_type -> ABV percentage (e.g., {"gin": 47.3, "vermouth_dry": 17.5})

    Returns:
        Weighted average ABV as a percentage
    """
    total_parts = sum(ingredients.values())
    if total_parts == 0:
        return 0

    weighted_abv = sum(
        parts * spirit_abvs.get(ingredient, 0)
        for ingredient, parts in ingredients.items()
    )

    return weighted_abv / total_parts


def calculate_water_dilution(spirit_volume_ml: float, initial_abv: float, target_abv: float) -> float:
    """
    Calculate amount of water needed to dilute to target ABV.

    Args:
        spirit_volume_ml: Total volume of spirits in ml
        initial_abv: Starting ABV percentage
        target_abv: Target ABV percentage

    Returns:
        Amount of water to add in ml
    """
    if target_abv <= 0 or target_abv >= initial_abv:
        return 0

    # Formula: water = (spirit_volume * initial_abv / target_abv) - spirit_volume
    final_volume = spirit_volume_ml * initial_abv / target_abv
    water_needed = final_volume - spirit_volume_ml

    return max(0, water_needed)


def calculate_recipe(
    recipe_ingredients: dict,
    spirit_abvs: dict,
    target_volume_ml: float,
    target_abv: float
) -> dict:
    """
    Calculate a complete freezer cocktail recipe.

    Args:
        recipe_ingredients: dict of ingredient_type -> parts
        spirit_abvs: dict of ingredient_type -> ABV percentage
        target_volume_ml: Desired final batch volume in ml
        target_abv: Target ABV percentage (typically 20-25%)

    Returns:
        dict containing:
        - ingredients: dict of ingredient -> amount in ml
        - water_ml: amount of water to add
        - initial_abv: ABV before dilution
        - final_abv: target ABV
        - total_volume_ml: final volume
    """
    # Calculate initial ABV
    initial_abv = calculate_initial_abv(recipe_ingredients, spirit_abvs)

    # Calculate the ratio of spirits to water needed
    total_parts = sum(recipe_ingredients.values())

    if target_abv >= initial_abv:
        # No dilution needed, just scale the recipe
        scale_factor = target_volume_ml / total_parts if total_parts > 0 else 0
        scaled_ingredients = {
            ingredient: parts * scale_factor
            for ingredient, parts in recipe_ingredients.items()
        }
        return {
            "ingredients": scaled_ingredients,
            "water_ml": 0,
            "initial_abv": round(initial_abv, 1),
            "final_abv": round(initial_abv, 1),
            "total_volume_ml": round(target_volume_ml, 1)
        }

    # Calculate how much the spirits need to be diluted
    # final_volume = spirit_volume * initial_abv / target_abv
    # We want spirit_volume + water = target_volume_ml
    # So: spirit_volume = target_volume_ml * target_abv / initial_abv

    spirit_volume_ml = target_volume_ml * target_abv / initial_abv
    water_ml = target_volume_ml - spirit_volume_ml

    # Scale recipe ingredients to the spirit volume
    scale_factor = spirit_volume_ml / total_parts if total_parts > 0 else 0
    scaled_ingredients = {
        ingredient: round(parts * scale_factor, 1)
        for ingredient, parts in recipe_ingredients.items()
    }

    return {
        "ingredients": scaled_ingredients,
        "water_ml": round(water_ml, 1),
        "initial_abv": round(initial_abv, 1),
        "final_abv": round(target_abv, 1),
        "total_volume_ml": round(target_volume_ml, 1)
    }


def ml_to_oz(ml: float) -> float:
    """Convert milliliters to fluid ounces."""
    return round(ml / 29.5735, 2)


def oz_to_ml(oz: float) -> float:
    """Convert fluid ounces to milliliters."""
    return round(oz * 29.5735, 1)
