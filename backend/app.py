from pathlib import Path

from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import joblib
from flask_cors import CORS




app = Flask(__name__)
CORS(app)

# ── Model ──────────────────────────────────────────────────────────────────

_cb_model = None
_CAT_FEATURES = ("Brand",)
_FEATURE_COLS = ()
_brand_stats = None       # DataFrame: Brand, brand_avg_price, brand_min_price, brand_max_price
_global_avg = 0.0
_global_min = 0.0
_global_max = 0.0

_pkl = Path(__file__).resolve().parent / "mobile_price_pipeline.pkl"
if not _pkl.is_file():
    _pkl = Path(__file__).resolve().parent.parent / "mobile_price_pipeline.pkl"
try:
    _bundle = joblib.load(_pkl) if _pkl.is_file() else None
    if _bundle is None:
        raise FileNotFoundError(str(_pkl))
    if isinstance(_bundle, dict):
        _cb_model = _bundle["model"]
        _CAT_FEATURES = tuple(_bundle.get("cat_features", ["Brand"]))
        _FEATURE_COLS = tuple(_bundle.get("feature_cols", []))
        _brand_stats = _bundle.get("brand_stats", None)
        _global_avg = _bundle.get("global_avg", 0.0)
        _global_min = _bundle.get("global_min", 0.0)
        _global_max = _bundle.get("global_max", 0.0)
    else:
        _cb_model = _bundle
except Exception as exc:
    print("Warning: could not load mobile_price_pipeline.pkl:", exc)


def _get_brand_stats(brand: str):
    """Look up brand_avg/min/max from training data; fallback to global stats."""
    if _brand_stats is not None:
        match = _brand_stats[_brand_stats["Brand"] == brand]
        if len(match):
            return (
                match["brand_avg_price"].values[0],
                match["brand_min_price"].values[0],
                match["brand_max_price"].values[0],
            )
    return _global_avg, _global_min, _global_max


def _engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Must match Smartphone_Price_Predictor.ipynb definitions."""
    out = df.copy()

    # spec_score: composite hardware quality metric
    out["spec_score"] = (
        np.log1p(out["RAM"])
        + np.log1p(out["ROM"])
        + np.log1p(out["Battery_Power"])
        + np.log1p(out["Primary_Cam"])
        + np.log1p(out["Selfi_Cam"])
    )

    # RAM-to-ROM ratio
    out["ram_rom_ratio"] = out["RAM"] / (out["ROM"] + 1)

    # Camera total
    out["total_cam"] = out["Primary_Cam"] + out["Selfi_Cam"]

    # Brand-level price stats
    brand = str(out["Brand"].iloc[0])
    bavg, bmin, bmax = _get_brand_stats(brand)
    out["brand_avg_price"] = bavg
    out["brand_min_price"] = bmin
    out["brand_max_price"] = bmax

    for c in _CAT_FEATURES:
        out[c] = out[c].astype(str)
    return out


def _predict(df_base: pd.DataFrame):
    """
    Brand-relative prediction:
    Model predicts relative_price; final = relative_price + brand_avg_price.
    """
    eng = _engineer_features(df_base)
    brand_avg = eng["brand_avg_price"].values[0]

    if _FEATURE_COLS:
        eng = eng[list(_FEATURE_COLS)]

    relative_pred = _cb_model.predict(eng)[0]
    final_price = relative_pred + brand_avg
    return max(0, final_price)

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
    if _cb_model is None:
        return jsonify({"error": "Model not loaded. Ensure mobile_price_pipeline.pkl exists."}), 500

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Invalid or missing JSON payload."}), 400

    cleaned, error = _validate_payload(data)
    if error:
        return jsonify({"error": error}), 400

    df = pd.DataFrame([cleaned], columns=REQUIRED_FIELDS)

    try:
        prediction = _predict(df)
    except Exception as exc:
        return jsonify({"error": f"Prediction failed: {exc}"}), 400

    return jsonify({"prediction": int(round(float(prediction)))})


if __name__ == "__main__":
    print("Backend running at http://127.0.0.1:5000")
    app.run(debug=True)