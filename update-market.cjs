const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// ============================================
// 1. Add extracting state variable
// ============================================
c = c.replace(
  `const [dossierSaved, setDossierSaved] = useState(false);`,
  `const [dossierSaved, setDossierSaved] = useState(false);
  const [extracting, setExtracting] = useState(false);`
);

// ============================================
// 2. Add contract photo handler with auto-extraction
// ============================================
c = c.replace(
  `const handlePhoto = (setter) => {`,
  `const handleContractPhoto = () => {
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.capture = "environment"; inp.multiple = true;
    inp.onchange = (e) => Array.from(e.target.files).forEach(file => {
      const r = new FileReader(); r.onload = (ev) => {
        const imageData = ev.target.result;
        setContractP(p => [...p, { id: Date.now() + Math.random(), data: imageData, time: new Date().toLocaleString("en-AE", { timeZone: "Asia/Dubai", dateStyle: "medium", timeStyle: "short" }), label: "Contract" }]);
        setExtracting(true);
        fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageData }),
        })
          .then(r => r.json())
          .then(result => {
            if (result.success && result.data) {
              const d = result.data;
              setRental(prev => ({
                ...prev,
                company: d.company || prev.company,
                car: d.car || prev.car,
                plate: d.plate || prev.plate,
                start: d.start || prev.start,
                end: d.end || prev.end,
                dailyPrice: d.dailyPrice ? String(d.dailyPrice) : prev.dailyPrice,
                insurance: d.insurance || prev.insurance,
                excess: d.excess ? String(d.excess) : prev.excess,
                mileage: d.mileage || prev.mileage,
                fuel: d.fuel || prev.fuel,
                deposit: d.deposit ? String(d.deposit) : prev.deposit,
                notes: d.notes ? (prev.notes ? prev.notes + "\\n" + d.notes : d.notes) : prev.notes,
              }));
            }
            setExtracting(false);
          })
          .catch(() => setExtracting(false));
      }; r.readAsDataURL(file);
    }); inp.click();
  };

  const handlePhoto = (setter) => {`
);

// ============================================
// 3. Replace Contract & Documents section to use new handler
// ============================================
c = c.replace(
  `<Photos title="Contract & Documents" icon="\u{1F4C4}" photos={contractP} setter={setContractP} guides={false} />`,
  `<div style={css.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <span style={{ fontSize: "15px", fontWeight: 700 }}>\u{1F4C4} Contract & Documents</span>
            <span style={{ fontSize: "11px", fontWeight: 600, color: contractP.length > 0 ? T.green : T.dim, background: contractP.length > 0 ? T.green + "10" : T.card, padding: "4px 12px", borderRadius: "8px" }}>{contractP.length} photos</span>
          </div>
          {contractP.length > 0 && <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginBottom: "14px" }}>
            {contractP.map(p => <div key={p.id} style={{ position: "relative", borderRadius: "10px", overflow: "hidden", aspectRatio: "1" }}>
              <img src={p.data} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.8))", padding: "8px 4px 3px" }}>
                <div style={{ fontSize: "8px", color: "#fff", textAlign: "center", fontWeight: 600 }}>{p.label}</div>
                <div style={{ fontSize: "7px", color: "#bbb", textAlign: "center" }}>{p.time}</div>
              </div>
              <button onClick={() => setContractP(pr => pr.filter(x => x.id !== p.id))} style={{ position: "absolute", top: 3, right: 3, background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>\u00D7</button>
            </div>)}
          </div>}
          {extracting && <div style={{ background: T.accent + "15", border: "1px solid " + T.accent, borderRadius: "12px", padding: "12px", marginBottom: "12px", textAlign: "center" }}>
            <span style={{ fontSize: "13px", color: T.accent, fontWeight: 600 }}>\u{1F50D} Reading contract... auto-filling details</span>
          </div>}
          <button onClick={handleContractPhoto} style={{ ...css.btn, marginBottom: "8px" }}>\u{1F4F8} {contractP.length === 0 ? "Upload Contract Photo" : "Add More Pages"}</button>
          <p style={{ fontSize: "11px", color: T.dim, textAlign: "center" }}>AI reads your contract and auto-fills rental details</p>
        </div>`
);

// ============================================
// 4. Send rental data to market API on dossier generation
// ============================================
c = c.replace(
  `if (rental.company) {
              trackEvent("rental_data", {`,
  `if (rental.company) {
              fetch("/api/market", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  company: rental.company,
                  car: rental.car,
                  dailyPrice: rental.dailyPrice,
                  insurance: rental.insurance,
                  excess: rental.excess,
                  mileage: rental.mileage,
                  fuel: rental.fuel,
                  deposit: rental.deposit,
                }),
              }).catch(() => {});
              trackEvent("rental_data", {`
);

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('Done! All changes applied:');
console.log('  1. Contract photo extraction with auto-fill');
console.log('  2. Extracting loading state');
console.log('  3. Custom Contract & Documents section');
console.log('  4. Market data sent on dossier generation');
