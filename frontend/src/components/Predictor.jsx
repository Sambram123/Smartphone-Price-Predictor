import { useEffect, useRef, useState } from "react";

/* ── Icon helpers (inline SVG, no external dep) ── */
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
);
const IconCpu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
    <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
    <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
    <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
    <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
  </svg>
);
const IconHardDrive = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/>
  </svg>
);
const IconBattery = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="6" width="18" height="12" rx="2" ry="2"/><line x1="23" y1="13" x2="23" y2="11"/>
  </svg>
);
const IconMonitor = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);
const IconCamera = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);
const IconSparkles = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);
const IconLoader = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
    <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
  </svg>
);
/* ── Brands list ── */
const BRANDS = [
  "Alcatel","Apple","Blacear","Blacerry","Black","BlackZone","Callbar","Detel","Dublin",
  "Easyfone","Ecotel","F-Fook","Forme","GAMMA","Gee","Gfive","Good","Google","Grabo",
  "GreenBerry","Heemax","Hicell","Honor","Huawei","I","ITEL","InFocus","Infinix","Inovu",
  "Intex","Itel","JIVI","Jivi","Jmax","Karbonn","Kechaoda","LG","Lava","Lenovo","MI3",
  "MTR","Mafe","Megus","Meizu","Mi","Micax","Moto","Motorola","Muphone","Mymax","Nexus",
  "Nokia","OPPO","OnePlus","POCO","Peace","Q-Tel","Realme","Redmi","Salora","Samsung",
  "Snexian","Ssky","Tecno","Tork","Trio","Vivo","Wizphone","Yuho","iQOO","tecno",
];

/* ── Slider config ── */
const SLIDERS = [
  { key: "RAM",           label: "RAM",             unit: "GB",   min: 1,    max: 16,   step: 1,    defaultVal: 8,    cls: "slider--ram",     Icon: IconCpu     },
  { key: "ROM",           label: "Storage",         unit: "GB",   min: 16,   max: 512,  step: 16,   defaultVal: 128,  cls: "slider--storage", Icon: IconHardDrive },
  { key: "Battery_Power", label: "Battery Capacity",unit: "mAh",  min: 1000, max: 7000, step: 500,  defaultVal: 4000, cls: "slider--battery", Icon: IconBattery },
  { key: "Mobile_Size",   label: "Screen Size",     unit: '"',    min: 4.5,  max: 7.5,  step: 0.1,  defaultVal: 6.1,  cls: "slider--screen",  Icon: IconMonitor },
  { key: "Primary_Cam",   label: "Camera",          unit: "MP",   min: 2,    max: 200,  step: 1,    defaultVal: 48,   cls: "slider--camera",  Icon: IconCamera  },
];

/* ── Region config ── */
const REGION_CONFIG = {
  India:  { currency: "INR", locale: "en-IN",  rate: 1       },
  USA:    { currency: "USD", locale: "en-US",  rate: 1 / 83  },
  Europe: { currency: "EUR", locale: "de-DE",  rate: 1 / 90  },
  Japan:  { currency: "JPY", locale: "ja-JP",  rate: 1.8     },
};

/* ── Helpers ── */
const pct = (val, min, max) => `${Math.round(((val - min) / (max - min)) * 100)}%`;

function formatRegional(num, region) {
  const cfg = REGION_CONFIG[region] || REGION_CONFIG.India;
  const converted = Math.round(num * cfg.rate);
  try {
    return new Intl.NumberFormat(cfg.locale, {
      style: "currency", currency: cfg.currency, maximumFractionDigits: 0,
    }).format(converted);
  } catch { return String(converted); }
}

function getRegionalNumber(inr, region) {
  const cfg = REGION_CONFIG[region] || REGION_CONFIG.India;
  return Math.round(inr * cfg.rate);
}

export default function Predictor() {
  /* ── Form state ── */
  const initSliders = () =>
    Object.fromEntries(SLIDERS.map((s) => [s.key, s.defaultVal]));

  const [brand, setBrand] = useState("Apple");
  const [sliders, setSliders] = useState(initSliders);
  const [region, setRegion] = useState("India");

  /* ── Result / UI state ── */
  const [price, setPrice] = useState(null);        // raw INR from backend
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [flashDir, setFlashDir] = useState(null);

  /* ── Animated counter ── */
  const [displayNum, setDisplayNum] = useState(null);
  const rafRef = useRef(null);
  const animRef = useRef(null);
  const prevRef = useRef(null);
  const lastPubRef = useRef(null);
  const flashTimerRef = useRef(null);

  /* ── Slider change ── */
  const handleSlider = (key, value) => {
    setSliders((prev) => ({ ...prev, [key]: Number(value) }));
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    setError("");
    setIsLoading(true);
    try {
      const payload = {
        Brand: brand,
        Ratings: 4.0,           // sensible default — not exposed in UI
        RAM: sliders.RAM,
        ROM: sliders.ROM,
        Mobile_Size: sliders.Mobile_Size,
        Primary_Cam: sliders.Primary_Cam,
        Selfi_Cam: 12,          // sensible default — not exposed in UI
        Battery_Power: sliders.Battery_Power,
      };
      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Prediction failed."); return; }
      setPrice(data.prediction);
    } catch {
      setError("Cannot connect to backend. Please ensure the server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Animated counter effect ── */
  useEffect(() => {
    if (price === null) return;
    const target = getRegionalNumber(price, region);

    if (prevRef.current === null || prevRef.current === undefined) {
      prevRef.current = target;
      animRef.current = target;
      lastPubRef.current = target;
      setDisplayNum(target);
      setFlashDir(null);
      return;
    }

    const start = animRef.current ?? prevRef.current;
    if (start === target) { setFlashDir(null); return; }

    const dir = target > start ? "up" : "down";
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const DURATION = 1600;
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const prog = Math.min(1, (now - t0) / DURATION);
      const cur = start + (target - start) * ease(prog);
      const rounded = prog < 1 ? Math.round(cur) : target;
      animRef.current = rounded;
      if (rounded !== lastPubRef.current || prog >= 1) {
        lastPubRef.current = rounded;
        setDisplayNum(rounded);
      }
      if (prog < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = target;
        animRef.current = target;
        if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
        setFlashDir(dir);
        flashTimerRef.current = setTimeout(() => setFlashDir(null), 800);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, [price, region]);

  /* ── Reset display on region change if no price yet ── */
  useEffect(() => {
    if (price !== null) {
      const target = getRegionalNumber(price, region);
      prevRef.current = null;
      animRef.current = null;
      lastPubRef.current = null;
      setDisplayNum(null);
      // re-trigger by touching price state indirectly via a flag
      // actually we just force by directly starting from 0
      const DURATION = 1200;
      const t0 = performance.now();
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const start = 0;
      const tick = (now) => {
        const prog = Math.min(1, (now - t0) / DURATION);
        const cur = start + (target - start) * ease(prog);
        const rounded = prog < 1 ? Math.round(cur) : target;
        setDisplayNum(rounded);
        if (prog < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [region]); // eslint-disable-line react-hooks/exhaustive-deps

  const amountClass = [
    "price-result-amount",
    flashDir === "up"   ? "price-result-amount--flash" : "",
    flashDir === "down" ? "price-result-amount--flash" : "",
  ].join(" ").trim();

  return (
    <div className="predictor-page">
      {/* ── Header ── */}
      <header className="predictor-header">
        <div className="header-icon"><IconPhone /></div>
        <h1 className="predictor-title">Smartphone Price Predictor</h1>
        <p className="predictor-subtitle">
          Get instant AI-powered price predictions based on your device specifications
        </p>
      </header>

      {/* ── Two-panel layout ── */}
      <div className="predictor-layout">

        {/* ── LEFT: Device Specifications ── */}
        <div className="panel-card">
          <div className="panel-heading">
            <span style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <svg className="panel-heading-icon" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1"/>
              </svg>
              <h2>Device Specifications</h2>
            </span>
          </div>

          {/* Brand */}
          <div className="field-group">
            <label className="field-label" htmlFor="brand-select">Brand</label>
            <select
              id="brand-select"
              className="brand-select"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              {BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Sliders */}
          {SLIDERS.map(({ key, label, unit, min, max, step, cls, Icon }) => {
            const val = sliders[key];
            const percentage = pct(val, min, max);
            const displayVal = key === "Mobile_Size"
              ? `${Number(val).toFixed(1)}"`
              : `${val} ${unit}`;
            return (
              <div className="slider-group" key={key}>
                <div className="slider-label-row">
                  <span className="slider-label-icon">
                    <Icon />
                    {label}
                  </span>
                  <span className="slider-value">{displayVal}</span>
                </div>
                <input
                  id={`slider-${key}`}
                  type="range"
                  className={`slider ${cls}`}
                  style={{ "--pct": percentage }}
                  min={min}
                  max={max}
                  step={step}
                  value={val}
                  onChange={(e) => handleSlider(key, e.target.value)}
                  aria-label={label}
                  aria-valuemin={min}
                  aria-valuemax={max}
                  aria-valuenow={val}
                />
              </div>
            );
          })}

          {/* Predict button */}
          <button
            id="predict-btn"
            className={`predict-btn${isLoading ? " loading" : ""}`}
            onClick={handleSubmit}
            disabled={isLoading}
            aria-label="Predict smartphone price"
          >
            {isLoading ? (
              <><IconLoader />&nbsp;Predicting…</>
            ) : (
              <><IconSparkles />Predict Price</>
            )}
          </button>

          {error && (
            <div className="error-banner" role="alert" aria-live="polite">{error}</div>
          )}
        </div>

        {/* ── RIGHT: Predicted Price ── */}
        <div className="right-panel">
          <div className="panel-card price-panel">
            <div className="panel-heading price-panel-heading">
              <h2>Predicted Price</h2>
            </div>

            <div className="price-panel-body">
              {price === null ? (
                /* Placeholder */
                <>
                  <div className="price-placeholder-icon">
                    <IconSparkles />
                  </div>
                  <p className="price-placeholder-text">
                    Configure your device specs and click "Predict Price" to get an
                    instant AI-powered estimate
                  </p>
                </>
              ) : (
                /* Result — layout matches reference: glow card, caption, spec rows */
                <div className="price-result">
                  <div
                    className={[
                      "price-result-glow",
                      flashDir ? "price-result-glow--flash" : "",
                    ].join(" ").trim()}
                  >
                    <span className={amountClass} aria-live="polite" aria-atomic="true">
                      {displayNum !== null
                        ? formatRegional(
                            displayNum / (REGION_CONFIG[region]?.rate || 1),
                            region
                          )
                        : "—"}
                    </span>
                  </div>
                  <p className="price-result-caption">
                    Estimated market price based on specifications
                  </p>

                  <div className="price-spec-list">
                    <div className="price-spec-row">
                      <span className="price-spec-label">Brand</span>
                      <span className="price-spec-value">{brand}</span>
                    </div>
                    <div className="price-spec-row">
                      <span className="price-spec-label">RAM</span>
                      <span className="price-spec-value">{sliders.RAM} GB</span>
                    </div>
                    <div className="price-spec-row">
                      <span className="price-spec-label">Storage</span>
                      <span className="price-spec-value">{sliders.ROM} GB</span>
                    </div>
                    <div className="price-spec-row">
                      <span className="price-spec-label">Battery</span>
                      <span className="price-spec-value">{sliders.Battery_Power} mAh</span>
                    </div>
                  </div>

                  <div className="region-select-wrap">
                    <select
                      id="region-select"
                      className="region-select"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      aria-label="Select region for currency"
                    >
                      <option value="India">🇮🇳 India (INR ₹)</option>
                      <option value="USA">🇺🇸 USA (USD $)</option>
                      <option value="Europe">🇪🇺 Europe (EUR €)</option>
                      <option value="Japan">🇯🇵 Japan (JPY ¥)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}