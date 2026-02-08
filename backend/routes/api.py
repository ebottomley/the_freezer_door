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


def load_ingredient_categories():
    with open(os.path.join(DATA_DIR, 'ingredient_categories.json'), 'r') as f:
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


@api.route('/ingredients', methods=['GET'])
def get_ingredients():
    """Get all ingredients organized by category with their brands."""
    categories = load_ingredient_categories()
    spirits = load_spirits()

    result = {}
    for category_id, category in categories.items():
        types_with_brands = {}
        for type_id in category['types']:
            if type_id in spirits:
                types_with_brands[type_id] = spirits[type_id]
            else:
                types_with_brands[type_id] = []

        result[category_id] = {
            'label': category['label'],
            'measurement_unit': category['measurement_unit'],
            'types': types_with_brands
        }

    return jsonify(result)


@api.route('/calculate', methods=['POST'])
def calculate():
    """
    Calculate a freezer cocktail recipe.

    Standard mode request body:
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

    Custom mode request body:
    {
        "mode": "custom",
        "ingredients": [
            {"type": "gin", "brand": "Tanqueray", "parts": 2.5, "abv": 47.3},
            {"type": "vermouth_dry", "brand": "Dolin Dry", "parts": 0.5, "abv": 17.5}
        ],
        "target_volume_ml": 750,
        "target_abv": 24,
        "recipe_name": "My Custom Martini",
        "garnish": "Lemon twist"
    }
    """
    data = request.get_json()

    # Check if custom mode
    if data.get('mode') == 'custom':
        return calculate_custom(data)

    # Standard mode - validate required fields
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


def calculate_custom(data):
    """Handle custom recipe calculation."""
    # Validate required fields for custom mode
    required = ['ingredients', 'target_volume_ml', 'target_abv']
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    ingredients = data['ingredients']
    if not ingredients or len(ingredients) == 0:
        return jsonify({"error": "At least one ingredient is required"}), 400

    # Build recipe_ingredients and spirit_abvs from the ingredients array
    recipe_ingredients = {}
    spirit_abvs = {}
    spirit_brands = {}

    for ing in ingredients:
        if 'type' not in ing or 'parts' not in ing:
            return jsonify({"error": "Each ingredient must have type and parts"}), 400

        ing_type = ing['type']
        parts = float(ing['parts'])

        # Handle multiple ingredients of same type by creating unique keys
        key = ing_type
        counter = 1
        while key in recipe_ingredients:
            counter += 1
            key = f"{ing_type}_{counter}"

        recipe_ingredients[key] = parts
        spirit_abvs[key] = float(ing.get('abv', 0))
        spirit_brands[key] = ing.get('brand', 'Custom')

    # Calculate recipe using existing function
    result = calculate_recipe(
        recipe_ingredients,
        spirit_abvs,
        data['target_volume_ml'],
        data['target_abv']
    )

    # Add oz conversions
    result['ingredients_oz'] = {
        ingredient: ml_to_oz(ml)
        for ingredient, ml in result['ingredients'].items()
    }
    result['water_oz'] = ml_to_oz(result['water_ml'])
    result['total_volume_oz'] = ml_to_oz(result['total_volume_ml'])

    # Add custom recipe details
    result['spirit_brands'] = spirit_brands
    result['cocktail_name'] = data.get('recipe_name', 'Custom Recipe')
    result['variation_name'] = 'Custom'
    result['garnish'] = data.get('garnish', '')
    result['is_custom'] = True

    return jsonify(result)


@api.route('/presets', methods=['GET'])
def get_presets():
    """Get ABV strength presets."""
    return jsonify({
        "weak": {"name": "Weak", "abv": 22},
        "normal": {"name": "Normal", "abv": 24},
        "strong": {"name": "Strong", "abv": 26}
    })
