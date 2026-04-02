const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');
const changes = [];

// ============ 1. EMAIL LABEL ============
if (app.includes('to receive a copy')) {
  app = app.replace(/to receive a copy/g, '');
  app = app.replace(/\(optional\s*[—–\-]\s*\)/g, '(optional)');
  changes.push('Cleaned email label');
}
if (!app.includes('(optional)') && app.includes('optional')) {
  app = app.replace(/\(optional[^)]*\)/, '(optional)');
}

// ============ 2. REMOVE ANONYMOUS CHECKBOX ============
app = app.replace(/\n\s*const \[shareConsent, setShareConsent\] = useState\([^)]*\);/g, '');
const consentIdx = app.indexOf('setShareConsent');
if (consentIdx !== -1) {
  let labelStart = app.lastIndexOf('<label', consentIdx);
  while (labelStart > 0 && app[labelStart - 1] !== '\n') labelStart--;
  let labelEnd = app.indexOf('</label>', consentIdx);
  if (labelEnd !== -1) {
    labelEnd = app.indexOf('\n', labelEnd + 8) + 1;
    app = app.substring(0, labelStart) + app.substring(labelEnd);
    changes.push('Removed consent checkbox');
  }
}
const helpIdx = app.indexOf('Help improve RentScan');
if (helpIdx !== -1) {
  let lineStart = helpIdx;
  while (lineStart > 0 && app[lineStart - 1] !== '\n') lineStart--;
  let lineEnd = app.indexOf('\n', helpIdx) + 1;
  app = app.substring(0, lineStart) + app.substring(lineEnd);
  changes.push('Removed Help improve text');
}

// ============ 3. REMOVE EMAIL SEND STATES ============
app = app.replace(/\n\s*const \[dossierSending, setDossierSending\] = useState\([^)]*\);/g, '');
app = app.replace(/\n\s*const \[dossierSent, setDossierSent\] = useState\([^)]*\);/g, '');
app = app.replace(/\n.*setDossierSent\(false\).*/g, '');
changes.push('Cleaned email send states');

// ============ 4. ADD LEAD SAVE ============
if (!app.includes('api/lead') && app.includes('setDossierSaved(true)')) {
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
  changes.push('Added lead save');
} else {
  changes.push('Lead save already present');
}

// ============ 5. "Dossier ready" TEXT ============
app = app.replace('Dossier ready! Now share it:', 'Dossier ready!');

// ============ 6. REMOVE "Send to rental company" BUTTON ============
const sendBtn = app.indexOf('Send to rental company');
if (sendBtn !== -1) {
  let blockStart = app.lastIndexOf('{/* Send to rental company', sendBtn);
  if (blockStart === -1) blockStart = app.lastIndexOf('<button', sendBtn);
  while (blockStart > 0 && app[blockStart - 1] !== '\n') blockStart--;
  let blockEnd = app.indexOf('</button>', sendBtn) + 9;
  blockEnd = app.indexOf('\n', blockEnd) + 1;
  app = app.substring(0, blockStart) + app.substring(blockEnd);
  changes.push('Removed Send to rental company button');
}

// ============ 7. REMOVE WHATSAPP BUTTON ============
const waIdx = app.indexOf('Share via WhatsApp');
if (waIdx !== -1) {
  let waStart = app.lastIndexOf('{/* Share via WhatsApp', waIdx);
  if (waStart === -1) waStart = app.lastIndexOf('<button', waIdx);
  while (waStart > 0 && app[waStart - 1] !== '\n') waStart--;
  let waEnd = app.indexOf('</button>', waIdx) + 9;
  waEnd = app.indexOf('\n', waEnd) + 1;
  app = app.substring(0, waStart) + app.substring(waEnd);
  changes.push('Removed WhatsApp button');
}

// ============ 8. REMOVE "On mobile" TEXT ============
app = app.replace(/\n\s*<p[^>]*>[^<]*On mobile[^<]*share menu[^<]*<\/p>/g, '');
changes.push('Removed On mobile text');

// ============ 9. SAVE AS PDF: remove flex wrapper, full width ============
const savePdfIdx = app.indexOf('Save as PDF');
if (savePdfIdx !== -1) {
  const flexDiv = app.lastIndexOf('display: "flex"', savePdfIdx);
  if (flexDiv !== -1 && (savePdfIdx - flexDiv) < 200) {
    let divStart = app.lastIndexOf('<div', flexDiv);
    while (divStart > 0 && app[divStart - 1] !== '\n') divStart--;
    let divLine = app.indexOf('\n', divStart);
    app = app.substring(0, divStart) + app.substring(divLine + 1);

    const newSavePdfIdx = app.indexOf('Save as PDF');
    const btnEnd = app.indexOf('</button>', newSavePdfIdx);
    const afterBtn = app.indexOf('\n', btnEnd) + 1;
    const nextLines = app.substring(afterBtn, afterBtn + 100);
    const closeDivMatch = nextLines.match(/^\s*<\/div>/);
    if (closeDivMatch) {
      const closeDivEnd = afterBtn + closeDivMatch[0].length;
      const closeDivLineEnd = app.indexOf('\n', closeDivEnd) + 1;
      app = app.substring(0, afterBtn) + app.substring(closeDivLineEnd);
    }
    changes.push('Removed flex wrapper');
  }
  app = app.replace(/flex: 1, background: "#0A0E14"/, 'width: "100%", background: "#0A0E14"');
  app = app.replace(
    /color: T\.sub, borderRadius: "12px", padding: "12px", fontSize: "13px"/,
    'color: T.sub, borderRadius: "12px", padding: "14px", fontSize: "15px"'
  );
}

// ============ CLEANUP ============
app = app.replace(/\n{3,}/g, '\n\n');
fs.writeFileSync('src/App.jsx', app);

// ============ VERIFICATION ============
console.log('Changes:');
changes.forEach(c => console.log('  + ' + c));

const ok = {
  'Generate Pickup Dossier': app.includes('Generate Pickup Dossier'),
  'Save as PDF': app.includes('Save as PDF'),
  'dossierSaved block': app.includes('dossierSaved'),
  'Lead save': app.includes('api/lead'),
  'Email label': app.includes('(optional)'),
  'Dossier generation': app.includes('setDossierSaved(true)'),
};
const bad = {
  'Send to rental company': app.includes('Send to rental company'),
  'WhatsApp share': app.includes('Share via WhatsApp'),
  'On mobile text': /On mobile.*share menu/.test(app),
  'dossierSending': app.includes('dossierSending'),
  'to receive a copy': app.includes('to receive a copy'),
};

console.log('\nPresent (should be OK):');
Object.entries(ok).forEach(([k, v]) => console.log(`  ${v ? 'OK' : 'MISSING'} ${k}`));
console.log('\nRemoved (should be removed):');
Object.entries(bad).forEach(([k, v]) => console.log(`  ${v ? 'STILL THERE' : 'removed'} ${k}`));

const allGood = Object.values(ok).every(v => v) && Object.values(bad).every(v => !v);
console.log(allGood ? '\n=== ALL GOOD ===' : '\n=== ISSUES ===');
