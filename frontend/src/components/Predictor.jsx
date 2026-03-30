import { useEffect, useRef, useState } from "react";

function Predictor() {
  const brands = [
    "Alcatel",
    "Apple",
    "Blacear",
    "Blacerry",
    "Black",
    "BlackZone",
    "Callbar",
    "Detel",
    "Dublin",
    "Easyfone",
    "Ecotel",
    "F-Fook",
    "Forme",
    "GAMMA",
    "Gee",
    "Gfive",
    "Good",
    "Google",
    "Grabo",
    "GreenBerry",
    "Heemax",
    "Hicell",
    "Honor",
    "Huawei",
    "I",
    "ITEL",
    "InFocus",
    "Infinix",
    "Inovu",
    "Intex",
    "Itel",
    "JIVI",
    "Jivi",
    "Jmax",
    "Karbonn",
    "Kechaoda",
    "LG",
    "Lava",
    "Lenovo",
    "MI3",
    "MTR",
    "Mafe",
    "Megus",
    "Meizu",
    "Mi",
    "Micax",
    "Moto",
    "Motorola",
    "Muphone",
    "Mymax",
    "Nexus",
    "Nokia",
    "OPPO",
    "OnePlus",
    "POCO",
    "Peace",
    "Q-Tel",
    "Realme",
    "Redmi",
    "Salora",
    "Samsung",
    "Snexian",
    "Ssky",
    "Tecno",
    "Tork",
    "Trio",
    "Vivo",
    "Wizphone",
    "Yuho",
    "iQOO",
    "tecno"
  ];

  const normalizeBrand = (value) => {
    const raw = String(value ?? "").trim();
    if (!raw) return "";
    const lower = raw.toLowerCase();
    const canonical = brands.find((b) => b.toLowerCase() === lower);
    return canonical || raw;
  };

  const isKnownBrand = (value) => {
    const raw = String(value ?? "").trim();
    if (!raw) return false;
    const lower = raw.toLowerCase();
    return brands.some((b) => b.toLowerCase() === lower);
  };

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
  const [region, setRegion] = useState("India");
  const [animatedRegionalNumber, setAnimatedRegionalNumber] = useState(null);
  const [flashDirection, setFlashDirection] = useState(null);

  const prevDisplayedRef = useRef(null); // tracks last fully-displayed numeric value
  const rafRef = useRef(null);
  const animatedNumberRef = useRef(null); // tracks current animation numeric value

  // Dropdown options with real-world values
  const dropdownOptions = {
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
    const nextValue = name === "Brand" ? normalizeBrand(value) : value;
    setForm({ ...form, [name]: nextValue });
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setError("");
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.Brand.trim()) {
      nextErrors.Brand = "Brand is required.";
    } else if (!isKnownBrand(form.Brand)) {
      nextErrors.Brand = "Please select a brand from the list.";
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
    Brand: normalizeBrand(form.Brand),
    Ratings: Number(form.Ratings),
    RAM: Number(form.RAM),
    ROM: Number(form.ROM),
    Mobile_Size: Number(form.Mobile_Size),
    Primary_Cam: Number(form.Primary_Cam),
    Selfi_Cam: Number(form.Selfi_Cam),
    Battery_Power: Number(form.Battery_Power)
  });

  const formatINR = (value) => {
    try {
      return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
    } catch {
      return String(value);
    }
  };

  const regionConfig = {
    India: { currency: "INR", locale: "en-IN", rate: 1 },
    USA: { currency: "USD", locale: "en-US", rate: 1 / 83 },
    Europe: { currency: "EUR", locale: "de-DE", rate: 1 / 90 },
    Japan: { currency: "JPY", locale: "ja-JP", rate: 1.8 }
  };

  const formatByRegion = (inrValue, selectedRegion) => {
    const cfg = regionConfig[selectedRegion] || regionConfig.India;
    const converted = Math.round(Number(inrValue) * cfg.rate);
    try {
      return new Intl.NumberFormat(cfg.locale, {
        style: "currency",
        currency: cfg.currency,
        maximumFractionDigits: 0
      }).format(converted);
    } catch {
      return String(converted);
    }
  };

  const getRegionalNumber = (inrValue, selectedRegion) => {
    const cfg = regionConfig[selectedRegion] || regionConfig.India;
    return Math.round(Number(inrValue) * cfg.rate);
  };

  const formatNumberByRegion = (regionalNumber, selectedRegion) => {
    const cfg = regionConfig[selectedRegion] || regionConfig.India;
    try {
      return new Intl.NumberFormat(cfg.locale, {
        style: "currency",
        currency: cfg.currency,
        maximumFractionDigits: 0
      }).format(regionalNumber);
    } catch {
      return String(regionalNumber);
    }
  };

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

  const formattedPrice = price === null ? null : formatINR(price);
  const formattedRegionalPrice = price === null ? null : formatByRegion(price, region);

  const targetRegionalNumber = price === null ? null : getRegionalNumber(price, region);
  const numberToDisplay = animatedRegionalNumber ?? targetRegionalNumber;

  useEffect(() => {
    // Avoid animating until we have a prediction.
    if (price === null || price === undefined) return;
    if (targetRegionalNumber === null || Number.isNaN(targetRegionalNumber)) return;

    const start = animatedNumberRef.current ?? prevDisplayedRef.current;
    const target = targetRegionalNumber;

    // Initial render: set immediately (no animation from 0).
    if (start === null || start === undefined) {
      prevDisplayedRef.current = target;
      animatedNumberRef.current = target;
      setAnimatedRegionalNumber(target);
      setFlashDirection(null);
      return;
    }

    // If value hasn't changed, don't restart animation.
    if (start === target) {
      setFlashDirection(null);
      return;
    }

    const direction = target > start ? "up" : "down";
    // setFlashDirection(direction);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const durationMs = 1800;
    const startTime = performance.now();

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = easeOutCubic(progress);

      const current = start + (target - start) * eased;
      const rounded = Math.round(current);

      animatedNumberRef.current = rounded;
      setAnimatedRegionalNumber(rounded);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevDisplayedRef.current = target;
        animatedNumberRef.current = target;
      
        // ✅ Apply color AFTER animation finishes
        setFlashDirection(direction);
      
        // ✅ Remove color after short delay
        setTimeout(() => {
          setFlashDirection(null);
        }, 800);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    // const flashTimeout = window.setTimeout(() => {
    //   setFlashDirection(null);
    // }, 450);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // window.clearTimeout(flashTimeout);
      setFlashDirection(null);
    };
  }, [price, region, targetRegionalNumber]);

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
          <datalist id="brand-options">
            {brands.map((brand) => (
              <option key={brand} value={brand} />
            ))}
          </datalist>
          {Object.keys(form).map((key) => (
            <div key={key} className="predictor-field">
              <label className="predictor-label">{getLabel(key)}</label>
              {key === "Brand" ? (
                <input
                  type="text"
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  list="brand-options"
                  placeholder="Type or select a brand (e.g., Apple, Samsung)"
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
                <p className="predictor-field-error">{fieldErrors[key]}</p>
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
          <div className="predictor-error" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        {/* Result Display */}
        {price !== null && (
          <div className="predictor-result">
            <div className="predictor-result-top">
              <h1 className="predictor-result-title">Estimated Price</h1>
              <p className="predictor-result-subtitle">Based on the specifications you selected</p>
            </div>
            <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    gap: "12px",
    flexWrap: "wrap"
  }}
>
              <select
                className="predictor-input"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                aria-label="Select region for pricing"
                style={{ maxWidth: "320px" }}
              >
                <option value="India">India (INR ₹)</option>
                <option value="USA">USA (USD $)</option>
                <option value="Europe">Europe (EUR €)</option>
                <option value="Japan">Japan (YEN ¥)</option>
              </select>
            </div>
            <div className="predictor-result-value" aria-live="polite">
              <span
                className={[
                  "predictor-result-amount",
                  flashDirection === "up"
                    ? "predictor-result-amount--up"
                    : flashDirection === "down"
                      ? "predictor-result-amount--down"
                      : ""
                ].join(" ")}
              >
                {numberToDisplay === null ? "" : formatNumberByRegion(numberToDisplay, region)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Predictor;