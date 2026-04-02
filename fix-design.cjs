const fs = require('fs');

// ============ PART 1: FIX EXTRACT PROMPT ============
let extract = fs.readFileSync('api/extract.js', 'utf8');

const oldPrompt = `Extract rental car contract data from this image. Return ONLY a JSON object with these fields, nothing else:

{
  "company": "rental company name",
  "car": "car model",
  "plate": "license plate number",
  "start": "start date",
  "end": "end date",
  "dailyPrice": "daily rate as number",
  "insurance": "insurance type",
  "excess": "excess/deductible as number",
  "mileage": "mileage limit",
  "fuel": "fuel policy",
  "deposit": "deposit amount as number",
  "notes": "any other important terms, fees, or conditions"
}

Use null for any field you cannot find. For number fields, use 0 if not found. Extract the actual values from the document.`;

const newPrompt = `Extract rental car contract data from this image. Return ONLY a JSON object, nothing else.

CRITICAL: Keep values SHORT. No full sentences. Just the data.

{
  "company": "Company name only, max 3 words (e.g. 'Hertz UAE', 'Speedy Drive')",
  "car": "Make and model only (e.g. 'Toyota Camry 2024', 'Audi RS3')",
  "plate": "Plate number only (e.g. 'Dubai Y25026')",
  "start": "DD-MM-YYYY format",
  "end": "DD-MM-YYYY format",
  "dailyPrice": "Number only, no currency (e.g. 150)",
  "insurance": "Type only, max 3 words (e.g. 'Basic CDW', 'Full coverage', 'Third party')",
  "excess": "Number only, no currency (e.g. 2000)",
  "mileage": "Short format (e.g. '250km/day', '1000 miles', 'Unlimited')",
  "fuel": "Short format (e.g. 'Full to full', 'Same to same', 'Prepaid')",
  "deposit": "Number only, no currency (e.g. 1500)",
  "notes": "Key terms ONLY as short bullet points. Max 200 chars. Only include unusual or important clauses."
}

Use null for any field you cannot find. For number fields (dailyPrice, excess, deposit), use just the number or 0.`;

if (extract.includes('Use null for any field you cannot find. For number fields, use 0 if not found.')) {
  extract = extract.replace(oldPrompt, newPrompt);
  fs.writeFileSync('api/extract.js', extract);
  console.log('Extract prompt updated: short clean values');
} else {
  console.log('WARNING: Could not find exact extract prompt text');
}

// ============ PART 2: REDESIGN DOSSIER TEMPLATE ============
let app = fs.readFileSync('src/App.jsx', 'utf8');

// Find the old template: from `<!DOCTYPE html>` to `</body></html>`;
const templateStart = app.indexOf('const html = `<!DOCTYPE html>');
const templateEnd = app.indexOf('</body></html>`;', templateStart);

if (templateStart === -1 || templateEnd === -1) {
  console.log('WARNING: Could not find dossier template');
  process.exit(1);
}

const fullEnd = templateEnd + '</body></html>`;'.length;

const newTemplate = `const html = \`<!DOCTYPE html><html><head><meta charset="utf-8"><title>RentScan Pickup Dossier - \${d.company || "Rental"}</title>
  <style>
  @page { size: A4; margin: 20mm; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display: none !important; } }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 40px 32px; background: #fff; }
  .header { display: flex; align-items: center; gap: 16px; margin-bottom: 8px; padding-bottom: 20px; border-bottom: 3px solid #C8962E; }
  .logo { font-size: 26px; font-weight: 800; color: #C8962E; letter-spacing: -0.5px; }
  .logo-sub { font-size: 9px; color: #999; letter-spacing: 3px; text-transform: uppercase; }
  .date { font-size: 13px; color: #888; margin-top: 2px; }
  .desc { font-size: 13px; color: #666; margin: 12px 0 28px; }
  h2 { font-size: 16px; font-weight: 700; color: #1a1a1a; margin: 28px 0 14px; padding-bottom: 6px; border-bottom: 1px solid #e0e0e0; text-transform: uppercase; letter-spacing: 0.5px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
  .field { border: 1px solid #e0e0e0; border-radius: 6px; padding: 10px 14px; background: #fafafa; }
  .field .label { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; font-weight: 600; margin-bottom: 3px; }
  .field .value { font-size: 14px; font-weight: 600; color: #1a1a1a; word-break: break-word; }
  .notes-field { border: 1px solid #e0e0e0; border-radius: 6px; padding: 12px 14px; background: #fafafa; margin-bottom: 20px; }
  .notes-field .label { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; font-weight: 600; margin-bottom: 4px; }
  .notes-field .value { font-size: 13px; color: #333; line-height: 1.6; }
  .photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 12px 0 20px; }
  .photo { border-radius: 6px; overflow: hidden; border: 1px solid #e0e0e0; }
  .photo img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
  .photo .info { padding: 6px 8px; background: #fafafa; text-align: center; }
  .photo .info strong { display: block; font-size: 10px; color: #333; }
  .photo .info .time { font-size: 9px; color: #999; }
  .notice { background: #FFF8EC; border: 1px solid #C8962E; border-left: 4px solid #C8962E; border-radius: 4px; padding: 14px 16px; margin: 28px 0; font-size: 12px; color: #666; line-height: 1.6; }
  .notice strong { color: #C8962E; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 2px solid #C8962E; text-align: center; }
  .footer .brand { font-size: 14px; font-weight: 800; color: #C8962E; letter-spacing: -0.3px; }
  .footer .tagline { font-size: 10px; color: #999; margin-top: 2px; letter-spacing: 2px; text-transform: uppercase; }
  .footer .small { font-size: 9px; color: #bbb; margin-top: 8px; }
  </style></head><body>

  <div class="header">
    <div>
      <div class="logo">RentScan</div>
      <div class="logo-sub">Rent Safely</div>
    </div>
    <div style="margin-left:auto;text-align:right">
      <div style="font-size:18px;font-weight:700">Pickup Dossier</div>
      <div class="date">\${dossierDate}</div>
    </div>
  </div>
  <div class="desc">Official record of vehicle condition at the time of pickup.</div>

  <h2>Rental Details</h2>
  <div class="grid">
  \${[["Company", d.company], ["Car", d.car], ["Plate", d.plate], ["Pickup", d.start], ["Return", d.end], ["Daily rate", d.dailyPrice ? "AED " + d.dailyPrice : "\\u2014"], ["Insurance", d.insurance], ["Excess", d.excess ? "AED " + d.excess : "\\u2014"], ["Mileage", d.mileage], ["Fuel", d.fuel], ["Deposit", d.deposit ? "AED " + d.deposit : "\\u2014"]].map(([l, v]) => \`<div class="field"><div class="label">\${l}</div><div class="value">\${v || "\\u2014"}</div></div>\`).join("")}
  </div>
  \${d.notes ? \`<div class="notes-field"><div class="label">Notes</div><div class="value">\${d.notes}</div></div>\` : ""}

  \${contractP.length > 0 ? \`<h2>Contract Documents</h2>
  <div style="font-size:12px;color:#888;margin-bottom:8px">\${contractP.length} photo\${contractP.length > 1 ? "s" : ""}</div>
  <div class="photos">\${contractP.map(p => \`<div class="photo"><img src="\${p.data}"/><div class="info"><strong>\${p.label}</strong><div class="time">\${p.time}</div></div></div>\`).join("")}</div>\` : ""}

  \${pickupP.length > 0 ? \`<h2>Vehicle Condition at Pickup</h2>
  <div style="font-size:12px;color:#888;margin-bottom:8px">\${pickupP.length} timestamped photo\${pickupP.length > 1 ? "s" : ""}</div>
  <div class="photos">\${pickupP.map(p => \`<div class="photo"><img src="\${p.data}"/><div class="info"><strong>\${p.label}</strong><div class="time">\${p.time}</div></div></div>\`).join("")}</div>\` : ""}

  <div class="notice"><strong>Notice to rental company:</strong> This dossier documents the vehicle condition at pickup with timestamped photographs. Any pre-existing damage shown above was present before the rental period began. The renter reserves the right to use this documentation in case of disputed charges.</div>

  <div class="footer">
    <div class="brand">RentScan</div>
    <div class="tagline">Rent Safely</div>
    <div class="small">Timestamps are based on device time at moment of capture.</div>
  </div>
  </body></html>\``;

app = app.substring(0, templateStart) + newTemplate + app.substring(fullEnd);
fs.writeFileSync('src/App.jsx', app);

// Verify
const hasTemplate = app.includes('Official record of vehicle condition');
const hasOldBlob = app.includes('www.rentscan.ae</div>');
const hasNewFooter = app.includes('class="brand">RentScan</div>');
const hasPageRule = app.includes('@page');

console.log('\nDossier template redesigned:');
console.log('  New professional design:', hasTemplate ? 'OK' : 'MISSING');
console.log('  Old footer removed:', !hasOldBlob ? 'OK' : 'STILL THERE');
console.log('  New branded footer:', hasNewFooter ? 'OK' : 'MISSING');
console.log('  Print CSS (@page):', hasPageRule ? 'OK' : 'MISSING');
