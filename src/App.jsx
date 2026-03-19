import { useState, useEffect, useRef } from "react";

const DUBAI_FEES = {
  salik: { perCrossing: 5, avgPerDay: 3.2, adminFee: 2 },
  fuel: { penaltyMultiplier: 2.2, avgTankCost: 120 },
  cleaning: { standard: 150, smoking: 500 },
  youngDriver: { dailySurcharge: 30 },
  airport: { surcharge: 50 },
  fineProcessing: { perFine: 75 },
  deposit: { economy: 1500, suv: 3000, luxury: 5000 },
};

const RENTAL_COMPANIES = [
  { id: 1, name: "Hertz UAE", logo: "🟡", rating: 4.3, reviews: 2890, verified: true, transparentPricing: true,
    location: "DXB T1/T3, Downtown, Marina, JBR", delivery: true, deposit: 2000,
    cars: [
      { type: "Economy", model: "Nissan Sunny 2025", perDay: 70, insurance: "Full CDW", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
      { type: "SUV", model: "Toyota RAV4 2025", perDay: 180, insurance: "Full CDW", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
      { type: "Luxury", model: "Volvo S90 2025", perDay: 350, insurance: "Full CDW + SCDW available", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" },
    ],
    pros: ["12 branches in Dubai", "Airport counters T1 & T3", "SCDW & PAI available", "International brand"], cons: ["Deposit hold up to 30 days", "SCDW costs extra"], featured: true },
  { id: 2, name: "Europcar Dubai", logo: "🟢", rating: 4.1, reviews: 1950, verified: true, transparentPricing: true,
    location: "DXB T1/T2/T3, Al Quoz, 14+ branches", delivery: true, deposit: 2000,
    cars: [
      { type: "Economy", model: "Nissan Sunny 2024", perDay: 70, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
      { type: "SUV", model: "Toyota Prado 2025", perDay: 200, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
      { type: "Luxury", model: "Audi A6 2025", perDay: 320, insurance: "CDW included", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" },
    ],
    pros: ["Since 1976 in Dubai", "14+ branches", "All airport terminals", "Full fleet range"], cons: ["Salik billed separately", "Extra charges for late return"], featured: true },
  { id: 3, name: "Sixt Dubai", logo: "🟠", rating: 4.4, reviews: 1340, verified: true, transparentPricing: true,
    location: "DXB Airport, Sheikh Zayed Rd, Marina", delivery: true, deposit: 2500,
    cars: [
      { type: "Economy", model: "Toyota Yaris 2025", perDay: 85, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
      { type: "SUV", model: "Nissan X-Trail 2025", perDay: 175, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
      { type: "Luxury", model: "BMW 5 Series 2025", perDay: 380, insurance: "CDW + Theft Protection", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" },
    ],
    pros: ["Premium fleet quality", "App-based booking", "Good luxury selection"], cons: ["Higher base rates", "Young driver fee applies"], featured: false },
  { id: 4, name: "Quick Drive", logo: "⚡", rating: 4.5, reviews: 1870, verified: true, transparentPricing: true,
    location: "Deira, Business Bay, JLT, DXB Airport", delivery: true, deposit: 1500,
    cars: [
      { type: "Economy", model: "Kia Picanto 2025", perDay: 65, insurance: "Full CDW", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: false, airportFee: 30, img: "🚗" },
      { type: "SUV", model: "Hyundai Tucson 2025", perDay: 160, insurance: "Full CDW", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: false, airportFee: 30, img: "🚙" },
      { type: "Luxury", model: "Mercedes C-Class 2024", perDay: 300, insurance: "Full CDW", mileage: "300km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" },
    ],
    pros: ["Transparent pricing", "Unlimited mileage on economy/SUV", "Free delivery in Dubai"], cons: ["AED 30 airport surcharge on economy", "Local brand"], featured: false },
  { id: 5, name: "Saadat Rent", logo: "🔵", rating: 4.3, reviews: 980, verified: true, transparentPricing: true,
    location: "Al Barsha, JVC, Dubai Airport", delivery: true, deposit: 1000,
    cars: [
      { type: "Economy", model: "Toyota Yaris 2025", perDay: 73, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚗" },
      { type: "SUV", model: "Toyota Rush 2025", perDay: 140, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🚙" },
      { type: "Luxury", model: "Toyota Camry 2025", perDay: 180, insurance: "CDW included", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 0, img: "🏎️" },
    ],
    pros: ["Straightforward pricing", "Low deposit AED 1,000", "Free delivery", "Toyota specialist"], cons: ["Smaller luxury fleet", "Newer company"], featured: false },
  { id: 6, name: "Absolute Rent a Car", logo: "🔴", rating: 4.0, reviews: 2450, verified: true, transparentPricing: false,
    location: "Deira, Bur Dubai, DXB Airport", delivery: true, deposit: 2000,
    cars: [
      { type: "Economy", model: "Nissan Sunny 2024", perDay: 55, insurance: "Basic CDW", mileage: "200km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 100, img: "🚗" },
      { type: "SUV", model: "Mitsubishi Pajero 2024", perDay: 150, insurance: "Basic CDW", mileage: "200km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 100, img: "🚙" },
      { type: "Luxury", model: "BMW 3 Series 2024", perDay: 250, insurance: "Basic CDW", mileage: "250km/day", fuel: "Full-to-Full", salikIncl: false, airportFee: 100, img: "🏎️" },
    ],
    pros: ["Competitive base rates", "Cash payment accepted", "Delivery across UAE"], cons: ["Basic CDW — AED 1,500 excess applies", "AED 100 airport delivery fee", "200km/day limit", "Deposit return within 30 days"], featured: false },
  { id: 7, name: "Taite Luxury", logo: "💎", rating: 4.9, reviews: 410, verified: true, transparentPricing: true,
    location: "Palm Jumeirah, DIFC, Downtown", delivery: true, deposit: 0,
    cars: [
      { type: "SUV", model: "Range Rover Sport 2025", perDay: 600, insurance: "Full CDW + Zero Excess", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: true, airportFee: 0, img: "🚙" },
      { type: "Luxury", model: "Porsche 911 2025", perDay: 1500, insurance: "Full CDW + Zero Excess", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: true, airportFee: 0, img: "🏎️" },
      { type: "Luxury", model: "Mercedes G63 2025", perDay: 1200, insurance: "Full CDW + Zero Excess", mileage: "Unlimited", fuel: "Full-to-Full", salikIncl: true, airportFee: 0, img: "🏎️" },
    ],
    pros: ["Zero deposit", "All-inclusive pricing", "Salik included", "WhatsApp booking", "Hotel delivery"], cons: ["Luxury/supercar only", "Premium prices"], featured: false },
  { id: 8, name: "Udrive", logo: "🚙", rating: 3.2, reviews: 4850, verified: true, transparentPricing: false,
    location: "App-based — find cars across Dubai, Abu Dhabi, Sharjah", delivery: false, deposit: 0,
    cars: [
      { type: "Economy", model: "JAC JS3 2024", perDay: 99, insurance: "Comprehensive incl.", mileage: "150km/day", fuel: "Not included (Basics)", salikIncl: false, airportFee: 0, img: "🚗" },
      { type: "Economy", model: "Kia Pegas 2025", perDay: 136, insurance: "Comprehensive incl.", mileage: "150km/day", fuel: "Not included (Basics)", salikIncl: false, airportFee: 0, img: "🚗" },
      { type: "Economy", model: "Toyota Yaris 2025", perDay: 139, insurance: "Comprehensive incl.", mileage: "150km/day", fuel: "Not included (Basics)", salikIncl: false, airportFee: 0, img: "🚗" },
      { type: "SUV", model: "Suzuki Jimny 2025", perDay: 199, insurance: "Comprehensive incl.", mileage: "150km/day", fuel: "Not included (Basics)", salikIncl: false, airportFee: 0, img: "🚙" },
      { type: "SUV", model: "Ford Territory 2024", perDay: 188, insurance: "Comprehensive incl.", mileage: "150km/day", fuel: "Not included (Basics)", salikIncl: false, airportFee: 0, img: "🚙" },
    ],
    pros: ["No deposit required", "App-based — find car near you", "Pay per minute option", "Available in 4 emirates"], cons: ["150km/day limit", "AED 2.10/km excess charge", "Fuel separate on Basic plan", "Damage waiver optional"], featured: false },
];

function calcTrueTotal(car, company, days) {
  let total = car.perDay * days;
  if (car.airportFee) total += car.airportFee;
  if (!car.salikIncl) total += Math.round(days * 3.2 * 7);
  if (car.insurance.includes("Basic")) total += (car.type === "Luxury" ? 60 : car.type === "SUV" ? 35 : 25) * days;
  if (car.fuel.includes("Not included")) total += days * 25; // ~25 AED/day fuel estimate
  const kmMatch = car.mileage.match(/(\d+)/);
  if (kmMatch) {
    const km = parseInt(kmMatch[1]);
    if (km <= 150) total += days * 20;
    else if (km <= 200) total += days * 15;
    else if (km <= 250) total += days * 8;
  }
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
  if (kmMatch && parseInt(kmMatch[1]) < 300) {
    costs.push({ label: "Mileage risk", amount: days * 12, type: "risk", detail: `${kmMatch[1]}km/day limit` });
    warnings.push(`ℹ️ Mileage limit: ${kmMatch[1]}km/day — Dubai to Abu Dhabi is ~280km roundtrip`);
  }

  costs.push({ label: "Late return risk", amount: dailyRate, type: "risk", detail: "1 hour late = full extra day" });
  costs.push({ label: "Fine processing", amount: 75, type: "risk", detail: "Per traffic fine" });

  const dep = DUBAI_FEES.deposit[carType];
  warnings.push(`💳 Refundable deposit of AED ${dep.toLocaleString()} — typically released within 21 days`);
  warnings.push("🚿 Cleaning fee of AED 150-500 may apply if car is returned in poor condition");

  return { costs, warnings, grandTotal: costs.reduce((s, c) => s + c.amount, 0), totalBase: base, totalHidden: costs.filter(c => c.type === "hidden").reduce((s, c) => s + c.amount, 0), totalRisk: costs.filter(c => c.type === "risk").reduce((s, c) => s + c.amount, 0), totalWarning: costs.filter(c => c.type === "warning").reduce((s, c) => s + c.amount, 0), dailyRate, days, carType, depositAmount: dep };
}

function AnimN({ value }) {
  const [d, setD] = useState(0);
  useEffect(() => { let s = 0; const step = value / 50; const t = setInterval(() => { s += step; if (s >= value) { setD(value); clearInterval(t); } else setD(Math.round(s)); }, 16); return () => clearInterval(t); }, [value]);
  return <span>{d.toLocaleString()}</span>;
}

const TC = { base: { b: "#4caf50", l: "Base" }, hidden: { b: "#ff9800", l: "Extra" }, risk: { b: "#e91e63", l: "Possible" }, warning: { b: "#ffc107", l: "Optional" } };
const tag = (color, text) => ({ display: "inline-block", background: `${color}18`, color, border: `1px solid ${color}40`, borderRadius: "6px", padding: "2px 8px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" });

export default function App() {
  const [tab, setTab] = useState("scan");
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [leads, setLeads] = useState({});
  const [carF, setCarF] = useState("All");
  const [sort, setSort] = useState("price");
  const [days, setDays] = useState(7);
  const [expanded, setExpanded] = useState(null);
  const fRef = useRef();

  const doScan = () => { if (!text.trim()) return; setBusy(true); setTimeout(() => { setResult(analyzeContract(text)); setBusy(false); }, 2000); };
  const doFile = (e) => { e.preventDefault(); const f = e.dataTransfer?.files?.[0] || e.target?.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setText(ev.target.result); r.readAsText(f); } };
  const doLead = (n) => setLeads(p => ({ ...p, [n]: true }));
  const reset = () => { setResult(null); setText(""); };

  const pg = { minHeight: "100vh", background: "linear-gradient(145deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#fff" };
  const wrap = { maxWidth: "640px", margin: "0 auto", padding: "24px 20px" };
  const card = { background: "rgba(255,255,255,0.03)", border: "1px solid #1e2235", borderRadius: "14px", padding: "20px", marginBottom: "12px" };
  const btn = { background: "linear-gradient(135deg, #FF6B35, #FF9F1C)", color: "#fff", border: "none", borderRadius: "10px", padding: "12px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer" };
  const mut = { color: "#5a6478", fontSize: "12px" };

  const Nav = () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #1e2235" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "24px" }}>🔍</span>
        <span style={{ fontSize: "20px", fontWeight: 800, background: "linear-gradient(135deg, #FF6B35, #FF9F1C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>RentScan</span>
      </div>
      <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "3px" }}>
        {[["scan", "🔍 Scan"], ["compare", "📊 Compare"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ background: tab === k ? "linear-gradient(135deg, #FF6B35, #FF9F1C)" : "transparent", color: tab === k ? "#fff" : "#5a6478", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>{l}</button>
        ))}
      </div>
    </div>
  );

  // ===== SCAN =====
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
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder={'Paste your rental quote here...\n\nExample: "Toyota Corolla, AED 150/day, 7 days, basic CDW insurance, 250km/day limit, full-to-full fuel policy, airport pickup DXB"'} style={{ width: "100%", minHeight: "120px", background: "rgba(255,255,255,0.04)", border: "1px solid #1e2235", borderRadius: "12px", padding: "14px", color: "#e0e0e0", fontSize: "13px", fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.5 }} />
      <button onClick={doScan} disabled={!text.trim() || busy} style={{ ...btn, width: "100%", marginTop: "16px", padding: "14px", fontSize: "15px", opacity: text.trim() ? 1 : 0.4 }}>{busy ? "🔍 Scanning..." : "Scan My Contract"}</button>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px" }}>{["🔒 Private", "⚡ Instant", "🆓 Free"].map(b => <span key={b} style={{ ...mut, fontSize: "11px" }}>{b}</span>)}</div>
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

  // ===== COMPARE =====
  const CompareView = () => {
    const getList = () => {
      let list = RENTAL_COMPANIES.map(co => {
        const cars = carF === "All" ? co.cars : co.cars.filter(c => c.type === carF);
        if (!cars.length) return null;
        const cheap = cars.reduce((a, b) => a.perDay < b.perDay ? a : b);
        return { ...co, matchingCars: cars, cheapest: cheap, trueTotal: calcTrueTotal(cheap, co, days) };
      }).filter(Boolean);
      if (sort === "price") list.sort((a, b) => a.trueTotal - b.trueTotal);
      else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
      else list.sort((a, b) => (b.transparentPricing ? 1 : 0) - (a.transparentPricing ? 1 : 0));
      return list;
    };
    const list = getList();

    const FilterBtn = ({ active, onClick, children }) => (
      <button onClick={onClick} style={{ background: active ? "linear-gradient(135deg, #FF6B35, #FF9F1C)" : "rgba(255,255,255,0.04)", color: active ? "#fff" : "#8892a4", border: active ? "none" : "1px solid #1e2235", borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>{children}</button>
    );

    const SortBtn = ({ active, onClick, children }) => (
      <button onClick={onClick} style={{ background: active ? "rgba(255,107,53,0.15)" : "rgba(255,255,255,0.04)", color: active ? "#FF9F1C" : "#5a6478", border: active ? "1px solid rgba(255,107,53,0.3)" : "1px solid #1e2235", borderRadius: "8px", padding: "6px 12px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>{children}</button>
    );

    return (
      <>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "6px" }}>Compare <span style={{ color: "#FF6B35" }}>total costs</span></h2>
          <p style={mut}>Estimated total price including all standard fees. Make an informed choice.</p>
        </div>

        <div style={{ ...card, padding: "16px" }}>
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "11px", color: "#5a6478", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Car type</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {["All", "Economy", "SUV", "Luxury"].map(ct => <FilterBtn key={ct} active={carF === ct} onClick={() => setCarF(ct)}>{ct === "All" ? "🚘 All" : ct === "Economy" ? "🚗 Economy" : ct === "SUV" ? "🚙 SUV" : "🏎️ Luxury"}</FilterBtn>)}
            </div>
          </div>
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "11px", color: "#5a6478", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Duration</div>
            <div style={{ display: "flex", gap: "6px" }}>
              {[1, 3, 7, 14, 30].map(d => <FilterBtn key={d} active={days === d} onClick={() => setDays(d)}>{d === 1 ? "1 day" : d === 30 ? "1 month" : `${d} days`}</FilterBtn>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#5a6478", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Sort by</div>
            <div style={{ display: "flex", gap: "6px" }}>
              {[["price", "💰 Lowest price"], ["rating", "⭐ Best rated"], ["transparent", "✅ All-in pricing"]].map(([k, l]) => <SortBtn key={k} active={sort === k} onClick={() => setSort(k)}>{l}</SortBtn>)}
            </div>
          </div>
        </div>

        <div style={{ fontSize: "12px", color: "#5a6478", marginBottom: "12px" }}>{list.length} companies · Sorted by {sort === "price" ? "lowest estimated total" : sort === "rating" ? "highest rating" : "all-in pricing"}</div>

        {list.map((co, idx) => {
          const isExp = expanded === co.id;
          const adv = co.cheapest.perDay * days;
          const extra = co.trueTotal - adv;

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
                      {co.transparentPricing && <span style={tag("#00b0ff")}>All-in pricing</span>}
                      {!co.transparentPricing && <span style={tag("#ff9800")}>Extras apply</span>}
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
                        <div style={{ fontSize: "16px", fontWeight: 700, color: "#FF9F1C" }}>AED {calcTrueTotal(car, co, days).toLocaleString()}</div>
                        <div style={{ fontSize: "9px", color: "#5a6478" }}>{days} days true total</div>
                      </div>
                    </div>
                  ))}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", margin: "14px 0" }}>
                    <div><div style={{ fontSize: "11px", color: "#4caf50", fontWeight: 700, marginBottom: "6px" }}>✅ INCLUDES</div>{co.pros.map((p, i) => <div key={i} style={{ fontSize: "11px", color: "#aaa", padding: "2px 0" }}>+ {p}</div>)}</div>
                    <div><div style={{ fontSize: "11px", color: "#ff9800", fontWeight: 700, marginBottom: "6px" }}>ℹ️ GOOD TO KNOW</div>{co.cons.map((c, i) => <div key={i} style={{ fontSize: "11px", color: "#888", padding: "2px 0" }}>• {c}</div>)}</div>
                  </div>

                  <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "#5a6478", margin: "10px 0 14px", flexWrap: "wrap" }}>
                    <span>💳 Deposit: AED {co.deposit.toLocaleString()}</span>
                    <span>{co.delivery ? "🚗 Free delivery" : "❌ No delivery"}</span>
                  </div>

                  <button onClick={() => doLead(co.name)} disabled={leads[co.name]} style={{ ...btn, width: "100%", padding: "14px", background: leads[co.name] ? "#2e7d32" : "linear-gradient(135deg, #FF6B35, #FF9F1C)" }}>
                    {leads[co.name] ? "✓ Quote requested!" : `Get Free Quote from ${co.name}`}
                  </button>
                  {leads[co.name] && <p style={{ ...mut, textAlign: "center", marginTop: "8px", color: "#4caf50" }}>📱 They'll WhatsApp you within 2 hours</p>}
                </div>
              )}
            </div>
          );
        })}

        <div style={{ textAlign: "center", padding: "20px 0 40px" }}>
          <p style={{ fontSize: "11px", color: "#3a4050", lineHeight: 1.6 }}>🔍 Estimated total includes Salik, insurance, mileage and airport fees based on publicly available data.<br />Prices are indicative and may vary. Contact the rental company for a final quote. We may earn a referral fee.</p>
        </div>
      </>
    );
  };

  return (
    <div style={pg}>
      <div style={wrap}>
        <Nav />
        {tab === "scan" ? <ScanView /> : <CompareView />}
      </div>
    </div>
  );
}