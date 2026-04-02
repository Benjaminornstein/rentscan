const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

// Add email sending state
if (!app.includes('dossierSending')) {
  app = app.replace(
    'const [dossierSaved, setDossierSaved] = useState(false);',
    `const [dossierSaved, setDossierSaved] = useState(false);
  const [dossierSending, setDossierSending] = useState(false);
  const [dossierSent, setDossierSent] = useState(false);`
  );
}

// Find the dossierSaved section and add email send button
// Look for the existing "Send to rental company" area and add "Email my dossier" before it
const emailButton = `
            {/* Email dossier to yourself */}
            {dossierEmail && !dossierSent && (
              <button onClick={async () => {
                if (!dossierEmail || !window._dossierBlob) return;
                setDossierSending(true);
                try {
                  const html = await window._dossierBlob.text();
                  const resp = await fetch("/api/email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      to: dossierEmail,
                      subject: "Your RentScan Pickup Dossier - " + (rental.company || "Rental"),
                      html: html,
                    }),
                  });
                  const data = await resp.json();
                  if (data.success) {
                    setDossierSent(true);
                  } else {
                    alert("Could not send email: " + (data.error || "Unknown error"));
                  }
                } catch (err) {
                  alert("Could not send email. Check your internet connection.");
                } finally {
                  setDossierSending(false);
                }
              }} disabled={dossierSending} style={{
                width: "100%", padding: "14px", borderRadius: "12px", border: "none",
                background: dossierSending ? "#555" : "linear-gradient(135deg, #C9A227, #B8860B)",
                color: "#fff", fontWeight: 700, fontSize: "15px", cursor: dossierSending ? "not-allowed" : "pointer",
                marginBottom: "10px",
              }}>
                {dossierSending ? "Sending..." : "\u2709\uFE0F Email dossier to " + dossierEmail}
              </button>
            )}
            {dossierSent && (
              <div style={{ padding: "12px", borderRadius: "10px", backgroundColor: "rgba(100,200,100,0.1)", border: "1px solid rgba(100,200,100,0.2)", textAlign: "center", fontSize: "14px", color: "#7cb87c", marginBottom: "10px" }}>
                \u2705 Dossier sent to {dossierEmail}
              </div>
            )}`;

// Insert after dossierSaved check opens
if (app.includes('{dossierSaved && <>')) {
  app = app.replace(
    '{dossierSaved && <>',
    '{dossierSaved && <>' + emailButton
  );
  console.log('Email send button added to dossier section');
} else {
  console.log('WARNING: Could not find dossierSaved section');
}

// Reset dossierSent when generating new dossier
app = app.replace(
  'setDossierSaved(true);',
  'setDossierSaved(true);\n            setDossierSent(false);'
);

fs.writeFileSync('src/App.jsx', app);
console.log('Done! Email sending added to dossier.');

// Also add email.js route to vercel.json if needed
try {
  let vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  const hasEmail = vercel.rewrites && vercel.rewrites.some(r => r.source === '/api/email');
  if (!hasEmail && vercel.rewrites) {
    vercel.rewrites.push({ source: "/api/email", destination: "/api/email.js" });
    fs.writeFileSync('vercel.json', JSON.stringify(vercel, null, 2));
    console.log('Added /api/email route to vercel.json');
  } else if (!hasEmail) {
    console.log('NOTE: Check vercel.json - may need /api/email route');
  } else {
    console.log('vercel.json already has /api/email route');
  }
} catch {
  console.log('NOTE: Could not update vercel.json automatically');
}
