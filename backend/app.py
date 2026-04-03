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

KNOWN_BRANDS = [
    "Alcatel","Apple","Blacear","Blacerry","Black","BlackZone","Callbar","Detel","Dublin","Easyfone","Ecotel","F-Fook","Forme","GAMMA","Gee","Gfive","Good","Google","Grabo","GreenBerry", "Heemax","Hicell","Honor","Huawei","I","ITEL","InFocus","Infinix","Inovu","Intex","Itel","JIVI","Jivi","Jmax","Karbonn","Kechaoda","LG","Lava","Lenovo","MI3","MTR","Mafe","Megus","Meizu","Mi","Micax","Moto","Motorola","Muphone","Mymax","Nexus","Nokia","OPPO","OnePlus","POCO","Peace","Q-Tel","Realme","Redmi","Salora","Samsung","Snexian","Ssky","Tecno","Tork","Trio","Vivo","Wizphone","Yuho","iQOO","tecno",
]

KNOWN_BRANDS_LOWER = {b.lower() for b in KNOWN_BRANDS}


def _normalize_brand(value: str) -> str:
    raw = str(value or "").strip()
    if not raw:
        return raw
    lower = raw.lower()
    for b in KNOWN_BRANDS:
        if b.lower() == lower:
            return b
    return raw

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

    if brand.lower() not in KNOWN_BRANDS_LOWER:
        return None, "Brand must be one of the supported values."

    cleaned = {"Brand": _normalize_brand(brand)}

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