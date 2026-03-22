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
    <div style={{
      minHeight: "100vh",
      width: "100%",
      backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      backgroundAttachment: "fixed",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* Main Container */}
      <div style={{
        width: "100%",
        maxWidth: "1100px",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        padding: "50px 40px",
        backdropFilter: "blur(10px)"
      }}>
        {/* Title */}
        <div style={{
          textAlign: "center",
          marginBottom: "40px"
        }}>
          <h1 style={{
            fontSize: "32px",
            color: "#333",
            marginBottom: "10px",
            fontWeight: "700"
          }}>
            📱 Smartphone Price Predictor
          </h1>
          <p style={{
            fontSize: "16px",
            color: "#666",
            marginBottom: 0
          }}>
            Select your phone specifications and get an instant price prediction
          </p>
        </div>

        {/* Form Grid - 4 columns */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "30px",
          marginBottom: "40px"
        }}>
          {Object.keys(form).map((key) => (
            <div key={key} style={{
              display: "flex",
              flexDirection: "column"
            }}>
              <label style={{
                marginBottom: "10px",
                fontWeight: "600",
                fontSize: "15px",
                color: "#334155",
                letterSpacing: "0.5px"
              }}>
                {getLabel(key)}
              </label>
              {key === "Brand" ? (
                <input
                  type="text"
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  placeholder="Enter brand name (e.g., Apple, Samsung)"
                  style={{
                    padding: "12px 15px",
                    borderRadius: "10px",
                    border: "2px solid #e2e8f0",
                    fontSize: "14px",
                    backgroundColor: "#f8fafc",
                    fontWeight: "500",
                    color: "#334155",
                    transition: "all 0.3s ease",
                    outline: "none",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                  }}
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
                  style={{
                    padding: "12px 15px",
                    borderRadius: "10px",
                    border: "2px solid #e2e8f0",
                    fontSize: "14px",
                    backgroundColor: "#f8fafc",
                    fontWeight: "500",
                    color: "#334155",
                    transition: "all 0.3s ease",
                    outline: "none",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                  }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#667eea";
                      e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e2e8f0";
                      e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                    }}
                  />
              ) : (
                <select
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  style={{
                    padding: "12px 15px",
                    borderRadius: "10px",
                    border: "2px solid #e2e8f0",
                    fontSize: "14px",
                    cursor: "pointer",
                    backgroundColor: "#f8fafc",
                    fontWeight: "500",
                    color: "#334155",
                    transition: "all 0.3s ease",
                    outline: "none",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                  }}
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
        <div style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "30px"
        }}>
          <button
            onClick={handleSubmit}
            style={{
              padding: "16px 60px",
              backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "700",
              letterSpacing: "0.5px",
              boxShadow: "0 10px 30px rgba(102, 126, 234, 0.4)",
              transition: "all 0.3s ease",
              textTransform: "uppercase"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 15px 40px rgba(102, 126, 234, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 10px 30px rgba(102, 126, 234, 0.4)";
            }}
          >
            🔮 Predict Price
          </button>
        </div>

        {/* Result Display */}
        {price && (
          <div style={{
            backgroundColor: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
            backgroundImage: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
            padding: "30px",
            borderRadius: "15px",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(132, 250, 176, 0.3)"
          }}>
            <p style={{
              fontSize: "14px",
              color: "#22c55e",
              fontWeight: "600",
              marginBottom: "10px",
              textTransform: "uppercase",
              letterSpacing: "1px"
            }}>
              Estimated Price
            </p>
            <h2 style={{
              fontSize: "48px",
              fontWeight: "800",
              color: "#065f46",
              margin: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px"
            }}>
              💰 ₹ {price}
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default Predictor;