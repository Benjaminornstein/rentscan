const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');
let changes = [];

// 1. Change email label: remove "to receive a copy"
if (app.includes('to receive a copy')) {
  app = app.replace(/Your email \(optional[^)]*to receive a copy[^)]*\)/g, 'Your email (optional)');
  changes.push('Email label: removed "to receive a copy"');
}

// 2. Remove anonymous sharing checkbox/text
// Try multiple patterns
if (app.includes('Help improve RentScan')) {
  // Remove the entire div/section containing this text
  // Pattern: a div or label containing "Help improve RentScan"
  app = app.replace(/<[^>]*>[^<]*Help improve RentScan[^<]*<\/[^>]*>/g, '');
  // Also try removing a wrapper div around it
  app = app.replace(/\{[^{}]*Help improve RentScan[^{}]*\}/g, '');
  changes.push('Removed "Help improve RentScan" checkbox text');
}

if (app.includes('anonymous')) {
  // Remove lines containing anonymous sharing references
  const lines = app.split('\n');
  const before = lines.length;
  const filtered = lines.filter(line => {
    if (line.includes('anonymous') && line.includes('rental info')) return false;
    if (line.includes('No personal data is shared')) return false;
    return true;
  });
  if (filtered.length < before) {
    app = filtered.join('\n');
    changes.push('Removed anonymous sharing lines');
  }
}

// 3. Remove email send button states and UI
if (app.includes('dossierSending')) {
  app = app.replace(/\n\s*const \[dossierSending, setDossierSending\] = useState\(false\);/, '');
  app = app.replace(/\n\s*const \[dossierSent, setDossierSent\] = useState\(false\);/, '');
  app = app.replace(/\n\s*setDossierSent\(false\);/g, '');

  // Remove email button and success message by filtering lines
  const lines2 = app.split('\n');
  const filtered2 = lines2.filter(line => {
    const t = line.trim();
    if (t.includes('dossierSending') && !t.startsWith('//')) return false;
    if (t.includes('dossierSent') && !t.startsWith('//') && !t.includes('dossierSaved')) return false;
    if (t.includes('Email dossier to yourself')) return false;
    if (t.includes('Dossier sent to')) return false;
    return true;
  });
  app = filtered2.join('\n');
  changes.push('Removed email send button and states');
}

// 4. Add lead save when Generate Pickup Dossier is clicked
// Find where setDossierSaved(true) is called and add lead save before it
if (app.includes('setDossierSaved(true)') && !app.includes('api/lead')) {
  app = app.replace(
    'setDossierSaved(true);',
    `setDossierSaved(true);
            // Save email as lead
            if (dossierEmail) {
              fetch("/api/lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: dossierEmail, company: rental.company || "" }),
              }).catch(() => {});
            }`
  );
  changes.push('Added lead save on dossier generate');
}

// 5. Add /api/lead route to vercel.json
try {
  let vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  if (vercel.rewrites && !vercel.rewrites.some(r => r.source === '/api/lead')) {
    vercel.rewrites.push({ source: "/api/lead", destination: "/api/lead.js" });
    fs.writeFileSync('vercel.json', JSON.stringify(vercel, null, 2));
    changes.push('Added /api/lead route to vercel.json');
  }
} catch (e) {
  console.log('NOTE: Could not update vercel.json:', e.message);
}

fs.writeFileSync('src/App.jsx', app);

console.log('Changes made:');
changes.forEach(c => console.log('  + ' + c));
console.log('\nVerification:');
console.log('  "to receive a copy" present:', app.includes('to receive a copy'));
console.log('  "Help improve" present:', app.includes('Help improve RentScan'));
console.log('  dossierSending present:', app.includes('dossierSending'));
console.log('  lead save present:', app.includes('api/lead'));
