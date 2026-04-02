const fs = require('fs');

// ============ 1. FIX EXTRACT: structured notes ============
let extract = fs.readFileSync('api/extract.js', 'utf8');
extract = extract.replace(
  /"notes": "[^"]*"/,
  '"notes": "Only fees, penalties, or important rules. Format: short items separated by |. Example: Excess mileage AED 2/km | Late return AED 300/day | No towing | GPS tracked. Max 5 items."'
);
fs.writeFileSync('api/extract.js', extract);
console.log('Extract: notes now pipe-separated bullet points');

// ============ 2. FIX DOSSIER TEMPLATE ============
let app = fs.readFileSync('src/App.jsx', 'utf8');

const templateStart = app.indexOf('const html = `<!DOCTYPE html>');
const templateEnd = app.indexOf('</body></html>`');
if (templateStart === -1 || templateEnd === -1) {
  console.log('ERROR: template not found');
  process.exit(1);
}
const fullEnd = templateEnd + '</body></html>`'.length;

const newTemplate = `const html = \`<!DOCTYPE html><html><head><meta charset="utf-8"><title>RentScan Dossier - \${d.company || "Rental"}</title>
  <style>
  @page { size: A4; margin: 18mm; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; color: #222; max-width: 780px; margin: 0 auto; padding: 36px 28px; background: #fff; }
  .header { display: flex; align-items: center; gap: 14px; padding-bottom: 18px; border-bottom: 2px solid #C8962E; margin-bottom: 8px; }
  .header img { width: 48px; height: 48px; border-radius: 12px; }
  .header .brand { font-size: 22px; font-weight: 800; color: #C8962E; letter-spacing: -0.5px; }
  .header .sub { font-size: 8px; color: #aaa; letter-spacing: 3px; text-transform: uppercase; }
  .header .right { margin-left: auto; text-align: right; }
  .header .title { font-size: 17px; font-weight: 700; color: #222; }
  .header .date { font-size: 12px; color: #999; margin-top: 2px; }
  .desc { font-size: 12px; color: #888; margin: 10px 0 24px; }
  h2 { font-size: 13px; font-weight: 700; color: #222; margin: 24px 0 10px; padding-bottom: 5px; border-bottom: 1px solid #e5e5e5; text-transform: uppercase; letter-spacing: 1px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
  .field { border: 1px solid #e5e5e5; border-radius: 5px; padding: 8px 12px; }
  .field .label { font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: #aaa; font-weight: 700; }
  .field .value { font-size: 13px; font-weight: 600; color: #222; margin-top: 2px; }
  .notes { border: 1px solid #e5e5e5; border-radius: 5px; padding: 10px 14px; margin-bottom: 16px; }
  .notes .label { font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: #aaa; font-weight: 700; margin-bottom: 6px; }
  .notes ul { list-style: none; padding: 0; }
  .notes li { font-size: 12px; color: #444; line-height: 1.4; padding: 3px 0; padding-left: 14px; position: relative; }
  .notes li:before { content: "\\2022"; color: #C8962E; font-weight: 700; position: absolute; left: 0; }
  .notes p { font-size: 12px; color: #444; line-height: 1.5; }
  .photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 8px 0 16px; }
  .photo { border-radius: 5px; overflow: hidden; border: 1px solid #e5e5e5; }
  .photo img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
  .photo .cap { padding: 5px 6px; background: #fafafa; text-align: center; font-size: 9px; color: #666; }
  .photo .cap strong { display: block; font-size: 10px; color: #333; }
  .notice { background: #FFF8EC; border-left: 3px solid #C8962E; border-radius: 3px; padding: 12px 14px; margin: 24px 0; font-size: 11px; color: #777; line-height: 1.5; }
  .notice strong { color: #C8962E; }
  .footer { margin-top: 36px; padding-top: 14px; border-top: 2px solid #C8962E; text-align: center; }
  .footer img { width: 32px; height: 32px; border-radius: 8px; margin-bottom: 4px; }
  .footer .brand { font-size: 13px; font-weight: 800; color: #C8962E; }
  .footer .sub { font-size: 8px; color: #bbb; letter-spacing: 2px; text-transform: uppercase; }
  .footer .small { font-size: 8px; color: #ccc; margin-top: 6px; }
  </style></head><body>

  <div class="header">
    <img src="https://rentscan.ae/logo.png" alt="RentScan" />
    <div>
      <div class="brand">RentScan</div>
      <div class="sub">Rent Safely</div>
    </div>
    <div class="right">
      <div class="title">Pickup Dossier</div>
      <div class="date">\${dossierDate}</div>
    </div>
  </div>
  <div class="desc">Official record of vehicle condition at pickup.</div>

  <h2>Rental Details</h2>
  <div class="grid">
  \${[["Company", d.company], ["Car", d.car], ["Plate", d.plate], ["Pickup", d.start], ["Return", d.end], ["Daily rate", d.dailyPrice ? "AED " + d.dailyPrice : null], ["Insurance", d.insurance], ["Excess", d.excess ? "AED " + d.excess : null], ["Mileage", d.mileage], ["Fuel", d.fuel], ["Deposit", d.deposit ? "AED " + d.deposit : null]].filter(([l, v]) => v).map(([l, v]) => \`<div class="field"><div class="label">\${l}</div><div class="value">\${v}</div></div>\`).join("")}
  </div>
  \${d.notes ? \`<div class="notes"><div class="label">Key Terms</div>\${d.notes.includes("|") ? "<ul>" + d.notes.split("|").map(n => n.trim()).filter(n => n).map(n => "<li>" + n + "</li>").join("") + "</ul>" : "<p>" + d.notes + "</p>"}</div>\` : ""}

  \${contractP.length > 0 ? \`<h2>Contract Documents</h2>
  <div class="photos">\${contractP.map(p => \`<div class="photo"><img src="\${p.data}"/><div class="cap"><strong>\${p.label}</strong>\${p.time}</div></div>\`).join("")}</div>\` : ""}

  \${pickupP.length > 0 ? \`<h2>Vehicle Condition at Pickup</h2>
  <div class="photos">\${pickupP.map(p => \`<div class="photo"><img src="\${p.data}"/><div class="cap"><strong>\${p.label}</strong>\${p.time}</div></div>\`).join("")}</div>\` : ""}

  <div class="notice"><strong>Notice to rental company:</strong> This dossier documents the vehicle condition at pickup with timestamped photographs. Any pre-existing damage shown above was present before the rental period began. The renter reserves the right to use this documentation in case of disputed charges.</div>

  <div class="footer">
    <img src="https://rentscan.ae/logo.png" alt="" />
    <div class="brand">RentScan</div>
    <div class="sub">Rent Safely</div>
    <div class="small">Timestamps are based on device time at moment of capture.</div>
  </div>
  </body></html>\``;

app = app.substring(0, templateStart) + newTemplate + app.substring(fullEnd);

// ============ 3. FIX SAVE: download instead of window.open ============
app = app.replace(
  `const url = URL.createObjectURL(window._dossierBlob);
                  const w = window.open(url, "_blank");
                  if (w) w.onload = () => setTimeout(() => w.print(), 500);`,
  `const url = URL.createObjectURL(window._dossierBlob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "RentScan-Dossier-" + (rental.company || "Rental").replace(/\\s+/g, "-") + ".html";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);`
);

fs.writeFileSync('src/App.jsx', app);

console.log('\nVerification:');
console.log('  Logo:', app.includes('rentscan.ae/logo.png') ? 'OK' : 'MISSING');
console.log('  Empty fields hidden:', app.includes('.filter(([l, v]) => v)') ? 'OK' : 'MISSING');
console.log('  Notes as bullets:', app.includes('includes("|")') ? 'OK' : 'MISSING');
console.log('  Download method:', app.includes('a.download = "RentScan-Dossier-"') ? 'OK' : 'MISSING');
