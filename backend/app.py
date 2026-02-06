"""The Freezer Door - Flask API server."""

from flask import Flask
from flask_cors import CORS

from routes.api import api

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(api, url_prefix='/api')


@app.route('/')
def index():
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


if __name__ == '__main__':
    app.run(debug=True, port=5000)
