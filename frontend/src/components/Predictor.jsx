import { useState } from "react";

function Predictor() {
  const [form, setForm] = useState({
    Brand: "",
    Ratings: "",
    RAM: "",
    ROM: "",
    Mobile_Size: "",
    Primary_Cam: "",
    Selfi_Cam: "",
    Battery_Power: ""
  });

  const [price, setPrice] = useState(null);

  // Dropdown options with real-world values
  const dropdownOptions = {
    Brand: [], // To be provided by user
    Ratings: [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0],
    RAM: [4, 6, 8, 12, 16],
    ROM: [32, 64, 128, 256, 512],
    Mobile_Size: [6.0, 6.1, 6.5, 6.7, 6.9, 7.0],
    Primary_Cam: [8, 12, 13, 16, 20, 48, 64, 108],
    Selfi_Cam: [5, 8, 12, 16, 20],
    Battery_Power: [2500, 3000, 4000, 4500, 5000, 5500, 6000]
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    const data = await response.json();
    setPrice(data.prediction);
  };

  const getLabel = (key) => {
    const labelMap = {
      Brand: "📱 Brand",
      Ratings: "⭐ Rating (out of 5)",
      RAM: "🧠 RAM (GB)",
      ROM: "💾 Storage (GB)",
      Mobile_Size: "📐 Screen Size (inches)",
      Primary_Cam: "📷 Rear Camera (MP)",
      Selfi_Cam: "🤳 Front Camera (MP)",
      Battery_Power: "🔋 Battery (mAh)"
    };
    return labelMap[key] || key;
  };

  return (
    <div className="predictor-wrapper">
      {/* Main Container */}
      <div className="predictor-card">
        {/* Title */}
        <div className="predictor-header">
          <h1 className="predictor-title">📱 Smartphone Price Predictor</h1>
          <p className="predictor-subtitle">
            Select your phone specifications and get an instant price prediction
          </p>
        </div>

        {/* Form Grid - 4 columns */}
        <div className="predictor-grid">
          {Object.keys(form).map((key) => (
            <div key={key} className="predictor-field">
              <label className="predictor-label">{getLabel(key)}</label>
              {key === "Brand" ? (
                <input
                  type="text"
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  placeholder="Enter brand name (e.g., Apple, Samsung)"
                  className="predictor-input"
                />
              ) : key === "Ratings" ? (
                <input
                  type="number"
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  min="1"
                  max="5"
                  step="0.1"
                  placeholder="Enter rating (1-5)"
                  className="predictor-input"
                />
              ) : (
                <select
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  className="predictor-input"
                >
                  <option value="">Select {getLabel(key)}</option>
                  {dropdownOptions[key].length > 0 ? (
                    dropdownOptions[key].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))
                  ) : (
                    <option>Not available yet</option>
                  )}
                </select>
              )}
            </div>
          ))}
        </div>

        {/* Button */}
        <div className="predictor-button-wrap">
          <button onClick={handleSubmit} className="predictor-button">
            🔮 Predict Price
          </button>
        </div>

        {/* Result Display */}
        {price && (
          <div className="predictor-result">
            <p className="predictor-result-title">Estimated Price</p>
            <h2 className="predictor-result-value">💰 ₹ {price}</h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default Predictor;