const fs = require('fs');

let app = fs.readFileSync('src/App.jsx', 'utf8');
const changes = [];

// Read logo for embedding
const logoPath = 'public/logo.png';
let base64Logo = '';
if (fs.existsSync(logoPath)) {
  const logo = fs.readFileSync(logoPath);
  base64Logo = 'data:image/png;base64,' + logo.toString('base64');
  changes.push('Logo loaded (' + Math.round(logo.length / 1024) + 'KB)');
} else {
  console.log('WARNING: logo.png not found');
}

// ============ 1. REMOVE "to receive a copy" ============
app = app.replace(/to receive a copy/g, '');
app = app.replace(/\(optional\s*[—–\-]\s*\)/g, '(optional)');
if (!app.includes('(optional)') && app.includes('optional')) {
  app = app.replace(/\(optional[^)]*\)/, '(optional)');
}
changes.push('Email label cleaned');

// ============ 2. REMOVE shareConsent CHECKBOX ============
// Remove the checkbox input
app = app.replace(/<input type="checkbox" checked=\{shareConsent\}[^/]*\/>/g, '');
// Remove the Help improve span
app = app.replace(/<span>Help improve RentScan[^<]*<strong[^<]*<\/strong>[^<]*<\/span>/g, '');
// Find and remove the label wrapper that contained the checkbox
// It's a <label> with display flex that now has no content
const labelIdx = app.indexOf('setShareConsent');
if (labelIdx !== -1) {
  let lStart = app.lastIndexOf('<label', labelIdx);
  let lEnd = app.indexOf('</label>', labelIdx);
  if (lStart !== -1 && lEnd !== -1) {
    // Go to start of line
    while (lStart > 0 && app[lStart - 1] !== '\n') lStart--;
    lEnd = app.indexOf('\n', lEnd + 8) + 1;
    app = app.substring(0, lStart) + app.substring(lEnd);
    changes.push('Removed shareConsent checkbox block');
  }
} else {
  // If setShareConsent is gone but shareConsent declaration remains
  changes.push('shareConsent checkbox already removed or not found');
}

// ============ 3. REMOVE Return Inspection ============
const lines = app.split('\n');
const filteredLines = lines.filter(line => !line.includes('Return Inspection'));
if (filteredLines.length < lines.length) {
  app = filteredLines.join('\n');
  changes.push('Removed Return Inspection');
} else {
  changes.push('Return Inspection not found');
}

// ============ 4. ADD LEAD SAVE ============
if (!app.includes('api/lead') && app.includes('setDossierSaved(true)')) {
  app = app.replace(
    'setDossierSaved(true);',
    `setDossierSaved(true);
            // Save email as lead
            if (dossierEmail) {
              fetch("https://rentscan.ae/api/lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: dossierEmail, company: rental.company || "" }),
              }).catch(() => {});
            }`
  );
  changes.push('Added lead save (absolute URL)');
} else if (app.includes('api/lead')) {
  // Make sure it's absolute
  app = app.replace('fetch("/api/lead"', 'fetch("https://rentscan.ae/api/lead"');
  changes.push('Lead save already present');
}

// ============ 5. REPLACE DOSSIER TEMPLATE ============
const tplStart = app.indexOf('const html = `<!DOCTYPE html>');
const tplEnd = app.indexOf('</body></html>`;', tplStart);

if (tplStart !== -1 && tplEnd !== -1) {
  const fullEnd = tplEnd + '</body></html>`;'.length;

  // New professional template with embedded logo
  const logoTag = base64Logo ? `<img src="${base64Logo}" alt="RentScan" />` : '';
  const logoFooterTag = base64Logo ? `<img src="${base64Logo}" alt="" />` : '';

  const newTemplate = 'const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>RentScan Dossier - ${d.company || "Rental"}</title>\n'
    + '  <style>\n'
    + '  @page { size: A4; margin: 18mm; }\n'
    + '  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }\n'
    + '  * { margin: 0; padding: 0; box-sizing: border-box; }\n'
    + '  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; color: #222; max-width: 780px; margin: 0 auto; padding: 36px 28px; background: #fff; }\n'
    + '  .header { display: flex; align-items: center; gap: 14px; padding-bottom: 18px; border-bottom: 2px solid #C8962E; margin-bottom: 8px; }\n'
    + '  .header img { width: 48px; height: 48px; border-radius: 12px; }\n'
    + '  .header .brand { font-size: 22px; font-weight: 800; color: #C8962E; letter-spacing: -0.5px; }\n'
    + '  .header .sub { font-size: 8px; color: #aaa; letter-spacing: 3px; text-transform: uppercase; }\n'
    + '  .header .right { margin-left: auto; text-align: right; }\n'
    + '  .header .title { font-size: 17px; font-weight: 700; color: #222; }\n'
    + '  .header .date { font-size: 12px; color: #999; margin-top: 2px; }\n'
    + '  .desc { font-size: 12px; color: #888; margin: 10px 0 24px; }\n'
    + '  h2 { font-size: 13px; font-weight: 700; color: #222; margin: 24px 0 10px; padding-bottom: 5px; border-bottom: 1px solid #e5e5e5; text-transform: uppercase; letter-spacing: 1px; }\n'
    + '  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }\n'
    + '  .field { border: 1px solid #e5e5e5; border-radius: 5px; padding: 8px 12px; }\n'
    + '  .field .label { font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: #aaa; font-weight: 700; }\n'
    + '  .field .value { font-size: 13px; font-weight: 600; color: #222; margin-top: 2px; }\n'
    + '  .notes { border: 1px solid #e5e5e5; border-radius: 5px; padding: 10px 14px; margin-bottom: 16px; }\n'
    + '  .notes .label { font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: #aaa; font-weight: 700; margin-bottom: 6px; }\n'
    + '  .notes ul { list-style: none; padding: 0; }\n'
    + '  .notes li { font-size: 12px; color: #444; line-height: 1.4; padding: 3px 0 3px 14px; position: relative; }\n'
    + '  .notes li:before { content: "\\u2022"; color: #C8962E; font-weight: 700; position: absolute; left: 0; }\n'
    + '  .notes p { font-size: 12px; color: #444; line-height: 1.5; }\n'
    + '  .photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 8px 0 16px; }\n'
    + '  .photo { border-radius: 5px; overflow: hidden; border: 1px solid #e5e5e5; }\n'
    + '  .photo img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }\n'
    + '  .photo .cap { padding: 5px 6px; background: #fafafa; text-align: center; font-size: 9px; color: #666; }\n'
    + '  .photo .cap strong { display: block; font-size: 10px; color: #333; }\n'
    + '  .notice { background: #FFF8EC; border-left: 3px solid #C8962E; border-radius: 3px; padding: 12px 14px; margin: 24px 0; font-size: 11px; color: #777; line-height: 1.5; }\n'
    + '  .notice strong { color: #C8962E; }\n'
    + '  .footer { margin-top: 36px; padding-top: 14px; border-top: 2px solid #C8962E; text-align: center; }\n'
    + '  .footer img { width: 32px; height: 32px; border-radius: 8px; margin-bottom: 4px; }\n'
    + '  .footer .brand { font-size: 13px; font-weight: 800; color: #C8962E; }\n'
    + '  .footer .sub { font-size: 8px; color: #bbb; letter-spacing: 2px; text-transform: uppercase; }\n'
    + '  .footer .small { font-size: 8px; color: #ccc; margin-top: 6px; }\n'
    + '  </style></head><body>\n'
    + '\n'
    + '  <div class="header">\n'
    + '    ' + logoTag + '\n'
    + '    <div>\n'
    + '      <div class="brand">RentScan</div>\n'
    + '      <div class="sub">Rent Safely</div>\n'
    + '    </div>\n'
    + '    <div class="right">\n'
    + '      <div class="title">Pickup Dossier</div>\n'
    + '      <div class="date">${dossierDate}</div>\n'
    + '    </div>\n'
    + '  </div>\n'
    + '  <div class="desc">Official record of vehicle condition at pickup.</div>\n'
    + '\n'
    + '  <h2>Rental Details</h2>\n'
    + '  <div class="grid">\n'
    + '  ${[["Company", d.company], ["Car", d.car], ["Plate", d.plate], ["Pickup", d.start], ["Return", d.end], ["Daily rate", d.dailyPrice ? "AED " + d.dailyPrice : null], ["Insurance", d.insurance], ["Excess", d.excess ? "AED " + d.excess : null], ["Mileage", d.mileage], ["Fuel", d.fuel], ["Deposit", d.deposit ? "AED " + d.deposit : null]].filter(([l, v]) => v).map(([l, v]) => `<div class="field"><div class="label">${l}</div><div class="value">${v}</div></div>`).join("")}\n'
    + '  </div>\n'
    + '  ${d.notes ? `<div class="notes"><div class="label">Key Terms</div>${d.notes.includes("|") ? "<ul>" + d.notes.split("|").map(n => n.trim()).filter(n => n).map(n => "<li>" + n + "</li>").join("") + "</ul>" : "<p>" + d.notes + "</p>"}</div>` : ""}\n'
    + '\n'
    + '  ${contractP.length > 0 ? `<h2>Contract Documents</h2>\n'
    + '  <div class="photos">${contractP.map(p => `<div class="photo"><img src="${p.data}"/><div class="cap"><strong>${p.label}</strong>${p.time}</div></div>`).join("")}</div>` : ""}\n'
    + '\n'
    + '  ${pickupP.length > 0 ? `<h2>Vehicle Condition at Pickup</h2>\n'
    + '  <div class="photos">${pickupP.map(p => `<div class="photo"><img src="${p.data}"/><div class="cap"><strong>${p.label}</strong>${p.time}</div></div>`).join("")}</div>` : ""}\n'
    + '\n'
    + '  <div class="notice"><strong>Notice to rental company:</strong> This dossier documents the vehicle condition at pickup with timestamped photographs. Any pre-existing damage shown above was present before the rental period began. The renter reserves the right to use this documentation in case of disputed charges.</div>\n'
    + '\n'
    + '  <div class="footer">\n'
    + '    ' + logoFooterTag + '\n'
    + '    <div class="brand">RentScan</div>\n'
    + '    <div class="sub">Rent Safely</div>\n'
    + '    <div class="small">Timestamps are based on device time at moment of capture.</div>\n'
    + '  </div>\n'
    + '  </body></html>`;';

  app = app.substring(0, tplStart) + newTemplate + app.substring(fullEnd);
  changes.push('Dossier template replaced (professional design, logo embedded, hidden empty fields, bullet notes)');
} else {
  console.log('ERROR: Could not find dossier template');
}

// ============ WRITE AND VERIFY ============
fs.writeFileSync('src/App.jsx', app, 'utf8');

console.log('\nChanges applied:');
changes.forEach(c => console.log('  + ' + c));

// Comprehensive verification
const checks = {
  'Chat (chatMessages)': app.includes('chatMessages'),
  'Chat (followUp)': app.includes('handleFollowUp'),
  'Terms disclaimer (termsUsed)': app.includes('termsUsed'),
  'Generate Pickup Dossier': app.includes('Generate Pickup Dossier'),
  'Send to rental company': app.includes('Send to rental company'),
  'WhatsApp': app.includes('wa.me'),
  'Save as PDF': app.includes('Save as PDF'),
  'Lead save': app.includes('rentscan.ae/api/lead'),
  'Absolute scan URL': app.includes('rentscan.ae/api/scan'),
  'New dossier design': app.includes('Official record of vehicle condition'),
  'Logo embedded': app.includes('data:image/png;base64'),
  'Hidden empty fields (.filter)': app.includes('.filter(([l, v]) => v)'),
  'Bullet notes': app.includes('includes("|")'),
};

const shouldBeGone = {
  'Return Inspection': app.includes('Return Inspection'),
  '"to receive a copy"': app.includes('to receive a copy'),
  '"Help improve RentScan"': app.includes('Help improve RentScan'),
  'Old footer (www.rentscan.ae)': app.includes('>www.rentscan.ae</'),
  'Old badge (RENTSCAN.AE)': app.includes('class="badge">RENTSCAN.AE'),
};

console.log('\nShould be PRESENT:');
Object.entries(checks).forEach(([k, v]) => console.log(`  ${v ? 'OK' : 'MISSING!'} ${k}`));

console.log('\nShould be REMOVED:');
Object.entries(shouldBeGone).forEach(([k, v]) => console.log(`  ${v ? 'STILL THERE!' : 'removed'} ${k}`));

const allPresent = Object.values(checks).every(v => v);
const allRemoved = Object.values(shouldBeGone).every(v => !v);
console.log(allPresent && allRemoved ? '\n=== ALL GOOD ===' : '\n=== ISSUES FOUND ===');
