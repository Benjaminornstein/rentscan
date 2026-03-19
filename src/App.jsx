import { useState, useEffect, useRef } from "react";

// ===== DATA =====
const DUBAI_FEES = { salik: { perCrossing: 5, avgPerDay: 3.2, adminFee: 2 }, fuel: { avgTankCost: 120 }, deposit: { economy: 1500, suv: 3000, luxury: 5000 } };

const RENTAL_COMPANIES = [
  { id: 1, name: "Hertz UAE", logo: "🟡", rating: 4.3, reviews: 2890, verified: true, transparentPricing: true, location: "DXB T1/T3, Downtown, Marina, JBR", delivery: true, deposit: 2000, cars: [
    { type: "Economy", model: "Nissan Sunny 2025", perDay: 70, insurance: "Full CDW", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "SUV", model: "Toyota RAV4 2025", perDay: 180, insurance: "Full CDW", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
    { type: "Luxury", model: "Volvo S90 2025", perDay: 350, insurance: "Full CDW + SCDW available", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" }
  ], pros: ["12 branches in Dubai", "Airport counters T1 & T3", "SCDW & PAI available"], cons: ["Deposit hold up to 30 days", "SCDW costs extra"], featured: true },
  { id: 2, name: "Europcar Dubai", logo: "🟢", rating: 4.1, reviews: 1950, verified: true, transparentPricing: true, location: "DXB T1/T2/T3, Al Quoz, 14+ branches", delivery: true, deposit: 2000, cars: [
    { type: "Economy", model: "Nissan Sunny 2024", perDay: 70, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "SUV", model: "Toyota Prado 2025", perDay: 200, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
    { type: "Luxury", model: "Audi A6 2025", perDay: 320, insurance: "CDW included", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" }
  ], pros: ["Since 1976 in Dubai", "14+ branches", "All airport terminals"], cons: ["Salik billed separately", "Extra charges for late return"], featured: true },
  { id: 3, name: "Sixt Dubai", logo: "🟠", rating: 4.4, reviews: 1340, verified: true, transparentPricing: true, location: "DXB Airport, Sheikh Zayed Rd, Marina", delivery: true, deposit: 2500, cars: [
    { type: "Economy", model: "Toyota Yaris 2025", perDay: 85, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "SUV", model: "Nissan X-Trail 2025", perDay: 175, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
    { type: "Luxury", model: "BMW 5 Series 2025", perDay: 380, insurance: "CDW + Theft Protection", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" }
  ], pros: ["Premium fleet quality", "App-based booking", "Good luxury selection"], cons: ["Higher base rates", "Young driver fee applies"], featured: false },
  { id: 4, name: "Quick Drive", logo: "⚡", rating: 4.5, reviews: 1870, verified: true, transparentPricing: true, location: "Deira, Business Bay, JLT, DXB Airport", delivery: true, deposit: 1500, cars: [
    { type: "Economy", model: "Kia Picanto 2025", perDay: 65, insurance: "Full CDW", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: false, airportFee: 30, img: "🚗" },
    { type: "SUV", model: "Hyundai Tucson 2025", perDay: 160, insurance: "Full CDW", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: false, airportFee: 30, img: "🚙" },
    { type: "Luxury", model: "Mercedes C-Class 2024", perDay: 300, insurance: "Full CDW", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" }
  ], pros: ["Transparent pricing", "Unlimited mileage on economy/SUV", "Free delivery in Dubai"], cons: ["AED 30 airport surcharge on economy", "Local brand"], featured: false },
  { id: 5, name: "Saadat Rent", logo: "🔵", rating: 4.3, reviews: 980, verified: true, transparentPricing: true, location: "Al Barsha, JVC, Dubai Airport", delivery: true, deposit: 1000, cars: [
    { type: "Economy", model: "Toyota Yaris 2025", perDay: 73, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "SUV", model: "Toyota Rush 2025", perDay: 140, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" }
  ], pros: ["Straightforward pricing", "Low deposit AED 1,000", "Free delivery"], cons: ["Smaller luxury fleet", "Newer company"], featured: false },
  { id: 6, name: "Absolute Rent a Car", logo: "🔴", rating: 4.0, reviews: 2450, verified: true, transparentPricing: false, location: "Deira, Bur Dubai, DXB Airport", delivery: true, deposit: 2000, cars: [
    { type: "Economy", model: "Nissan Sunny 2024", perDay: 55, insurance: "Basic CDW", mileage: "200km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 100, img: "🚗" },
    { type: "SUV", model: "Mitsubishi Pajero 2024", perDay: 150, insurance: "Basic CDW", mileage: "200km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 100, img: "🚙" }
  ], pros: ["Competitive base rates", "Cash payment accepted", "Delivery across UAE"], cons: ["Basic CDW — AED 1,500 excess applies", "AED 100 airport delivery fee", "200km/day limit"], featured: false },
  { id: 7, name: "Taite Luxury", logo: "💎", rating: 4.9, reviews: 410, verified: true, transparentPricing: true, location: "Palm Jumeirah, DIFC, Downtown", delivery: true, deposit: 0, cars: [
    { type: "SUV", model: "Range Rover Sport 2025", perDay: 600, insurance: "Full CDW + Zero Excess", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: true, airportFee: 0, img: "🚙" },
    { type: "Luxury", model: "Mercedes G63 2025", perDay: 1200, insurance: "Full CDW + Zero Excess", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: true, airportFee: 0, img: "🏎️" }
  ], pros: ["Zero deposit", "All-inclusive pricing", "Salik included", "WhatsApp booking"], cons: ["Luxury/supercar only", "Premium prices"], featured: false },
  { id: 8, name: "Udrive", logo: "🚙", rating: 3.2, reviews: 4850, verified: true, transparentPricing: false, location: "App-based — Dubai, Abu Dhabi, Sharjah, Ajman", delivery: false, deposit: 0, cars: [
    { type: "Economy", model: "Kia Pegas 2025", perDay: 136, insurance: "Comprehensive incl.", mileage: "150km/day", fuel: "Not included (Basics)", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "Economy", model: "Toyota Yaris 2025", perDay: 139, insurance: "Comprehensive incl.", mileage: "150km/day", fuel: "Not included (Basics)", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "SUV", model: "Suzuki Jimny 2025", perDay: 199, insurance: "Comprehensive incl.", mileage: "150km/day", fuel: "Not included (Basics)", salikIncl: false, airportFee: 0, img: "🚙" }
  ], pros: ["No deposit required", "App-based — find car near you", "Pay per minute option", "Available in 4 emirates"], cons: ["150km/day limit", "AED 2.10/km excess charge", "Fuel separate on Basic plan", "Damage waiver optional"], featured: false },
];

const PHOTO_GUIDES = [
  { id: "front", label: "Front", icon: "⬆️", tip: "Full front with license plate visible" },
  { id: "back", label: "Rear", icon: "⬇️", tip: "Full rear with license plate visible" },
  { id: "left", label: "Left side", icon: "⬅️", tip: "Full left side from 3 meters away" },
  { id: "right", label: "Right side", icon: "➡️", tip: "Full right side from 3 meters away" },
  { id: "fl_corner", label: "Front-left", icon: "↖️", tip: "Bumper, headlight, wheel close-up" },
  { id: "fr_corner", label: "Front-right", icon: "↗️", tip: "Bumper, headlight, wheel close-up" },
  { id: "rl_corner", label: "Rear-left", icon: "↙️", tip: "Bumper, taillight, wheel close-up" },
  { id: "rr_corner", label: "Rear-right", icon: "↘️", tip: "Bumper, taillight, wheel close-up" },
  { id: "dashboard", label: "Dashboard", icon: "🎛️", tip: "Warning lights visible, engine running" },
  { id: "mileage", label: "Odometer", icon: "🔢", tip: "Close-up of km/miles reading" },
  { id: "fuel", label: "Fuel level", icon: "⛽", tip: "Close-up of fuel gauge" },
  { id: "interior", label: "Interior", icon: "💺", tip: "Seats, floor, ceiling — any stains" },
  { id: "trunk", label: "Trunk", icon: "🧳", tip: "Open trunk, spare tire visible" },
  { id: "damage", label: "Existing damage", icon: "📸", tip: "Close-up of any scratch, dent or mark" },
];

const DISPUTE_STEPS = {
  damage: {
    title: "Unfair damage charge",
    steps: [
      "Gather your pickup and return photos from your RentScan dossier with timestamps",
      "Compare the damage they claim vs your photos — is the damage visible in your return photos?",
      "Send a formal email to the rental company with your timestamped photos attached, requesting evidence of the damage (their photos, repair invoice)",
      "If they cannot provide dated evidence, reply stating you dispute the charge and request a full refund of the deducted amount",
      "If they refuse: file a complaint via the Dubai DED Consumer Protection website (consumerrights.ae) or call 600 54 5555",
      "For credit card charges: contact your bank and request a chargeback, attach your RentScan dossier as evidence",
      "Keep all communication in writing (email or WhatsApp) — never agree to anything verbally only"
    ]
  },
  deposit: {
    title: "Deposit not returned",
    steps: [
      "Check your contract for the deposit return timeline (typically 21-30 days after return)",
      "If the timeline has passed, send a formal email requesting the deposit status with your contract reference number",
      "Include: your name, rental dates, car details, deposit amount, and bank statement showing the original charge",
      "Give them 7 days to respond. If no response, send a follow-up stating you will file a complaint",
      "File a complaint with DED Consumer Protection (consumerrights.ae) — include your contract and bank statement",
      "For credit card holds: contact your bank after 30 days to request release of the held funds",
      "Under UAE Federal Law No. 15 of 2020, rental agencies must clearly state deposit refund conditions"
    ]
  },
  overcharge: {
    title: "Unexpected charges on my bill",
    steps: [
      "Request an itemized final invoice from the rental company (email or WhatsApp)",
      "Cross-reference each charge with your original contract terms",
      "For Salik charges: verify on the RTA website/app (darb.ae) — check the actual crossings against what they billed",
      "For traffic fines: verify on Dubai Police website/app — you can pay fines directly and avoid the rental company's admin fee",
      "For fuel charges: compare your return fuel photo with their claimed fuel level",
      "Send a dispute email listing each charge you contest, with supporting evidence from your RentScan dossier",
      "If unresolved: file with DED Consumer Protection and include all documentation"
    ]
  },
  accident: {
    title: "Accident or breakdown",
    steps: [
      "Ensure everyone is safe — call 999 for emergencies or 901 for non-emergency police",
      "Do NOT move the vehicle until police arrive (required by UAE law)",
      "Take photos of all vehicles involved, the location, and any damage",
      "Get the police report number — you need this for insurance claims",
      "Contact the rental company immediately and report the incident",
      "A green police report means you are NOT at fault — you should not pay anything beyond the insurance excess",
      "A red police report means you ARE at fault — you pay the excess amount as per your insurance terms",
      "Document everything in your RentScan dossier for your records"
    ]
  }
};

// ===== UTILITY FUNCTIONS =====
function calcTrueTotal(car, company, days) {
  let total = car.perDay * days;
  if (car.airportFee) total += car.airportFee;
  if (!car.salikIncl) total += Math.round(days * 3.2 * 7);
  if (car.insurance.includes("Basic")) total += (car.type === "Luxury" ? 60 : car.type === "SUV" ? 35 : 25) * days;
  if (car.fuel.includes("Not included")) total += days * 25;
  const kmMatch = car.mileage.match(/(\d+)/);
  if (kmMatch) { const km = parseInt(kmMatch[1]); if (km <= 150) total += days * 20; else if (km <= 200) total += days * 15; else if (km <= 250) total += days * 8; }
  return Math.round(total);
}

function analyzeContract(text) {
  const t = text.toLowerCase();
  const costs = [], warnings = [];
  let dailyRate = 0, days = 7, carType = "economy";
  const rateMatch = text.match(/(\d{2,4})\s*(?:aed|AED|dhs|DHS)?\s*(?:\/|per)\s*day/i) || text.match(/(?:aed|AED|dhs|DHS)\s*(\d{2,4})\s*(?:\/|per)\s*day/i);
  dailyRate = rateMatch ? parseInt(rateMatch[1]) : 150;
  const daysMatch = text.match(/(\d+)\s*(?:days?|nights?)/i);
  if (daysMatch) days = parseInt(daysMatch[1]);
  if (t.match(/suv|fortuner|x5|patrol|tucson|rav4/)) carType = "suv";
  if (t.match(/luxury|bmw|mercedes|porsche|bentley|audi/)) carType = "luxury";
  const base = dailyRate * days;
  costs.push({ label: "Base rental", amount: base, type: "base", detail: `${dailyRate} AED × ${days} days` });
  costs.push({ label: "Salik tolls (est.)", amount: Math.round(days * 3.2 * 7), type: "hidden", detail: "~3.2 crossings/day × 7 AED" });
  if (!t.includes("full cover") && !t.includes("zero excess")) {
    const ins = carType === "luxury" ? 60 * days : carType === "suv" ? 35 * days : 25 * days;
    costs.push({ label: "Insurance upgrade", amount: ins, type: "warning", detail: "Basic CDW included — full cover available for extra" });
    warnings.push("ℹ️ Basic insurance included — excess of AED 2,000-5,000 applies without upgrade");
  }
  costs.push({ label: "Fuel cost estimate", amount: t.includes("full") ? 60 : 120, type: "risk", detail: t.includes("full") ? "Refuel before return to avoid surcharge" : "Fuel policy not specified — confirm with company" });
  if (t.match(/airport|dxb|pickup/)) costs.push({ label: "Airport surcharge", amount: 50, type: "hidden", detail: "Airport location fee" });
  if (t.match(/under 25|young/)) costs.push({ label: "Young driver fee", amount: 30 * days, type: "hidden", detail: "30 AED/day" });
  const kmMatch = text.match(/(\d{2,3})\s*km/i);
  if (kmMatch && parseInt(kmMatch[1]) < 300) { costs.push({ label: "Mileage risk", amount: days * 12, type: "risk", detail: `${kmMatch[1]}km/day limit` }); warnings.push(`ℹ️ Mileage limit: ${kmMatch[1]}km/day — Dubai to Abu Dhabi is ~280km roundtrip`); }
  costs.push({ label: "Late return risk", amount: dailyRate, type: "risk", detail: "1 hour late = full extra day" });
  costs.push({ label: "Fine processing", amount: 75, type: "risk", detail: "Per traffic fine" });
  const dep = DUBAI_FEES.deposit[carType];
  warnings.push(`💳 Refundable deposit of AED ${dep.toLocaleString()} — typically released within 21 days`);
  warnings.push("🚿 Cleaning fee of AED 150-500 may apply if car is returned in poor condition");
  return { costs, warnings, grandTotal: costs.reduce((s, c) => s + c.amount, 0), totalBase: base, totalHidden: costs.filter(c => c.type === "hidden").reduce((s, c) => s + c.amount, 0), totalRisk: costs.filter(c => c.type === "risk").reduce((s, c) => s + c.amount, 0), totalWarning: costs.filter(c => c.type === "warning").reduce((s, c) => s + c.amount, 0), dailyRate, days, carType, depositAmount: dep };
}

function AnimN({ value }) { const [d, setD] = useState(0); useEffect(() => { let s = 0; const step = value / 50; const t = setInterval(() => { s += step; if (s >= value) { setD(value); clearInterval(t); } else setD(Math.round(s)); }, 16); return () => clearInterval(t); }, [value]); return <span>{d.toLocaleString()}</span>; }

const TC = { base: { b: "#4caf50", l: "Base" }, hidden: { b: "#ff9800", l: "Extra" }, risk: { b: "#e91e63", l: "Possible" }, warning: { b: "#ffc107", l: "Optional" } };
const tag = (color) => ({ display: "inline-block", background: `${color}18`, color, border: `1px solid ${color}40`, borderRadius: "6px", padding: "2px 8px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" });

// ===== MAIN APP =====
export default function App() {
  const [tab, setTab] = useState("scan");
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [leads, setLeads] = useState({});
  const [carF, setCarF] = useState("All");
  const [sort, setSort] = useState("price");
  const [cDays, setCDays] = useState(7);
  const [expanded, setExpanded] = useState(null);
  const fRef = useRef();

  // My Rental state
  const [rental, setRental] = useState({ company: "", car: "", plateNumber: "", startDate: "", endDate: "", insuranceType: "", excess: "", mileageLimit: "", fuelPolicy: "", deposit: "", notes: "" });
  const [pickupPhotos, setPickupPhotos] = useState([]);
  const [returnPhotos, setReturnPhotos] = useState([]);
  const [contractPhotos, setContractPhotos] = useState([]);
  const [disputeType, setDisputeType] = useState(null);
  const [disputeNotes, setDisputeNotes] = useState("");

  const doScan = () => { if (!text.trim()) return; setBusy(true); setTimeout(() => { setResult(analyzeContract(text)); setBusy(false); }, 2000); };
  const doFile = (e) => { e.preventDefault(); const f = e.dataTransfer?.files?.[0] || e.target?.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setText(ev.target.result); r.readAsText(f); } };
  const doLead = (n) => setLeads(p => ({ ...p, [n]: true }));
  const reset = () => { setResult(null); setText(""); };

  const pg = { minHeight: "100vh", background: "linear-gradient(145deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#fff" };
  const wrap = { maxWidth: "640px", margin: "0 auto", padding: "24px 16px", paddingBottom: "80px" };
  const card = { background: "rgba(255,255,255,0.03)", border: "1px solid #1e2235", borderRadius: "14px", padding: "20px", marginBottom: "12px" };
  const btn = { background: "linear-gradient(135deg, #FF6B35, #FF9F1C)", color: "#fff", border: "none", borderRadius: "10px", padding: "12px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer" };
  const mut = { color: "#5a6478", fontSize: "12px" };
  const inputStyle = { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid #1e2235", borderRadius: "8px", padding: "10px 12px", color: "#e0e0e0", fontSize: "13px", fontFamily: "inherit", outline: "none", boxSizing: "border-box" };

  // ===== BOTTOM NAV =====
  const BottomNav = () => (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(10,10,10,0.95)", backdropFilter: "blur(10px)", borderTop: "1px solid #1e2235", display: "flex", justifyContent: "center", padding: "8px 0", zIndex: 100 }}>
      <div style={{ display: "flex", gap: "4px", maxWidth: "640px", width: "100%", justifyContent: "space-around", padding: "0 16px" }}>
        {[["scan", "🔍", "Scan"], ["compare", "📊", "Compare"], ["rental", "📋", "My Rental"]].map(([k, icon, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", padding: "4px 16px", borderRadius: "8px" }}>
            <span style={{ fontSize: "20px" }}>{icon}</span>
            <span style={{ fontSize: "10px", fontWeight: 600, color: tab === k ? "#FF9F1C" : "#5a6478" }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const TopBar = () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #1e2235" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "24px" }}>🔍</span>
        <span style={{ fontSize: "20px", fontWeight: 800, background: "linear-gradient(135deg, #FF6B35, #FF9F1C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>RentScan</span>
      </div>
    </div>
  );

  // ===== PHOTO HANDLER =====
  const handlePhoto = (setPhotos) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.multiple = true;
    input.onchange = (e) => {
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setPhotos(prev => [...prev, {
            id: Date.now() + Math.random(),
            data: ev.target.result,
            timestamp: new Date().toLocaleString("en-AE", { timeZone: "Asia/Dubai", dateStyle: "medium", timeStyle: "medium" }),
          }]);
        };
        reader.readAsDataURL(file);
      });
    };
    input.click();
  };

  const PhotoSection = ({ title, icon, photos, setPhotos, guides }) => {
    const progress = photos.length;
    return (
      <div style={{ ...card, padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div><span style={{ fontSize: "16px" }}>{icon} </span><span style={{ fontSize: "15px", fontWeight: 700 }}>{title}</span></div>
          <span style={{ ...mut, fontSize: "11px" }}>{progress} photos</span>
        </div>

        {progress > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginBottom: "12px" }}>
            {photos.map(p => (
              <div key={p.id} style={{ position: "relative", borderRadius: "8px", overflow: "hidden", aspectRatio: "1" }}>
                <img src={p.data} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.7)", padding: "2px 4px", fontSize: "8px", color: "#aaa" }}>{p.timestamp}</div>
                <button onClick={() => setPhotos(prev => prev.filter(x => x.id !== p.id))} style={{ position: "absolute", top: "2px", right: "2px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: "18px", height: "18px", fontSize: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>
            ))}
          </div>
        )}

        {guides && (
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "11px", color: "#5a6478", marginBottom: "8px" }}>Recommended shots:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {PHOTO_GUIDES.map(g => (
                <span key={g.id} style={{ fontSize: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid #1e2235", borderRadius: "6px", padding: "3px 8px", color: "#8892a4" }}>
                  {g.icon} {g.label}
                </span>
              ))}
            </div>
          </div>
        )}

        <button onClick={() => handlePhoto(setPhotos)} style={{ ...btn, width: "100%", padding: "12px", fontSize: "13px" }}>
          📸 {progress === 0 ? "Take Photos" : "Add More Photos"}
        </button>
      </div>
    );
  };

  // ===== SCAN TAB =====
  const ScanView = () => !result ? (
    <>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Know the <span style={{ color: "#FF6B35" }}>full cost</span> before you book</h2>
        <p style={mut}>Paste your car rental quote. We calculate the estimated total cost.</p>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "28px", marginBottom: "24px" }}>
        {[["3,291", "Scans"], ["AED 340", "Avg saved"], ["8", "Companies"]].map(([v, l]) => (
          <div key={l} style={{ textAlign: "center" }}><div style={{ fontSize: "18px", fontWeight: 700, color: "#FF9F1C" }}>{v}</div><div style={{ fontSize: "10px", color: "#5a6478", textTransform: "uppercase", letterSpacing: "1px" }}>{l}</div></div>
        ))}
      </div>
      <div onDragOver={e => e.preventDefault()} onDrop={doFile} onClick={() => fRef.current?.click()} style={{ border: "2px dashed #2a2f3e", borderRadius: "14px", padding: "20px", textAlign: "center", cursor: "pointer", background: "rgba(255,255,255,0.02)", marginBottom: "12px" }}>
        <input ref={fRef} type="file" onChange={doFile} style={{ display: "none" }} /><div style={{ fontSize: "20px" }}>📄</div><div style={{ ...mut, marginTop: "4px" }}>Drop contract or tap to upload</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "12px 0" }}><div style={{ flex: 1, height: "1px", background: "#1e2235" }} /><span style={{ ...mut, fontSize: "10px", textTransform: "uppercase", letterSpacing: "2px" }}>or paste</span><div style={{ flex: 1, height: "1px", background: "#1e2235" }} /></div>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder={'Paste your rental quote here...\n\nExample: "Toyota Corolla, AED 150/day, 7 days, basic CDW insurance, 250km/day limit, full-to-full fuel policy, airport pickup DXB"'} style={{ ...inputStyle, minHeight: "120px", resize: "vertical", lineHeight: 1.5 }} />
      <button onClick={doScan} disabled={!text.trim() || busy} style={{ ...btn, width: "100%", marginTop: "16px", padding: "14px", fontSize: "15px", opacity: text.trim() ? 1 : 0.4 }}>{busy ? "🔍 Scanning..." : "Scan My Contract"}</button>
    </>
  ) : (
    <>
      <button onClick={reset} style={{ background: "none", border: "1px solid #2a2f3e", color: "#8892a4", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontSize: "13px" }}>← New Scan</button>
      <div style={{ background: "linear-gradient(135deg, rgba(255,107,53,0.12), rgba(233,30,99,0.08))", border: "1px solid rgba(255,107,53,0.25)", borderRadius: "16px", padding: "24px", textAlign: "center", margin: "16px 0 20px" }}>
        <div style={{ fontSize: "11px", color: "#FF9F1C", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "6px" }}>Estimated total cost</div>
        <div style={{ fontSize: "40px", fontWeight: 800, letterSpacing: "-2px" }}>AED <AnimN value={result.grandTotal} /></div>
        <div style={{ fontSize: "13px", color: "#8892a4", marginTop: "4px" }}>Base rate: AED {result.totalBase.toLocaleString()} · <span style={{ color: "#ff9800" }}>+{Math.round(((result.grandTotal - result.totalBase) / result.totalBase) * 100)}% additional costs</span></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
        {[{ l: "Additional fees", a: result.totalHidden, c: "#ff9800" }, { l: "Possible costs", a: result.totalRisk, c: "#e91e63" }, { l: "Optional upgrades", a: result.totalWarning, c: "#ffc107" }, { l: "Deposit (refundable)", a: result.depositAmount, c: "#00b0ff" }].map(i => (
          <div key={i.l} style={{ ...card, borderLeft: `3px solid ${i.c}`, padding: "14px" }}><div style={{ fontSize: "10px", color: "#5a6478", textTransform: "uppercase", letterSpacing: "1px" }}>{i.l}</div><div style={{ fontSize: "18px", fontWeight: 700, color: i.c, marginTop: "2px" }}>AED {i.a.toLocaleString()}</div></div>
        ))}
      </div>
      <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>💰 Breakdown</h3>
      {result.costs.map((c, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", marginBottom: "4px", borderLeft: `3px solid ${TC[c.type].b}` }}><div><div style={{ fontSize: "13px", fontWeight: 600 }}>{c.label}</div><div style={{ fontSize: "10px", color: "#5a6478" }}>{c.detail}</div></div><div style={{ textAlign: "right" }}><div style={{ fontSize: "14px", fontWeight: 700, color: TC[c.type].b }}>AED {c.amount.toLocaleString()}</div></div></div>))}
      <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "20px 0 10px" }}>ℹ️ Good to Know</h3>
      <div style={{ background: "rgba(255,152,0,0.05)", border: "1px solid rgba(255,152,0,0.12)", borderRadius: "12px", padding: "14px" }}>{result.warnings.map((w, i) => <div key={i} style={{ fontSize: "12px", color: "#ccc", padding: "5px 0", borderBottom: i < result.warnings.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", lineHeight: 1.5 }}>{w}</div>)}</div>
      <div style={{ textAlign: "center", margin: "28px 0" }}><button onClick={() => setTab("compare")} style={{ ...btn, padding: "14px 32px", fontSize: "15px" }}>📊 Compare Other Options</button><p style={{ ...mut, marginTop: "10px" }}>See estimated total costs across Dubai rental companies</p></div>
    </>
  );

  // ===== COMPARE TAB =====
  const CompareView = () => {
    const getList = () => {
      let list = RENTAL_COMPANIES.map(co => {
        const cars = carF === "All" ? co.cars : co.cars.filter(c => c.type === carF);
        if (!cars.length) return null;
        const cheap = cars.reduce((a, b) => a.perDay < b.perDay ? a : b);
        return { ...co, matchingCars: cars, cheapest: cheap, trueTotal: calcTrueTotal(cheap, co, cDays) };
      }).filter(Boolean);
      if (sort === "price") list.sort((a, b) => a.trueTotal - b.trueTotal);
      else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
      else list.sort((a, b) => (b.transparentPricing ? 1 : 0) - (a.transparentPricing ? 1 : 0));
      return list;
    };
    const list = getList();
    const FB = ({ active, onClick, children }) => (<button onClick={onClick} style={{ background: active ? "linear-gradient(135deg, #FF6B35, #FF9F1C)" : "rgba(255,255,255,0.04)", color: active ? "#fff" : "#8892a4", border: active ? "none" : "1px solid #1e2235", borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>{children}</button>);
    const SB = ({ active, onClick, children }) => (<button onClick={onClick} style={{ background: active ? "rgba(255,107,53,0.15)" : "rgba(255,255,255,0.04)", color: active ? "#FF9F1C" : "#5a6478", border: active ? "1px solid rgba(255,107,53,0.3)" : "1px solid #1e2235", borderRadius: "8px", padding: "6px 12px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>{children}</button>);
    return (
      <>
        <div style={{ textAlign: "center", marginBottom: "24px" }}><h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "6px" }}>Compare <span style={{ color: "#FF6B35" }}>total costs</span></h2><p style={mut}>Estimated total price including all standard fees. Make an informed choice.</p></div>
        <div style={{ ...card, padding: "16px" }}>
          <div style={{ marginBottom: "14px" }}><div style={{ fontSize: "11px", color: "#5a6478", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Car type</div><div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>{["All", "Economy", "SUV", "Luxury"].map(ct => <FB key={ct} active={carF === ct} onClick={() => setCarF(ct)}>{ct === "All" ? "🚘 All" : ct === "Economy" ? "🚗 Economy" : ct === "SUV" ? "🚙 SUV" : "🏎️ Luxury"}</FB>)}</div></div>
          <div style={{ marginBottom: "14px" }}><div style={{ fontSize: "11px", color: "#5a6478", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Duration</div><div style={{ display: "flex", gap: "6px" }}>{[1, 3, 7, 14, 30].map(d => <FB key={d} active={cDays === d} onClick={() => setCDays(d)}>{d === 1 ? "1 day" : d === 30 ? "1 month" : `${d} days`}</FB>)}</div></div>
          <div><div style={{ fontSize: "11px", color: "#5a6478", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Sort by</div><div style={{ display: "flex", gap: "6px" }}>{[["price", "💰 Lowest price"], ["rating", "⭐ Best rated"], ["transparent", "✅ All-in pricing"]].map(([k, l]) => <SB key={k} active={sort === k} onClick={() => setSort(k)}>{l}</SB>)}</div></div>
        </div>
        <div style={{ fontSize: "12px", color: "#5a6478", marginBottom: "12px" }}>{list.length} companies · Sorted by {sort === "price" ? "lowest estimated total" : sort === "rating" ? "highest rating" : "all-in pricing"}</div>
        {list.map((co, idx) => {
          const isExp = expanded === co.id; const adv = co.cheapest.perDay * cDays; const extra = co.trueTotal - adv;
          return (
            <div key={co.id} style={{ ...card, padding: 0, overflow: "hidden", marginBottom: "14px", border: idx === 0 ? "1px solid rgba(255,107,53,0.3)" : "1px solid #1e2235" }}>
              {idx === 0 && <div style={{ background: "linear-gradient(135deg, #FF6B35, #FF9F1C)", padding: "4px 0", textAlign: "center", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>🏆 Best deal</div>}
              <div style={{ padding: "16px", cursor: "pointer" }} onClick={() => setExpanded(isExp ? null : co.id)}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ fontSize: "32px", width: "44px", textAlign: "center" }}>{co.logo}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "15px", fontWeight: 700 }}>{co.name}</span>
                      {co.verified && <span style={tag("#4caf50")}>✓ Verified</span>}
                      {co.transparentPricing ? <span style={tag("#00b0ff")}>All-in pricing</span> : <span style={tag("#ff9800")}>Extras apply</span>}
                    </div>
                    <div style={{ fontSize: "11px", color: "#8892a4", marginTop: "3px" }}>⭐ {co.rating} ({co.reviews.toLocaleString()}) · 📍 {co.location.split(",")[0]}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "10px", color: "#5a6478" }}>Est. total</div>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: idx === 0 ? "#4caf50" : "#FF9F1C" }}>AED {co.trueTotal.toLocaleString()}</div>
                    <div style={{ fontSize: "10px", color: extra > 50 ? "#ff9800" : "#4caf50" }}>{extra > 50 ? `+${extra} extras` : "✓ All-in price"}</div>
                  </div>
                </div>
              </div>
              {isExp && (
                <div style={{ borderTop: "1px solid #1e2235", padding: "16px", background: "rgba(0,0,0,0.2)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#8892a4", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>Available cars</div>
                  {co.matchingCars.map((car, ci) => (
                    <div key={ci} style={{ display: "flex", alignItems: "center", padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", marginBottom: "8px", gap: "12px" }}>
                      <div style={{ fontSize: "28px" }}>{car.img}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "14px", fontWeight: 600 }}>{car.model}</div>
                        <div style={{ fontSize: "10px", color: "#8892a4", marginTop: "3px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <span>🛡️ {car.insurance}</span><span>📏 {car.mileage}</span>
                          <span style={{ color: car.fuel.includes("Not included") ? "#e91e63" : "#8892a4" }}>⛽ {car.fuel}</span>
                          {car.salikIncl && <span style={{ color: "#4caf50" }}>✓ Salik incl.</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: "11px", color: "#5a6478" }}>{car.perDay} AED/day</div>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: "#FF9F1C" }}>AED {calcTrueTotal(car, co, cDays).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", margin: "14px 0" }}>
                    <div><div style={{ fontSize: "11px", color: "#4caf50", fontWeight: 700, marginBottom: "6px" }}>✅ INCLUDES</div>{co.pros.map((p, i) => <div key={i} style={{ fontSize: "11px", color: "#aaa", padding: "2px 0" }}>+ {p}</div>)}</div>
                    <div><div style={{ fontSize: "11px", color: "#ff9800", fontWeight: 700, marginBottom: "6px" }}>ℹ️ GOOD TO KNOW</div>{co.cons.map((c, i) => <div key={i} style={{ fontSize: "11px", color: "#888", padding: "2px 0" }}>• {c}</div>)}</div>
                  </div>
                  <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "#5a6478", margin: "10px 0 14px", flexWrap: "wrap" }}><span>💳 Deposit: AED {co.deposit.toLocaleString()}</span><span>{co.delivery ? "🚗 Free delivery" : "❌ No delivery"}</span></div>
                  <button onClick={() => doLead(co.name)} disabled={leads[co.name]} style={{ ...btn, width: "100%", padding: "14px", background: leads[co.name] ? "#2e7d32" : "linear-gradient(135deg, #FF6B35, #FF9F1C)" }}>{leads[co.name] ? "✓ Quote requested!" : `Get Free Quote from ${co.name}`}</button>
                  {leads[co.name] && <p style={{ ...mut, textAlign: "center", marginTop: "8px", color: "#4caf50" }}>📱 They'll WhatsApp you within 2 hours</p>}
                </div>
              )}
            </div>
          );
        })}
        <div style={{ textAlign: "center", padding: "20px 0" }}><p style={{ fontSize: "11px", color: "#3a4050", lineHeight: 1.6 }}>🔍 Estimated total includes Salik, insurance, mileage and airport fees based on publicly available data.<br />Prices are indicative and may vary. Contact the rental company for a final quote. We may earn a referral fee.</p></div>
      </>
    );
  };

  // ===== MY RENTAL TAB =====
  const RentalView = () => {
    const hasRental = rental.company || pickupPhotos.length > 0 || contractPhotos.length > 0;
    const totalPhotos = pickupPhotos.length + returnPhotos.length + contractPhotos.length;

    return (
      <>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "6px" }}>My <span style={{ color: "#FF6B35" }}>Rental Dossier</span></h2>
          <p style={mut}>Document everything. Protect yourself from unfair charges.</p>
        </div>

        {/* Summary bar */}
        {hasRental && (
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "24px" }}>
            {[[`${totalPhotos}`, "Photos"], [pickupPhotos.length > 0 ? "✓" : "—", "Pickup"], [returnPhotos.length > 0 ? "✓" : "—", "Return"], [contractPhotos.length > 0 ? "✓" : "—", "Contract"]].map(([v, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "18px", fontWeight: 700, color: v === "✓" ? "#4caf50" : v === "—" ? "#5a6478" : "#FF9F1C" }}>{v}</div>
                <div style={{ fontSize: "10px", color: "#5a6478", textTransform: "uppercase", letterSpacing: "1px" }}>{l}</div>
              </div>
            ))}
          </div>
        )}

        {/* Rental details */}
        <div style={{ ...card, padding: "16px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "14px", marginTop: 0 }}>🚗 Rental Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {[["company", "Rental company"], ["car", "Car model"], ["plateNumber", "Plate number"], ["startDate", "Start date"], ["endDate", "End date"], ["insuranceType", "Insurance type"], ["excess", "Excess amount (AED)"], ["mileageLimit", "Mileage limit"], ["fuelPolicy", "Fuel policy"], ["deposit", "Deposit (AED)"]].map(([key, label]) => (
              <div key={key}>
                <div style={{ fontSize: "10px", color: "#5a6478", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
                <input value={rental[key]} onChange={e => setRental(p => ({ ...p, [key]: e.target.value }))} placeholder={label} style={inputStyle} type={key.includes("Date") ? "date" : "text"} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: "10px" }}>
            <div style={{ fontSize: "10px", color: "#5a6478", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Notes</div>
            <textarea value={rental.notes} onChange={e => setRental(p => ({ ...p, notes: e.target.value }))} placeholder="Any important notes about your rental..." style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} />
          </div>
        </div>

        {/* Contract photos */}
        <PhotoSection title="Contract & Documents" icon="📄" photos={contractPhotos} setPhotos={setContractPhotos} guides={false} />

        {/* Pickup photos */}
        <PhotoSection title="Pickup Inspection" icon="🟢" photos={pickupPhotos} setPhotos={setPickupPhotos} guides={true} />

        {/* Return photos */}
        <PhotoSection title="Return Inspection" icon="🔴" photos={returnPhotos} setPhotos={setReturnPhotos} guides={true} />

        {/* Dispute section */}
        <div style={{ ...card, padding: "16px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px", marginTop: 0 }}>⚖️ Need Help With a Dispute?</h3>
          <p style={{ ...mut, marginBottom: "14px" }}>Select your issue and get step-by-step guidance.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
            {[["damage", "📸 Damage charge"], ["deposit", "💳 Deposit issue"], ["overcharge", "💰 Unexpected bill"], ["accident", "🚨 Accident"]].map(([key, label]) => (
              <button key={key} onClick={() => setDisputeType(disputeType === key ? null : key)} style={{
                background: disputeType === key ? "rgba(255,107,53,0.15)" : "rgba(255,255,255,0.04)",
                color: disputeType === key ? "#FF9F1C" : "#8892a4",
                border: disputeType === key ? "1px solid rgba(255,107,53,0.3)" : "1px solid #1e2235",
                borderRadius: "10px", padding: "12px", fontSize: "13px", fontWeight: 600, cursor: "pointer", textAlign: "center"
              }}>{label}</button>
            ))}
          </div>

          {disputeType && DISPUTE_STEPS[disputeType] && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #1e2235", borderRadius: "12px", padding: "16px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FF9F1C", marginTop: 0, marginBottom: "12px" }}>
                {DISPUTE_STEPS[disputeType].title}
              </h4>
              {DISPUTE_STEPS[disputeType].steps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px", fontSize: "13px", lineHeight: 1.5 }}>
                  <div style={{ minWidth: "24px", height: "24px", borderRadius: "50%", background: "rgba(255,107,53,0.15)", color: "#FF9F1C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ color: "#ccc" }}>{step}</div>
                </div>
              ))}

              <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #1e2235" }}>
                <div style={{ fontSize: "11px", color: "#5a6478", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>Describe your situation</div>
                <textarea value={disputeNotes} onChange={e => setDisputeNotes(e.target.value)} placeholder="What happened? Include dates, amounts, and any details..." style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} />
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <button style={{ ...btn, flex: 1, padding: "12px", fontSize: "13px" }}>
                    📧 Generate Complaint Email
                  </button>
                </div>
                <p style={{ ...mut, marginTop: "8px", textAlign: "center" }}>AI will draft a professional complaint email based on your situation and dossier</p>
              </div>
            </div>
          )}
        </div>

        {/* Important contacts */}
        <div style={{ ...card, padding: "16px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px", marginTop: 0 }}>📞 Important Contacts</h3>
          {[
            ["Dubai Police (non-emergency)", "901"],
            ["Emergency", "999"],
            ["DED Consumer Protection", "600 54 5555"],
            ["RTA (Roads & Transport)", "8009090"],
            ["Salik Customer Care", "800 72545"],
          ].map(([name, number]) => (
            <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "13px" }}>
              <span style={{ color: "#aaa" }}>{name}</span>
              <a href={`tel:${number}`} style={{ color: "#FF9F1C", fontWeight: 600, textDecoration: "none" }}>{number}</a>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <p style={{ fontSize: "11px", color: "#3a4050", lineHeight: 1.6 }}>📸 All photos are stored locally on your device.<br />RentScan does not upload or share your data. Your dossier is 100% private.</p>
        </div>
      </>
    );
  };

  return (
    <div style={pg}>
      <div style={wrap}>
        <TopBar />
        {tab === "scan" && <ScanView />}
        {tab === "compare" && <CompareView />}
        {tab === "rental" && <RentalView />}
      </div>
      <BottomNav />
    </div>
  );
}