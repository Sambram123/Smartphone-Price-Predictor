import { useState } from "react";

function Predictor() {
  const numericFields = [
    "Ratings",
    "RAM",
    "ROM",
    "Mobile_Size",
    "Primary_Cam",
    "Selfi_Cam",
    "Battery_Power"
  ];

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
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setError("");
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.Brand.trim()) {
      nextErrors.Brand = "Brand is required.";
    }

    numericFields.forEach((field) => {
      const value = form[field];
      if (value === "" || value === null || value === undefined) {
        nextErrors[field] = `${getLabel(field)} is required.`;
        return;
      }

      const parsed = Number(value);
      if (Number.isNaN(parsed)) {
        nextErrors[field] = `${getLabel(field)} must be a number.`;
      }
    });

    if (!nextErrors.Ratings) {
      const rating = Number(form.Ratings);
      if (rating < 1 || rating > 5) {
        nextErrors.Ratings = "Rating must be between 1 and 5.";
      }
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = () => ({
    ...form,
    Brand: form.Brand.trim(),
    Ratings: Number(form.Ratings),
    RAM: Number(form.RAM),
    ROM: Number(form.ROM),
    Mobile_Size: Number(form.Mobile_Size),
    Primary_Cam: Number(form.Primary_Cam),
    Selfi_Cam: Number(form.Selfi_Cam),
    Battery_Power: Number(form.Battery_Power)
  });

  const handleSubmit = async () => {
    setPrice(null);
    setError("");

    if (!validateForm()) {
      setError("Please fix the highlighted fields and try again.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(buildPayload())
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Prediction failed. Please try again.");
        return;
      }

      setPrice(data.prediction);
    } catch {
      setError("Unable to connect to backend. Please ensure the server is running.");
    } finally {
      setIsLoading(false);
    }
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
              {fieldErrors[key] && (
                <p style={{ color: "#ef4444", marginTop: "6px", fontSize: "0.85rem" }}>
                  {fieldErrors[key]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Button */}
        <div className="predictor-button-wrap">
          <button onClick={handleSubmit} className="predictor-button" disabled={isLoading}>
            {isLoading ? "Predicting..." : "🔮 Predict Price"}
          </button>
        </div>

        {error && (
          <p style={{ color: "#ef4444", textAlign: "center", marginTop: "8px" }}>
            {error}
          </p>
        )}

        {/* Result Display */}
        {price !== null && (
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