"""API routes for The Freezer Door."""

import json
import os
from flask import Blueprint, jsonify, request

from services.calculator import calculate_recipe, ml_to_oz

api = Blueprint('api', __name__)

# Load data files
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')


def load_spirits():
    with open(os.path.join(DATA_DIR, 'spirits.json'), 'r') as f:
        return json.load(f)


def load_recipes():
    with open(os.path.join(DATA_DIR, 'recipes.json'), 'r') as f:
        return json.load(f)


@api.route('/cocktails', methods=['GET'])
def get_cocktails():
    """Get all available cocktails with their variations."""
    recipes = load_recipes()

    cocktails = []
    for cocktail_id, cocktail in recipes.items():
        variations = [
            {"id": var_id, "name": var["name"]}
            for var_id, var in cocktail["variations"].items()
        ]
        cocktails.append({
            "id": cocktail_id,
            "name": cocktail["name"],
            "variations": variations,
            "garnish": cocktail.get("garnish", ""),
            "presets": cocktail.get("presets", {}),
            "serving_size_ml": cocktail.get("serving_size_ml", 90)
        })

    return jsonify(cocktails)


@api.route('/cocktails/<cocktail_id>', methods=['GET'])
def get_cocktail(cocktail_id):
    """Get details for a specific cocktail."""
    recipes = load_recipes()

    if cocktail_id not in recipes:
        return jsonify({"error": "Cocktail not found"}), 404

    cocktail = recipes[cocktail_id]
    return jsonify({
        "id": cocktail_id,
        "name": cocktail["name"],
        "variations": {
            var_id: {
                "name": var["name"],
                "ingredients": list(var["ingredients"].keys())
            }
            for var_id, var in cocktail["variations"].items()
        },
        "garnish": cocktail.get("garnish", ""),
        "presets": cocktail.get("presets", {})
    })


@api.route('/spirits', methods=['GET'])
def get_spirits():
    """Get all spirits organized by category."""
    spirits = load_spirits()
    return jsonify(spirits)


@api.route('/spirits/<category>', methods=['GET'])
def get_spirits_by_category(category):
    """Get spirits for a specific category."""
    spirits = load_spirits()

    if category not in spirits:
        return jsonify({"error": "Category not found"}), 404

    return jsonify(spirits[category])


@api.route('/calculate', methods=['POST'])
def calculate():
    """
    Calculate a freezer cocktail recipe.

    Request body:
    {
        "cocktail": "martini",
        "variation": "classic",
        "spirits": {
            "gin": "Tanqueray",
            "vermouth_dry": "Dolin Dry"
        },
        "target_volume_ml": 750,
        "target_abv": 24
    }
    """
    data = request.get_json()

    # Validate required fields
    required = ['cocktail', 'variation', 'spirits', 'target_volume_ml', 'target_abv']
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    # Load data
    recipes = load_recipes()
    spirits_db = load_spirits()

    # Get recipe
    cocktail_id = data['cocktail']
    variation_id = data['variation']

    if cocktail_id not in recipes:
        return jsonify({"error": "Cocktail not found"}), 404

    cocktail = recipes[cocktail_id]
    if variation_id not in cocktail['variations']:
        return jsonify({"error": "Variation not found"}), 404

    recipe = cocktail['variations'][variation_id]
    recipe_ingredients = recipe['ingredients']

    # Build spirit ABVs from user selections
    spirit_abvs = {}
    for ingredient, brand in data['spirits'].items():
        if ingredient in spirits_db:
            spirit_list = spirits_db[ingredient]
            spirit = next((s for s in spirit_list if s['brand'] == brand), None)
            if spirit:
                spirit_abvs[ingredient] = spirit['abv']
            else:
                # Default to first option if brand not found
                spirit_abvs[ingredient] = spirit_list[0]['abv'] if spirit_list else 0
        else:
            spirit_abvs[ingredient] = 0

    # Calculate recipe
    result = calculate_recipe(
        recipe_ingredients,
        spirit_abvs,
        data['target_volume_ml'],
        data['target_abv']
    )

    # Add oz conversions and spirit details
    result['ingredients_oz'] = {
        ingredient: ml_to_oz(ml)
        for ingredient, ml in result['ingredients'].items()
    }
    result['water_oz'] = ml_to_oz(result['water_ml'])
    result['total_volume_oz'] = ml_to_oz(result['total_volume_ml'])

    # Add selected spirit brands for display
    result['spirit_brands'] = data['spirits']
    result['cocktail_name'] = cocktail['name']
    result['variation_name'] = recipe['name']
    result['garnish'] = cocktail.get('garnish', '')

    return jsonify(result)


@api.route('/presets', methods=['GET'])
def get_presets():
    """Get ABV strength presets."""
    return jsonify({
        "weak": {"name": "Weak", "abv": 22},
        "normal": {"name": "Normal", "abv": 24},
        "strong": {"name": "Strong", "abv": 26}
    })
