import { useState, useEffect, useRef } from "react";

// ===== COMPANY DATA =====
const COMPANIES = [
  { id: 1, name: "Hertz UAE", logo: "🟡", rating: 4.3, reviews: 2890, verified: true, allIn: true, location: "DXB T1/T3, Downtown, Marina", delivery: true, deposit: 2000, cars: [
    { type: "Economy", model: "Nissan Sunny 2025", perDay: 70, insurance: "Full CDW", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "SUV", model: "Toyota RAV4 2025", perDay: 180, insurance: "Full CDW", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
    { type: "Luxury", model: "Volvo S90 2025", perDay: 350, insurance: "Full CDW + SCDW available", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" }],
    pros: ["12 branches in Dubai", "Airport counters T1 & T3", "SCDW & PAI available"], cons: ["Deposit hold up to 30 days", "SCDW costs extra"] },
  { id: 2, name: "Europcar Dubai", logo: "🟢", rating: 4.1, reviews: 1950, verified: true, allIn: true, location: "DXB T1/T2/T3, Al Quoz, 14+ branches", delivery: true, deposit: 2000, cars: [
    { type: "Economy", model: "Nissan Sunny 2024", perDay: 70, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "SUV", model: "Toyota Prado 2025", perDay: 200, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
    { type: "Luxury", model: "Audi A6 2025", perDay: 320, insurance: "CDW included", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" }],
    pros: ["Since 1976 in Dubai", "14+ branches", "All airport terminals"], cons: ["Salik billed separately", "Extra charges for late return"] },
  { id: 3, name: "Sixt Dubai", logo: "🟠", rating: 4.4, reviews: 1340, verified: true, allIn: true, location: "DXB Airport, Sheikh Zayed Rd", delivery: true, deposit: 2500, cars: [
    { type: "Economy", model: "Toyota Yaris 2025", perDay: 85, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "SUV", model: "Nissan X-Trail 2025", perDay: 175, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
    { type: "Luxury", model: "BMW 5 Series 2025", perDay: 380, insurance: "CDW + Theft Protection", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" }],
    pros: ["Premium fleet", "App-based booking", "Good luxury selection"], cons: ["Higher base rates", "Young driver fee"] },
  { id: 4, name: "Quick Drive", logo: "⚡", rating: 4.5, reviews: 1870, verified: true, allIn: true, location: "Deira, Business Bay, JLT", delivery: true, deposit: 1500, cars: [
    { type: "Economy", model: "Kia Picanto 2025", perDay: 65, insurance: "Full CDW", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: false, airportFee: 30, img: "🚗" },
    { type: "SUV", model: "Hyundai Tucson 2025", perDay: 160, insurance: "Full CDW", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: false, airportFee: 30, img: "🚙" }],
    pros: ["Transparent pricing", "Unlimited mileage economy/SUV", "Free delivery"], cons: ["AED 30 airport surcharge", "Local brand"] },
  { id: 5, name: "Saadat Rent", logo: "🔵", rating: 4.3, reviews: 980, verified: true, allIn: true, location: "Al Barsha, JVC, Dubai Airport", delivery: true, deposit: 1000, cars: [
    { type: "Economy", model: "Toyota Yaris 2025", perDay: 73, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "SUV", model: "Toyota Rush 2025", perDay: 140, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" }],
    pros: ["Straightforward pricing", "Low deposit AED 1,000", "Free delivery"], cons: ["Smaller luxury fleet", "Newer company"] },
  { id: 6, name: "Absolute Rent a Car", logo: "🔴", rating: 4.0, reviews: 2450, verified: true, allIn: false, location: "Deira, Bur Dubai, DXB Airport", delivery: true, deposit: 2000, cars: [
    { type: "Economy", model: "Nissan Sunny 2024", perDay: 55, insurance: "Basic CDW", mileage: "200km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 100, img: "🚗" },
    { type: "SUV", model: "Mitsubishi Pajero 2024", perDay: 150, insurance: "Basic CDW", mileage: "200km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 100, img: "🚙" }],
    pros: ["Competitive base rates", "Cash accepted", "UAE-wide delivery"], cons: ["Basic CDW — AED 1,500 excess", "AED 100 airport fee", "200km/day limit"] },
  { id: 7, name: "Taite Luxury", logo: "💎", rating: 4.9, reviews: 410, verified: true, allIn: true, location: "Palm Jumeirah, DIFC, Downtown", delivery: true, deposit: 0, cars: [
    { type: "SUV", model: "Range Rover Sport 2025", perDay: 600, insurance: "Full CDW + Zero Excess", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: true, airportFee: 0, img: "🚙" },
    { type: "Luxury", model: "Mercedes G63 2025", perDay: 1200, insurance: "Full CDW + Zero Excess", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: true, airportFee: 0, img: "🏎️" }],
    pros: ["Zero deposit", "All-inclusive", "Salik included", "WhatsApp booking"], cons: ["Luxury only", "Premium prices"] },
  { id: 8, name: "Udrive", logo: "🚙", rating: 3.2, reviews: 4850, verified: true, allIn: false, location: "App-based — Dubai, Abu Dhabi, Sharjah", delivery: false, deposit: 0, cars: [
    { type: "Economy", model: "Kia Pegas 2025", perDay: 136, insurance: "Comprehensive incl.", mileage: "150km/day", fuel: "Not included (Basics)", salikIncl: false, airportFee: 0, img: "🚗" },
    { type: "SUV", model: "Suzuki Jimny 2025", perDay: 199, insurance: "Comprehensive incl.", mileage: "150km/day", fuel: "Not included (Basics)", salikIncl: false, airportFee: 0, img: "🚙" }],
    pros: ["No deposit", "App-based", "Pay per minute", "4 emirates"], cons: ["150km/day limit", "AED 2.10/km excess", "Fuel separate on Basic", "Damage waiver optional"] },
];

const PHOTO_GUIDES = [
  "⬆️ Front", "⬇️ Rear", "⬅️ Left", "➡️ Right", "↖️ Front-left", "↗️ Front-right",
  "↙️ Rear-left", "↘️ Rear-right", "🎛️ Dashboard", "🔢 Odometer", "⛽ Fuel level",
  "💺 Interior", "🧳 Trunk", "📸 Existing damage"
];

const DISPUTES = {
  damage: { title: "Unfair damage charge", steps: ["Gather pickup/return photos with timestamps from your dossier", "Compare claimed damage vs your photos", "Email the company with timestamped evidence, request their proof", "If they can't provide evidence, dispute and request refund", "File complaint: DED Consumer Protection (consumerrights.ae) or 600 54 5555", "Credit card? Contact bank for chargeback with your dossier", "Keep everything in writing — never agree verbally"] },
  deposit: { title: "Deposit not returned", steps: ["Check contract for return timeline (typically 21-30 days)", "Send formal email with contract reference number", "Include: name, dates, car details, deposit amount, bank statement", "Give 7 days to respond, then warn of complaint", "File with DED Consumer Protection", "Credit card hold? Contact bank after 30 days", "UAE Law No. 15/2020 requires clear deposit refund conditions"] },
  overcharge: { title: "Unexpected charges", steps: ["Request itemized final invoice", "Cross-reference each charge with your contract", "Verify Salik on RTA app (darb.ae)", "Verify fines on Dubai Police app", "Compare your fuel return photo with their claim", "Send dispute email with evidence per charge", "If unresolved: file with DED Consumer Protection"] },
  accident: { title: "Accident or breakdown", steps: ["Ensure safety — call 999 (emergency) or 901 (police)", "Do NOT move vehicle until police arrive (UAE law)", "Photograph everything: all vehicles, location, damage", "Get police report number — needed for insurance", "Contact rental company immediately", "Green report = not at fault. Red report = at fault (excess applies)", "Document everything in your RentScan dossier"] },
};

// ===== HELPERS =====
const calcTrue = (car, co, days) => {
  let t = car.perDay * days;
  if (car.airportFee) t += car.airportFee;
  if (!car.salikIncl) t += Math.round(days * 3.2 * 7);
  if (car.insurance.includes("Basic")) t += (car.type === "Luxury" ? 60 : car.type === "SUV" ? 35 : 25) * days;
  if (car.fuel.includes("Not included")) t += days * 25;
  const m = car.mileage.match(/(\d+)/);
  if (m) { const k = parseInt(m[1]); if (k <= 150) t += days * 20; else if (k <= 200) t += days * 15; else if (k <= 250) t += days * 8; }
  return Math.round(t);
};

// Fallback local analysis if API fails
const localAnalyze = (text) => {
  const t = text.toLowerCase();
  let rate = 150, days = 7, type = "economy";
  const rm = text.match(/(\d{2,4})\s*(?:aed|dhs)?\s*(?:\/|per)\s*day/i); if (rm) rate = parseInt(rm[1]);
  const dm = text.match(/(\d+)\s*days?/i); if (dm) days = parseInt(dm[1]);
  if (t.match(/suv|fortuner|x5|patrol|tucson/)) type = "suv";
  if (t.match(/luxury|bmw|mercedes|porsche|audi/)) type = "luxury";
  const base = rate * days;
  const costs = [
    { label: "Base rental", amount: base, type: "base", detail: `${rate} AED × ${days} days` },
    { label: "Salik tolls (est.)", amount: Math.round(days * 3.2 * 7), type: "extra", detail: "~3.2 crossings/day" },
    { label: "Fuel cost estimate", amount: t.includes("full") ? 60 : 120, type: "maybe", detail: t.includes("full") ? "Refuel before return" : "Fuel policy unclear" },
  ];
  if (!t.includes("full cover") && !t.includes("zero excess")) costs.push({ label: "Insurance upgrade", amount: (type === "luxury" ? 60 : type === "suv" ? 35 : 25) * days, type: "opt", detail: "Basic CDW — full cover available" });
  if (t.match(/airport|dxb/)) costs.push({ label: "Airport surcharge", amount: 50, type: "extra", detail: "Airport fee" });
  costs.push({ label: "Late return risk", amount: rate, type: "maybe", detail: "1hr late = full extra day" });
  costs.push({ label: "Fine processing", amount: 75, type: "maybe", detail: "Per traffic fine" });
  const dep = { economy: 1500, suv: 3000, luxury: 5000 }[type];
  const notes = [`💳 Deposit ~AED ${dep} — refundable within 21 days`, "🚿 Cleaning fee AED 150-500 may apply"];
  if (!t.includes("full cover")) notes.unshift("ℹ️ Basic insurance — excess AED 2,000-5,000 without upgrade");
  return { costs, notes, totalEstimate: costs.reduce((s, c) => s + c.amount, 0), baseTotal: base, depositEstimate: dep };
};

function AnimN({ value }) {
  const [d, setD] = useState(0);
  useEffect(() => { let s = 0; const step = value / 35; const i = setInterval(() => { s += step; if (s >= value) { setD(value); clearInterval(i); } else setD(Math.round(s)); }, 20); return () => clearInterval(i); }, [value]);
  return <span>{d.toLocaleString()}</span>;
}

// ===== THEME =====
const T = { bg: "#0B0E18", card: "#12162A", card2: "#181D35", border: "#1F2545", accent: "#E67E3C", accent2: "#F0A050", text: "#E4E8F7", sub: "#8B92B0", dim: "#555C7A", green: "#3DDC84", red: "#FF6B6B", blue: "#5B9CF6" };
const costColor = { base: T.green, extra: T.accent2, maybe: T.red, opt: T.blue };

// ===== APP =====
export default function App() {
  const [tab, setTab] = useState("scan");
  const [text, setText] = useState("");
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState({});
  const [carF, setCarF] = useState("All");
  const [sort, setSort] = useState("price");
  const [cDays, setCDays] = useState(7);
  const [exp, setExp] = useState(null);
  const fRef = useRef();
  const [rental, setRental] = useState({ company: "", car: "", plate: "", start: "", end: "", insurance: "", excess: "", mileage: "", fuel: "", deposit: "", notes: "" });
  const [pickupP, setPickupP] = useState([]);
  const [returnP, setReturnP] = useState([]);
  const [contractP, setContractP] = useState([]);
  const [dType, setDType] = useState(null);

  // ===== ANALYTICS EVENTS =====
  const trackEvent = (name, params = {}) => {
    try { if (window.gtag) window.gtag("event", name, params); } catch {}
    try { if (window.OneSignal) window.OneSignal.push(function() { window.OneSignal.sendTag(name, "true"); }); } catch {}
  };

  // ===== SCAN with API =====
  const doScan = async () => {
    if (!text.trim()) return;
    setLoading(true);
    trackEvent("scan_started", { length: text.length });
    try {
      const resp = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractText: text })
      });
      const data = await resp.json();
      if (data.mode === "chat") {
        setRes({ mode: "chat", answer: data.answer, tips: data.tips || [], aiPowered: true });
      } else if (data.costs) {
        setRes({ mode: "scan", costs: data.costs.map(c => ({ label: c.label, amount: c.amount, type: c.type, detail: c.detail })), notes: data.notes || [], totalEstimate: data.totalEstimate, baseTotal: data.baseTotal, depositEstimate: data.depositEstimate || 2000, aiPowered: true });
      } else {
        setRes({ ...localAnalyze(text), mode: "scan", aiPowered: false });
      }
    } catch {
      setRes({ ...localAnalyze(text), mode: "scan", aiPowered: false });
    }
    setLoading(false);
  };

  const doFile = (e) => { e.preventDefault(); const f = e.dataTransfer?.files?.[0] || e.target?.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setText(ev.target.result); r.readAsText(f); } };

  const handlePhoto = (setter) => {
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.capture = "environment"; inp.multiple = true;
    inp.onchange = (e) => Array.from(e.target.files).forEach(file => {
      const r = new FileReader(); r.onload = (ev) => setter(p => [...p, { id: Date.now() + Math.random(), data: ev.target.result, time: new Date().toLocaleString("en-AE", { timeZone: "Asia/Dubai", dateStyle: "medium", timeStyle: "short" }) }]); r.readAsDataURL(file);
    }); inp.click();
  };

  // ===== STYLES =====
  const css = {
    page: { minHeight: "100vh", background: T.bg, fontFamily: "-apple-system, 'SF Pro Display', 'Segoe UI', sans-serif", color: T.text, WebkitFontSmoothing: "antialiased" },
    wrap: { maxWidth: "500px", margin: "0 auto", padding: "16px 16px 100px" },
    card: { background: T.card, border: `1px solid ${T.border}`, borderRadius: "18px", padding: "18px", marginBottom: "12px" },
    btn: { background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: "#fff", border: "none", borderRadius: "14px", padding: "14px", fontSize: "15px", fontWeight: 700, cursor: "pointer", width: "100%", letterSpacing: "0.2px" },
    btnSm: { background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: "#fff", border: "none", borderRadius: "10px", padding: "10px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
    input: { width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, borderRadius: "12px", padding: "12px 14px", color: T.text, fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
    tag: (c) => ({ display: "inline-flex", background: `${c}12`, color: c, border: `1px solid ${c}30`, borderRadius: "8px", padding: "3px 10px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }),
    pill: (on) => ({ background: on ? `linear-gradient(135deg, ${T.accent}, ${T.accent2})` : "rgba(255,255,255,0.03)", color: on ? "#fff" : T.sub, border: on ? "none" : `1px solid ${T.border}`, borderRadius: "12px", padding: "9px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }),
    h2: { fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.2, margin: "0 0 10px" },
    sub: { color: T.sub, fontSize: "14px", lineHeight: 1.5 },
    label: { fontSize: "10px", color: T.dim, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "8px" },
  };

  // ===== BOTTOM NAV =====
  const Nav = () => (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: `${T.bg}EE`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: `1px solid ${T.border}`, zIndex: 100, padding: "8px 0 max(env(safe-area-inset-bottom), 8px)" }}>
      <div style={{ display: "flex", maxWidth: "500px", margin: "0 auto", justifyContent: "space-around" }}>
        {[["scan", "🔍", "Scan"], ["compare", "📊", "Compare & Rent"], ["rental", "📋", "My Rental"]].map(([k, ico, lbl]) => (
          <button key={k} onClick={() => setTab(k)} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            <span style={{ fontSize: "24px", opacity: tab === k ? 1 : 0.4, transition: "opacity 0.2s" }}>{ico}</span>
            <span style={{ fontSize: "10px", fontWeight: 700, color: tab === k ? T.accent : T.dim, letterSpacing: "0.5px" }}>{lbl}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const Logo = () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "28px", paddingBottom: "20px", borderBottom: `1px solid ${T.border}` }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", boxShadow: `0 4px 15px ${T.accent}40` }}>🔍</div>
      <div><div style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px" }}>RentScan</div><div style={{ fontSize: "10px", color: T.dim, letterSpacing: "2px", textTransform: "uppercase", marginTop: "-1px" }}>Dubai Car Rentals</div></div>
    </div>
  );

  // ===== PHOTO SECTION =====
  const Photos = ({ title, icon, photos, setter, guides }) => (
    <div style={css.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <span style={{ fontSize: "15px", fontWeight: 700 }}>{icon} {title}</span>
        <span style={{ fontSize: "11px", fontWeight: 600, color: photos.length > 0 ? T.green : T.dim, background: photos.length > 0 ? `${T.green}15` : "rgba(255,255,255,0.04)", padding: "4px 12px", borderRadius: "8px" }}>{photos.length} photos</span>
      </div>
      {photos.length > 0 && <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginBottom: "14px" }}>
        {photos.map(p => <div key={p.id} style={{ position: "relative", borderRadius: "12px", overflow: "hidden", aspectRatio: "1" }}>
          <img src={p.data} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.85))", padding: "10px 4px 3px", fontSize: "7px", color: "#bbb", textAlign: "center" }}>{p.time}</div>
          <button onClick={() => setter(pr => pr.filter(x => x.id !== p.id))} style={{ position: "absolute", top: 3, right: 3, background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>)}
      </div>}
      {guides && <div style={{ marginBottom: "14px" }}><div style={css.label}>Recommended shots</div><div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {PHOTO_GUIDES.map((g, i) => <span key={i} style={{ fontSize: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}`, borderRadius: "8px", padding: "4px 10px", color: T.sub }}>{g}</span>)}
      </div></div>}
      <button onClick={() => handlePhoto(setter)} style={css.btn}>📸 {photos.length === 0 ? "Take Photos" : "Add More"}</button>
    </div>
  );

  // ===== SCAN TAB =====
  const ScanTab = () => !res ? (
    <>
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <h2 style={css.h2}>Know the <span style={{ color: T.accent }}>full cost</span><br />before you book</h2>
        <p style={css.sub}>Paste a rental quote to scan costs, or ask anything about renting in Dubai.</p>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "36px", marginBottom: "36px" }}>
        {[["3,291", "Scans"], ["AED 340", "Avg saved"], ["8", "Companies"]].map(([v, l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: 800, color: T.accent }}>{v}</div>
            <div style={{ fontSize: "9px", color: T.dim, textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "3px" }}>{l}</div>
          </div>))}
      </div>
      <div onDragOver={e => e.preventDefault()} onDrop={doFile} onClick={() => fRef.current?.click()} style={{ border: `2px dashed ${T.border}`, borderRadius: "18px", padding: "28px", textAlign: "center", cursor: "pointer", marginBottom: "14px" }}>
        <input ref={fRef} type="file" onChange={doFile} style={{ display: "none" }} />
        <div style={{ fontSize: "32px", marginBottom: "8px" }}>📄</div>
        <div style={{ color: T.sub, fontSize: "14px" }}>Drop contract or tap to upload</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "16px 0" }}>
        <div style={{ flex: 1, height: "1px", background: T.border }} />
        <span style={{ fontSize: "10px", color: T.dim, textTransform: "uppercase", letterSpacing: "2px" }}>or paste text</span>
        <div style={{ flex: 1, height: "1px", background: T.border }} />
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder={'Paste a rental quote to scan costs, or ask any question:\n\n📄 "Toyota Corolla, AED 150/day, 7 days, basic CDW, 250km/day, airport pickup DXB"\n\n💬 "What should I check before renting a car in Dubai?"\n\n💬 "Is it better to get full insurance or basic CDW?"'} style={{ ...css.input, minHeight: "130px", resize: "vertical", lineHeight: 1.6 }} />
      <button onClick={doScan} disabled={!text.trim() || loading} style={{ ...css.btn, marginTop: "16px", opacity: text.trim() ? 1 : 0.4 }}>
        {loading ? "🔍 Analyzing..." : "🔍 Scan or Ask"}
      </button>
      <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "20px" }}>
        {["🔒 Private", "⚡ AI-Powered", "🆓 Free"].map(b => <span key={b} style={{ fontSize: "11px", color: T.dim }}>{b}</span>)}
      </div>
    </>
  ) : (
    <>
      <button onClick={() => { setRes(null); setText(""); }} style={{ background: "none", border: `1px solid ${T.border}`, color: T.sub, borderRadius: "10px", padding: "8px 18px", cursor: "pointer", fontSize: "13px", marginBottom: "12px" }}>← New question</button>
      {res.aiPowered && <div style={{ textAlign: "center", marginBottom: "8px" }}><span style={css.tag(T.green)}>✨ AI-Powered</span></div>}

      {/* CHAT MODE */}
      {res.mode === "chat" && <>
        <div style={{ ...css.card, padding: "22px" }}>
          <div style={{ fontSize: "15px", lineHeight: 1.7, color: T.text, whiteSpace: "pre-wrap" }}>{res.answer}</div>
        </div>
        {res.tips?.length > 0 && <div style={css.card}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 12px" }}>💡 Quick tips</h3>
          {res.tips.map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <div style={{ minWidth: "24px", height: "24px", borderRadius: "50%", background: `${T.accent}20`, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontSize: "13px", color: T.sub, lineHeight: 1.5, paddingTop: "2px" }}>{tip}</div>
            </div>
          ))}
        </div>}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={() => setTab("compare")} style={css.btn}>📊 Compare & Rent</button>
        </div>
      </>}

      {/* SCAN MODE */}
      {res.mode === "scan" && <>
      <div style={{ background: `linear-gradient(135deg, ${T.accent}15, ${T.red}10)`, border: `1px solid ${T.accent}30`, borderRadius: "20px", padding: "28px", textAlign: "center", marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", color: T.accent, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px", fontWeight: 600 }}>Estimated total cost</div>
        <div style={{ fontSize: "44px", fontWeight: 800, letterSpacing: "-2px" }}>AED <AnimN value={res.totalEstimate} /></div>
        <div style={{ fontSize: "13px", color: T.sub, marginTop: "6px" }}>Base: AED {res.baseTotal?.toLocaleString()} · <span style={{ color: T.accent2 }}>+{Math.round(((res.totalEstimate - res.baseTotal) / res.baseTotal) * 100)}% additional</span></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
        {[["Additional fees", res.costs?.filter(c => c.type === "extra").reduce((s, c) => s + c.amount, 0), T.accent2],
          ["Possible costs", res.costs?.filter(c => c.type === "maybe").reduce((s, c) => s + c.amount, 0), T.red],
          ["Optional upgrades", res.costs?.filter(c => c.type === "opt").reduce((s, c) => s + c.amount, 0), T.blue],
          ["Deposit (refundable)", res.depositEstimate, "#60A5FA"]
        ].map(([l, a, c]) => (
          <div key={l} style={{ ...css.card, borderLeft: `3px solid ${c}`, padding: "14px" }}>
            <div style={{ fontSize: "10px", color: T.dim, textTransform: "uppercase", letterSpacing: "1px" }}>{l}</div>
            <div style={{ fontSize: "19px", fontWeight: 800, color: c, marginTop: "4px" }}>AED {(a || 0).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>💰 Breakdown</h3>
      {res.costs?.map((c, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: T.card, borderRadius: "12px", marginBottom: "6px", borderLeft: `3px solid ${costColor[c.type] || T.sub}` }}>
          <div style={{ flex: 1 }}><div style={{ fontSize: "14px", fontWeight: 600 }}>{c.label}</div><div style={{ fontSize: "11px", color: T.dim, marginTop: "2px" }}>{c.detail}</div></div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: costColor[c.type] || T.sub, whiteSpace: "nowrap" }}>AED {c.amount?.toLocaleString()}</div>
        </div>
      ))}
      {res.notes?.length > 0 && <>
        <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "20px 0 12px" }}>ℹ️ Good to Know</h3>
        <div style={{ background: `${T.accent2}08`, border: `1px solid ${T.accent2}20`, borderRadius: "16px", padding: "16px" }}>
          {res.notes.map((n, i) => <div key={i} style={{ fontSize: "13px", color: T.sub, padding: "6px 0", borderBottom: i < res.notes.length - 1 ? `1px solid ${T.border}` : "none", lineHeight: 1.5 }}>{n}</div>)}
        </div>
      </>}
      <div style={{ textAlign: "center", marginTop: "28px" }}>
        <button onClick={() => setTab("compare")} style={css.btn}>📊 Compare & Rent</button>
        <p style={{ ...css.sub, fontSize: "12px", marginTop: "10px" }}>See estimated costs across Dubai rental companies</p>
      </div>
      </>}
    </>
  );

  // ===== COMPARE TAB =====
  const CompareTab = () => {
    const list = COMPANIES.map(co => {
      const cars = carF === "All" ? co.cars : co.cars.filter(c => c.type === carF);
      if (!cars.length) return null;
      const ch = cars.reduce((a, b) => a.perDay < b.perDay ? a : b);
      return { ...co, matchCars: cars, cheapest: ch, tt: calcTrue(ch, co, cDays) };
    }).filter(Boolean).sort((a, b) => sort === "price" ? a.tt - b.tt : sort === "rating" ? b.rating - a.rating : (b.allIn ? 1 : 0) - (a.allIn ? 1 : 0));

    const Pill = ({ on, onClick, children }) => <button onClick={onClick} style={css.pill(on)}>{children}</button>;
    return (
      <>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={css.h2}>Compare <span style={{ color: T.accent }}>&amp; rent</span></h2>
          <p style={css.sub}>Estimated totals including all standard fees.</p>
        </div>
        <div style={{ ...css.card, padding: "16px" }}>
          <div style={{ marginBottom: "14px" }}><div style={css.label}>Car type</div><div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {["All", "Economy", "SUV", "Luxury"].map(c => <Pill key={c} on={carF === c} onClick={() => setCarF(c)}>{c === "All" ? "🚘 All" : c === "Economy" ? "🚗 Economy" : c === "SUV" ? "🚙 SUV" : "🏎️ Luxury"}</Pill>)}
          </div></div>
          <div style={{ marginBottom: "14px" }}><div style={css.label}>Duration</div><div style={{ display: "flex", gap: "6px" }}>
            {[1, 3, 7, 14, 30].map(d => <Pill key={d} on={cDays === d} onClick={() => setCDays(d)}>{d === 30 ? "1 month" : `${d} day${d > 1 ? "s" : ""}`}</Pill>)}
          </div></div>
          <div><div style={css.label}>Sort by</div><div style={{ display: "flex", gap: "6px" }}>
            {[["price", "💰 Price"], ["rating", "⭐ Rating"], ["allIn", "✅ All-in"]].map(([k, l]) => <Pill key={k} on={sort === k} onClick={() => setSort(k)}>{l}</Pill>)}
          </div></div>
        </div>
        <div style={{ fontSize: "12px", color: T.dim, marginBottom: "12px" }}>{list.length} companies</div>
        {list.map((co, idx) => {
          const isExp = exp === co.id; const extra = co.tt - co.cheapest.perDay * cDays;
          return (
            <div key={co.id} style={{ ...css.card, padding: 0, overflow: "hidden", border: idx === 0 ? `1px solid ${T.accent}40` : `1px solid ${T.border}` }}>
              {idx === 0 && <div style={{ background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, padding: "5px", textAlign: "center", fontSize: "11px", fontWeight: 700, letterSpacing: "1px" }}>🏆 BEST DEAL</div>}
              <div style={{ padding: "16px", cursor: "pointer" }} onClick={() => setExp(isExp ? null : co.id)}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ fontSize: "34px" }}>{co.logo}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "16px", fontWeight: 700 }}>{co.name}</span>
                      {co.verified && <span style={css.tag(T.green)}>✓ Verified</span>}
                      <span style={css.tag(co.allIn ? T.blue : T.accent2)}>{co.allIn ? "All-in" : "Extras apply"}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: T.sub, marginTop: "4px" }}>⭐ {co.rating} ({co.reviews.toLocaleString()}) · 📍 {co.location.split(",")[0]}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "10px", color: T.dim }}>Est. total</div>
                    <div style={{ fontSize: "22px", fontWeight: 800, color: idx === 0 ? T.green : T.accent }}>{co.tt.toLocaleString()}</div>
                    <div style={{ fontSize: "10px", color: extra > 50 ? T.accent2 : T.green }}>{extra > 50 ? `+${extra}` : "✓ All-in"}</div>
                  </div>
                </div>
              </div>
              {isExp && <div style={{ borderTop: `1px solid ${T.border}`, padding: "16px", background: T.card2 }}>
                <div style={css.label}>Available cars</div>
                {co.matchCars.map((car, ci) => (
                  <div key={ci} style={{ display: "flex", alignItems: "center", padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "14px", marginBottom: "8px", gap: "12px" }}>
                    <span style={{ fontSize: "28px" }}>{car.img}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 600 }}>{car.model}</div>
                      <div style={{ fontSize: "10px", color: T.sub, marginTop: "3px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <span>🛡️ {car.insurance}</span><span>📏 {car.mileage}</span>
                        <span style={{ color: car.fuel.includes("Not") ? T.red : T.sub }}>⛽ {car.fuel}</span>
                        {car.salikIncl && <span style={{ color: T.green }}>✓ Salik</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "11px", color: T.dim }}>{car.perDay}/day</div>
                      <div style={{ fontSize: "17px", fontWeight: 700, color: T.accent }}>AED {calcTrue(car, co, cDays).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", margin: "14px 0" }}>
                  <div><div style={{ fontSize: "11px", color: T.green, fontWeight: 700, marginBottom: "6px" }}>✅ INCLUDES</div>{co.pros.map((p, i) => <div key={i} style={{ fontSize: "11px", color: T.sub, padding: "2px 0" }}>+ {p}</div>)}</div>
                  <div><div style={{ fontSize: "11px", color: T.accent2, fontWeight: 700, marginBottom: "6px" }}>ℹ️ GOOD TO KNOW</div>{co.cons.map((c, i) => <div key={i} style={{ fontSize: "11px", color: T.dim, padding: "2px 0" }}>• {c}</div>)}</div>
                </div>
                <div style={{ display: "flex", gap: "10px", fontSize: "11px", color: T.dim, margin: "10px 0 14px", flexWrap: "wrap" }}>
                  <span>💳 Deposit: AED {co.deposit.toLocaleString()}</span>
                  <span>{co.delivery ? "🚗 Free delivery" : "📍 Pickup only"}</span>
                </div>
                <button onClick={() => { setLeads(p => ({ ...p, [co.name]: true })); trackEvent("quote_requested", { company: co.name }); }} disabled={leads[co.name]} style={{ ...css.btn, background: leads[co.name] ? T.green : `linear-gradient(135deg, ${T.accent}, ${T.accent2})` }}>
                  {leads[co.name] ? "✓ Quote requested!" : `Get Free Quote from ${co.name}`}
                </button>
                {leads[co.name] && <p style={{ fontSize: "12px", color: T.green, textAlign: "center", marginTop: "8px" }}>📱 They'll contact you within 2 hours</p>}
              </div>}
            </div>);
        })}
        <p style={{ fontSize: "11px", color: T.dim, textAlign: "center", padding: "20px 0", lineHeight: 1.6 }}>🔍 Estimates include Salik, insurance, mileage and airport fees.<br />Prices are indicative. We may earn a referral fee.</p>
      </>
    );
  };

  // ===== RENTAL TAB =====
  const RentalTab = () => {
    const total = pickupP.length + returnP.length + contractP.length;
    return (
      <>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={css.h2}>My <span style={{ color: T.accent }}>Rental Dossier</span></h2>
          <p style={css.sub}>Document everything. Protect yourself.</p>
        </div>
        {total > 0 && <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "24px" }}>
          {[[`${total}`, "Photos"], [pickupP.length > 0 ? "✓" : "—", "Pickup"], [returnP.length > 0 ? "✓" : "—", "Return"], [contractP.length > 0 ? "✓" : "—", "Docs"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: v === "✓" ? T.green : v === "—" ? T.dim : T.accent }}>{v}</div>
              <div style={{ fontSize: "9px", color: T.dim, textTransform: "uppercase", letterSpacing: "1px" }}>{l}</div>
            </div>))}
        </div>}

        <div style={css.card}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 14px" }}>🚗 Rental Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {[["company", "Company"], ["car", "Car model"], ["plate", "Plate number"], ["start", "Start date"], ["end", "End date"], ["insurance", "Insurance"], ["excess", "Excess (AED)"], ["mileage", "Mileage limit"], ["fuel", "Fuel policy"], ["deposit", "Deposit (AED)"]].map(([k, l]) => (
              <div key={k}><div style={css.label}>{l}</div><input value={rental[k]} onChange={e => { setRental(p => ({ ...p, [k]: e.target.value })); if (k === "company" && e.target.value.length === 3) trackEvent("rental_started", { field: k }); }} placeholder={l} style={css.input} type={k === "start" || k === "end" ? "date" : "text"} /></div>
            ))}
          </div>
          <div style={{ marginTop: "10px" }}><div style={css.label}>Notes</div><textarea value={rental.notes} onChange={e => setRental(p => ({ ...p, notes: e.target.value }))} placeholder="Important notes..." style={{ ...css.input, minHeight: "50px", resize: "vertical" }} /></div>
        </div>

        <Photos title="Contract & Documents" icon="📄" photos={contractP} setter={setContractP} guides={false} />
        <Photos title="Pickup Inspection" icon="🟢" photos={pickupP} setter={setPickupP} guides={true} />
        <Photos title="Return Inspection" icon="🔴" photos={returnP} setter={setReturnP} guides={true} />

        <div style={css.card}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px" }}>⚖️ Need Help With a Dispute?</h3>
          <p style={{ ...css.sub, fontSize: "12px", marginBottom: "14px" }}>Select your issue for step-by-step guidance.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
            {[["damage", "📸 Damage charge"], ["deposit", "💳 Deposit issue"], ["overcharge", "💰 Unexpected bill"], ["accident", "🚨 Accident"]].map(([k, l]) => (
              <button key={k} onClick={() => { setDType(dType === k ? null : k); trackEvent("dispute_opened", { type: k }); }} style={{ background: dType === k ? `${T.accent}20` : "rgba(255,255,255,0.03)", color: dType === k ? T.accent : T.sub, border: dType === k ? `1px solid ${T.accent}40` : `1px solid ${T.border}`, borderRadius: "14px", padding: "14px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>{l}</button>
            ))}
          </div>
          {dType && DISPUTES[dType] && <div style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "18px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: 700, color: T.accent, margin: "0 0 14px" }}>{DISPUTES[dType].title}</h4>
            {DISPUTES[dType].steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                <div style={{ minWidth: "26px", height: "26px", borderRadius: "50%", background: `${T.accent}20`, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: "13px", color: T.sub, lineHeight: 1.5, paddingTop: "3px" }}>{step}</div>
              </div>
            ))}
          </div>}
        </div>

        <div style={css.card}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 12px" }}>📞 Important Contacts</h3>
          {[["Dubai Police", "901"], ["Emergency", "999"], ["DED Consumer Protection", "600 54 5555"], ["RTA", "8009090"], ["Salik", "800 72545"]].map(([n, num]) => (
            <div key={n} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}`, fontSize: "13px" }}>
              <span style={{ color: T.sub }}>{n}</span>
              <a href={`tel:${num}`} style={{ color: T.accent, fontWeight: 600, textDecoration: "none" }}>{num}</a>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "11px", color: T.dim, textAlign: "center", padding: "16px 0", lineHeight: 1.6 }}>📸 Photos stored locally on your device. 100% private.</p>
      </>
    );
  };

  // ===== LEGAL PAGES =====
  const LegalPage = ({ title, children }) => (
    <>
      <button onClick={() => setTab("scan")} style={{ background: "none", border: `1px solid ${T.border}`, color: T.sub, borderRadius: "10px", padding: "8px 18px", cursor: "pointer", fontSize: "13px", marginBottom: "16px" }}>← Back</button>
      <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "20px" }}>{title}</h2>
      <div style={{ fontSize: "13px", color: T.sub, lineHeight: 1.8 }}>{children}</div>
    </>
  );

  const TermsPage = () => (
    <LegalPage title="Terms of Use">
      <p><strong style={{ color: T.text }}>Last updated:</strong> March 2026</p>
      <p>By accessing or using RentScan (www.rentscan.ae), you agree to be bound by these Terms of Use. If you do not agree, please do not use the platform.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>1. Nature of service</h3>
      <p>RentScan is an independent informational platform that provides estimated cost calculations and comparisons for car rental services in Dubai, UAE. RentScan is NOT a car rental company, broker, agent, or intermediary. We do not rent, lease, or provide vehicles. We do not enter into rental agreements on behalf of any user or rental company.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>2. Informational purposes only</h3>
      <p>All information, estimates, calculations, comparisons, and AI-generated analyses provided on this platform are for <strong style={{ color: T.text }}>general informational purposes only</strong>. This includes but is not limited to:</p>
      <p>• Estimated total rental costs and fee breakdowns<br/>
      • Company comparisons and pricing data<br/>
      • AI-powered contract analysis and chat responses<br/>
      • Dispute guidance and step-by-step suggestions<br/>
      • Contact information for authorities and services</p>
      <p>None of the above constitutes legal advice, financial advice, professional advice, or a guarantee of any kind.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>3. No guarantees on accuracy</h3>
      <p>While we strive to provide accurate and up-to-date information, RentScan makes <strong style={{ color: T.text }}>no warranties or representations</strong> regarding the accuracy, completeness, reliability, or timeliness of any information displayed. Prices, fees, policies, and terms of rental companies may change at any time without notice. Users should always verify all information directly with the rental company before making any booking or financial decision.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>4. AI-generated content disclaimer</h3>
      <p>RentScan uses artificial intelligence (AI) technology to analyze contracts and answer questions. AI-generated content may contain errors, inaccuracies, or outdated information. AI responses should not be relied upon as a substitute for professional legal, financial, or other expert advice. Users are solely responsible for verifying any AI-generated information before acting upon it.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>5. Third-party services and referrals</h3>
      <p>RentScan may display information about, or provide links to, third-party car rental companies and services. These are independent businesses over which RentScan has no control. RentScan does not endorse, guarantee, or assume responsibility for any third-party products, services, or business practices. Any transaction between you and a third-party rental company is solely between you and that company. RentScan may receive referral fees or commissions from rental companies when users request quotes or make bookings through our platform.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>6. Dispute guidance disclaimer</h3>
      <p>The dispute assistance and step-by-step guidance provided on RentScan is for informational purposes only and does <strong style={{ color: T.text }}>not constitute legal advice</strong>. RentScan is not a law firm, legal service, or consumer protection agency. For legal disputes, users should consult a qualified legal professional licensed in the UAE. References to government agencies (DED, RTA, Dubai Police) are provided for convenience only.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>7. Photo dossier and local storage</h3>
      <p>The "My Rental" dossier feature stores photos and rental information locally on your device. RentScan does not upload, store, or have access to your photos or personal rental details. You are solely responsible for maintaining backups of your data. RentScan is not liable for any data loss. While timestamped photos may support a dispute, RentScan makes no guarantee that any evidence will be accepted by rental companies, insurance providers, courts, or any other party.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>8. Limitation of liability</h3>
      <p>To the maximum extent permitted by applicable law, RentScan, its owners, operators, employees, and affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from or related to:</p>
      <p>• Your use of or inability to use the platform<br/>
      • Any inaccuracies in pricing, estimates, or AI-generated content<br/>
      • Any transactions or disputes with third-party rental companies<br/>
      • Any decisions made based on information provided by RentScan<br/>
      • Any loss of data, photos, or documents<br/>
      • Any unauthorized access to your information</p>
      <p>Your use of RentScan is entirely at your own risk.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>9. Indemnification</h3>
      <p>You agree to indemnify, defend, and hold harmless RentScan and its owners, operators, and affiliates from and against any claims, liabilities, damages, losses, and expenses arising from your use of the platform, your violation of these Terms, or your violation of any rights of a third party.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>10. Company information and neutrality</h3>
      <p>RentScan presents publicly available information about car rental companies in a neutral and factual manner. All data is sourced from public websites, published rates, and user submissions. RentScan does not make qualitative judgments about any company. Rankings and sorting are based on objective criteria (estimated price, publicly available ratings). No company pays for higher organic rankings. Sponsored or featured placements, if any, are clearly labeled.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>11. User conduct</h3>
      <p>Users agree not to misuse the platform, including but not limited to: submitting false information, attempting to manipulate data, using the platform for any unlawful purpose, or interfering with the platform's operation.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>12. Modifications</h3>
      <p>RentScan reserves the right to modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the updated Terms.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>13. Governing law</h3>
      <p>These Terms shall be governed by and construed in accordance with the laws of the United Arab Emirates. Any disputes arising from these Terms or your use of RentScan shall be subject to the exclusive jurisdiction of the courts of Dubai, UAE.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>14. Contact</h3>
      <p>For questions about these Terms, contact us at: <strong style={{ color: T.accent }}>info@rentscan.ae</strong></p>
    </LegalPage>
  );

  const PrivacyPage = () => (
    <LegalPage title="Privacy Policy">
      <p><strong style={{ color: T.text }}>Last updated:</strong> March 2026</p>
      <p>This Privacy Policy describes how RentScan (www.rentscan.ae) collects, uses, and protects your information. By using our platform, you consent to the practices described in this policy.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>1. Information we collect</h3>
      <p><strong style={{ color: T.text }}>Information you provide:</strong></p>
      <p>• Contract text or rental quotes you paste into the scanner<br/>
      • Questions you type into the AI assistant<br/>
      • Contact information submitted via "Get Quote" forms (name, phone number)<br/>
      • Rental details entered in the "My Rental" dossier</p>
      <p><strong style={{ color: T.text }}>Information collected automatically:</strong></p>
      <p>• Basic analytics data (page views, device type, country) via cookies or analytics tools<br/>
      • IP address (anonymized)<br/>
      • Browser type and operating system</p>
      <p><strong style={{ color: T.text }}>Information we do NOT collect:</strong></p>
      <p>• Photos taken in the "My Rental" dossier — these are stored <strong style={{ color: T.text }}>only on your device</strong> and are never uploaded to our servers<br/>
      • Payment information — we do not process payments<br/>
      • Precise GPS location</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>2. How we use your information</h3>
      <p>• <strong style={{ color: T.text }}>Contract analysis:</strong> Text you paste is sent to our AI provider (Anthropic) for analysis and is not stored permanently by RentScan<br/>
      • <strong style={{ color: T.text }}>Lead generation:</strong> If you click "Get Quote", your contact information may be shared with the selected rental company so they can provide you with a quote<br/>
      • <strong style={{ color: T.text }}>Analytics:</strong> Aggregated, anonymous usage data to improve our service<br/>
      • <strong style={{ color: T.text }}>Communication:</strong> If you contact us, we may use your information to respond</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>3. Third-party data sharing</h3>
      <p>We may share information with:</p>
      <p>• <strong style={{ color: T.text }}>Anthropic (AI provider):</strong> Contract text and questions are processed via the Anthropic Claude API. Anthropic's privacy policy governs their handling of this data.<br/>
      • <strong style={{ color: T.text }}>Rental companies:</strong> Only when you explicitly request a quote by clicking "Get Quote" and submitting your contact information. We never share your data without your action.<br/>
      • <strong style={{ color: T.text }}>Analytics providers:</strong> Anonymous, aggregated usage data only.<br/>
      • <strong style={{ color: T.text }}>Law enforcement:</strong> If required by UAE law or valid legal process.</p>
      <p>We do <strong style={{ color: T.text }}>not</strong> sell your personal information to third parties.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>4. Data retention</h3>
      <p>• Contract text sent for AI analysis is not permanently stored by RentScan<br/>
      • Lead information (name, phone) is retained until the quote process is completed or for a maximum of 90 days<br/>
      • Analytics data is retained in aggregated, anonymous form<br/>
      • Photos and dossier data exist only on your device — if you clear your browser data, this information is lost</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>5. Data security</h3>
      <p>We implement reasonable technical and organizational measures to protect your information. However, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security of your data.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>6. Your rights</h3>
      <p>You have the right to:</p>
      <p>• Request access to personal data we hold about you<br/>
      • Request deletion of your personal data<br/>
      • Withdraw consent for data processing at any time<br/>
      • Opt out of any marketing communications</p>
      <p>To exercise these rights, contact us at: <strong style={{ color: T.accent }}>info@rentscan.ae</strong></p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>7. Cookies</h3>
      <p>RentScan may use cookies and similar technologies for analytics and functionality purposes. You can control cookie settings through your browser. Disabling cookies may affect platform functionality.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>8. Children's privacy</h3>
      <p>RentScan is not intended for use by individuals under the age of 18. We do not knowingly collect information from children.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>9. International data transfers</h3>
      <p>Your data may be processed outside the UAE (e.g., AI processing via Anthropic's servers). By using RentScan, you consent to such transfers.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>10. Changes to this policy</h3>
      <p>We may update this Privacy Policy from time to time. We will notify users of significant changes by updating the "Last updated" date. Continued use constitutes acceptance.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>11. Contact</h3>
      <p>For privacy-related inquiries: <strong style={{ color: T.accent }}>info@rentscan.ae</strong></p>
    </LegalPage>
  );

  const DisclaimerPage = () => (
    <LegalPage title="Disclaimer">
      <p><strong style={{ color: T.text }}>Last updated:</strong> March 2026</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>General disclaimer</h3>
      <p>RentScan is an independent informational tool. All content on this platform — including prices, estimates, comparisons, AI-generated analyses, dispute guidance, and company information — is provided "as is" and "as available" without warranties of any kind, whether express or implied.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>Not legal advice</h3>
      <p>Nothing on this platform constitutes legal advice. The dispute assistance feature provides general informational guidance only. For legal matters, consult a qualified attorney licensed in the UAE.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>Not financial advice</h3>
      <p>Cost estimates and comparisons are approximations based on publicly available data. Actual costs may vary significantly. Do not make financial decisions based solely on RentScan estimates.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>No affiliation</h3>
      <p>RentScan is not affiliated with, endorsed by, or sponsored by any car rental company listed on the platform, nor by any government entity including but not limited to RTA, DED, Dubai Police, or RERA. All trademarks and company names belong to their respective owners.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>AI limitations</h3>
      <p>The AI analysis feature uses third-party artificial intelligence technology. AI can make mistakes, misinterpret data, or provide outdated information. Always verify AI-generated content independently. RentScan is not responsible for any actions taken based on AI output.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>Photo evidence</h3>
      <p>While the photo dossier feature helps document vehicle condition, RentScan makes no representation that such documentation will be accepted as evidence by any rental company, insurance provider, court, or other party. The effectiveness of photographic evidence depends on many factors outside RentScan's control.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>Pricing data</h3>
      <p>All pricing information is collected from publicly available sources and may not reflect current rates, promotions, or special conditions. Prices can change without notice. Always confirm the final price directly with the rental company before committing to any booking.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>UAE compliance</h3>
      <p>RentScan operates in compliance with UAE Federal Law and Dubai regulations. Users are responsible for ensuring their own compliance with all applicable laws when renting vehicles in the UAE.</p>
    </LegalPage>
  );

  // ===== FOOTER =====
  const Footer = () => (
    <div style={{ textAlign: "center", padding: "24px 0 16px", borderTop: `1px solid ${T.border}`, marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "12px", flexWrap: "wrap" }}>
        {[["terms", "Terms of Use"], ["privacy", "Privacy Policy"], ["disclaimer", "Disclaimer"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ background: "none", border: "none", color: T.dim, fontSize: "11px", cursor: "pointer", textDecoration: "underline", padding: "4px" }}>{l}</button>
        ))}
      </div>
      <p style={{ fontSize: "10px", color: T.dim, margin: 0, lineHeight: 1.5 }}>© 2026 RentScan · Dubai, UAE<br/>All information is for general guidance only. Not legal or financial advice.</p>
    </div>
  );

  return (
    <div style={css.page}>
      <div style={css.wrap}>
        <Logo />
        {tab === "scan" && ScanTab()}
        {tab === "compare" && CompareTab()}
        {tab === "rental" && RentalTab()}
        {tab === "terms" && <TermsPage />}
        {tab === "privacy" && <PrivacyPage />}
        {tab === "disclaimer" && <DisclaimerPage />}
        <Footer />
      </div>
      <Nav />
    </div>
  );
}