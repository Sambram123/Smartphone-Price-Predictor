from flask import Flask, request, jsonify
import pandas as pd
import joblib
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
try:
    pipeline = joblib.load("mobile_price_pipeline.pkl")
except Exception:
    pipeline = None

REQUIRED_FIELDS = [
    "Brand",
    "Ratings",
    "RAM",
    "ROM",
    "Mobile_Size",
    "Primary_Cam",
    "Selfi_Cam",
    "Battery_Power",
]

NUMERIC_FIELDS = [
    "Ratings",
    "RAM",
    "ROM",
    "Mobile_Size",
    "Primary_Cam",
    "Selfi_Cam",
    "Battery_Power",
]


def _validate_payload(data):
    if not isinstance(data, dict):
        return None, "Invalid payload. Expected a JSON object."

    missing_fields = [field for field in REQUIRED_FIELDS if field not in data]
    if missing_fields:
        return None, f"Missing required fields: {', '.join(missing_fields)}"

    extra_fields = [field for field in data.keys() if field not in REQUIRED_FIELDS]
    if extra_fields:
        return None, f"Unexpected fields: {', '.join(extra_fields)}"

    brand = str(data.get("Brand", "")).strip()
    if not brand:
        return None, "Brand must be a non-empty string."

    cleaned = {"Brand": brand}

    for field in NUMERIC_FIELDS:
        try:
            cleaned[field] = float(data[field])
        except (TypeError, ValueError):
            return None, f"{field} must be a numeric value."

    if not 1 <= cleaned["Ratings"] <= 5:
        return None, "Ratings must be between 1 and 5."
    if cleaned["RAM"] <= 0 or cleaned["ROM"] <= 0 or cleaned["Mobile_Size"] <= 0:
        return None, "RAM, ROM and Mobile_Size must be greater than 0."
    if cleaned["Primary_Cam"] <= 0 or cleaned["Selfi_Cam"] <= 0:
        return None, "Primary_Cam and Selfi_Cam must be greater than 0."
    if cleaned["Battery_Power"] <= 0:
        return None, "Battery_Power must be greater than 0."

    return cleaned, None

@app.route("/predict", methods=["POST"])
def predict():
    if pipeline is None:
        return jsonify({"error": "Model not loaded. Ensure mobile_price_pipeline.pkl exists."}), 500

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Invalid or missing JSON payload."}), 400

    cleaned_data, error = _validate_payload(data)
    if error:
        return jsonify({"error": error}), 400

    df = pd.DataFrame([cleaned_data], columns=REQUIRED_FIELDS)

    try:
        prediction = pipeline.predict(df)[0]
    except Exception:
        return jsonify({"error": "Prediction failed due to invalid input format."}), 400

    return jsonify({"prediction": int(round(float(prediction)))})

if __name__ == "__main__":
    print("Backend is running")
    app.run(debug=True)