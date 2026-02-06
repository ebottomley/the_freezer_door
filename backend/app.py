"""The Freezer Door - Flask API server."""

import os
from flask import Flask, send_from_directory
from flask_cors import CORS

from routes.api import api

# Check if we're in production (static folder exists with built frontend)
static_folder = os.path.join(os.path.dirname(__file__), 'static')
has_static = os.path.exists(static_folder)

if has_static:
    app = Flask(__name__, static_folder='static', static_url_path='')
else:
    app = Flask(__name__)

CORS(app)

# Register blueprints
app.register_blueprint(api, url_prefix='/api')


@app.route('/')
def index():
    if has_static:
        return send_from_directory(app.static_folder, 'index.html')
    return {
        "name": "The Freezer Door API",
        "version": "1.0.0",
        "endpoints": [
            "GET /api/cocktails",
            "GET /api/cocktails/<id>",
            "GET /api/spirits",
            "GET /api/spirits/<category>",
            "POST /api/calculate",
            "GET /api/presets"
        ]
    }


@app.errorhandler(404)
def not_found(e):
    # For SPA routing - serve index.html for non-API routes
    if has_static:
        return send_from_directory(app.static_folder, 'index.html')
    return {"error": "Not found"}, 404


if __name__ == '__main__':
    app.run(debug=True, port=5000)
