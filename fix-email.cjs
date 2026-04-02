const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

// Find the existing email send onClick handler and replace it
// The current code sends { to, subject, html } — we need to send the dossier as attachment instead
const oldFetch = `const html = await window._dossierBlob.text();
                  const resp = await fetch("/api/email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      to: dossierEmail,
                      subject: "Your RentScan Pickup Dossier - " + (rental.company || "Rental"),
                      html: html,
                    }),
                  });`;

const newFetch = `const dossierHtml = await window._dossierBlob.text();
                  const base64 = btoa(unescape(encodeURIComponent(dossierHtml)));
                  const resp = await fetch("/api/email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      to: dossierEmail,
                      subject: "Your RentScan Pickup Dossier - " + (rental.company || "Rental"),
                      html: "<div style=\\"font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px\\"><h2 style=\\"color:#C9A227\\">Your RentScan Dossier</h2><p>Your pickup dossier for <strong>" + (rental.company || "your rental") + "</strong> is attached to this email.</p><p>Open the attached HTML file in any browser to view your full dossier with all photos and details.</p><hr style=\\"border:none;border-top:1px solid #eee;margin:20px 0\\"><p style=\\"font-size:12px;color:#999\\">RentScan — Rent safely in Dubai.<br>This is an automated email. Do not reply.</p></div>",
                      attachment: {
                        content: base64,
                        filename: "RentScan-Dossier-" + (rental.company || "Rental").replace(/\\s+/g, "-") + ".html",
                      },
                    }),
                  });`;

if (app.includes(oldFetch)) {
  app = app.replace(oldFetch, newFetch);
  console.log('Updated email sending to use attachment.');
} else {
  console.log('WARNING: Could not find exact email fetch code. Trying broader match...');
  // Try matching just the key part
  app = app.replace(
    /const html = await window\._dossierBlob\.text\(\);/,
    'const dossierHtml = await window._dossierBlob.text();\n                  const base64 = btoa(unescape(encodeURIComponent(dossierHtml)));'
  );
  app = app.replace(
    /subject: "Your RentScan Pickup Dossier - " \+ \(rental\.company \|\| "Rental"\),\s*\n\s*html: html,/,
    `subject: "Your RentScan Pickup Dossier - " + (rental.company || "Rental"),
                      html: "<div style=\\"font-family:sans-serif;padding:20px\\"><h2 style=\\"color:#C9A227\\">Your RentScan Dossier</h2><p>Your dossier for <strong>" + (rental.company || "your rental") + "</strong> is attached.</p><p>Open the HTML file in any browser to view photos and details.</p><p style=\\"font-size:12px;color:#999\\">RentScan - Rent safely in Dubai.</p></div>",
                      attachment: { content: base64, filename: "RentScan-Dossier-" + (rental.company || "Rental").replace(/\\\\s+/g, "-") + ".html" },`
  );
  console.log('Applied broader match replacement.');
}

fs.writeFileSync('src/App.jsx', app);
console.log('Done! Dossier will now be sent as email attachment with all photos.');
