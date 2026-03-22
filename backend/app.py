from flask import Flask, request, jsonify
import pandas as pd
import joblib
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
pipeline = joblib.load("../mobile_price_pipeline.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    df = pd.DataFrame([data])

    prediction = pipeline.predict(df)[0]

    return jsonify({"prediction": int(prediction)})

if __name__ == "__main__":
    print("Backend is running")
    app.run(debug=True)