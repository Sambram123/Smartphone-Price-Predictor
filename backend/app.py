from pathlib import Path
import sys

from flask import Flask, request, jsonify
import pandas as pd
import joblib
from flask_cors import CORS




app = Flask(__name__)
CORS(app)

# ── Model ──────────────────────────────────────────────────────────────────

pipeline = joblib.load( "mobile_price_pipeline.pkl")

REQUIRED_FIELDS = ["Brand", "Ratings", "RAM", "ROM", "Mobile_Size",
                   "Primary_Cam", "Selfi_Cam", "Battery_Power"]
NUMERIC_FIELDS  = ["Ratings", "RAM", "ROM", "Mobile_Size",
                   "Primary_Cam", "Selfi_Cam", "Battery_Power"]


def _validate_payload(data):
    if not isinstance(data, dict):
        return None, "Invalid payload. Expected a JSON object."

    missing = [f for f in REQUIRED_FIELDS if f not in data]
    if missing:
        return None, f"Missing required fields: {', '.join(missing)}"

    extra = [f for f in data if f not in REQUIRED_FIELDS]
    if extra:
        return None, f"Unexpected fields: {', '.join(extra)}"

    brand = str(data.get("Brand", "")).strip()
    if not brand:
        return None, "Brand must be a non-empty string."

    cleaned = {"Brand": brand}

    for field in NUMERIC_FIELDS:
        try:
            cleaned[field] = float(data[field])
        except (TypeError, ValueError):
            return None, f"{field} must be a numeric value."

    # Range guards
    if not (1 <= cleaned["Ratings"] <= 5):
        return None, "Ratings must be between 1 and 5."
    if cleaned["RAM"] <= 0:
        return None, "RAM must be greater than 0."
    if cleaned["ROM"] <= 0:
        return None, "Storage (ROM) must be greater than 0."
    if cleaned["Mobile_Size"] <= 0:
        return None, "Screen size (Mobile_Size) must be greater than 0."
    if cleaned["Primary_Cam"] <= 0:
        return None, "Primary camera must be greater than 0 MP."
    if cleaned["Selfi_Cam"] <= 0:
        return None, "Selfie camera must be greater than 0 MP."
    if cleaned["Battery_Power"] <= 0:
        return None, "Battery power must be greater than 0 mAh."

    return cleaned, None


# ── Routes ─────────────────────────────────────────────────────────────────
@app.route("/brands", methods=["GET"])
def get_brands():
    """Return a small set of common brand examples for the frontend."""
    return jsonify({"brands": ["Apple", "Samsung", "OnePlus", "OPPO", "Vivo", "Realme", "Nokia"]})


@app.route("/predict", methods=["POST"])
def predict():
    if pipeline is None:
        return jsonify({"error": "Model not loaded. Ensure mobile_price_pipeline.pkl exists."}), 500

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Invalid or missing JSON payload."}), 400

    cleaned, error = _validate_payload(data)
    if error:
        return jsonify({"error": error}), 400

    df = pd.DataFrame([cleaned], columns=REQUIRED_FIELDS)

    try:
        prediction = pipeline.predict(df)[0]
    except Exception as exc:
        return jsonify({"error": f"Prediction failed: {exc}"}), 400

    return jsonify({"prediction": int(round(float(prediction)))})


if __name__ == "__main__":
    print("Backend running at http://127.0.0.1:5000")
    app.run(debug=True)