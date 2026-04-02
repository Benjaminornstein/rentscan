const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');
const changes = [];

// ============ 1. EMAIL LABEL ============
if (app.includes('to receive a copy')) {
  app = app.replace(/to receive a copy/g, '');
  // Clean up "optional — " or "optional – " leftover
  app = app.replace(/\(optional\s*[—–\-]\s*\)/g, '(optional)');
  changes.push('Cleaned email label');
}
// If it says "optional)" already without extra dash, leave it
if (!app.includes('(optional)') && app.includes('optional')) {
  app = app.replace(/\(optional[^)]*\)/, '(optional)');
}

// ============ 2. REMOVE ANONYMOUS CHECKBOX ============
// Remove the shareConsent state
app = app.replace(/\n\s*const \[shareConsent, setShareConsent\] = useState\([^)]*\);/g, '');

// Remove the label+checkbox block containing shareConsent
// Find the <label that contains setShareConsent and remove until </label>
const consentIdx = app.indexOf('setShareConsent');
if (consentIdx !== -1) {
  // Find the opening <label before it
  let labelStart = app.lastIndexOf('<label', consentIdx);
  // Find start of that line
  while (labelStart > 0 && app[labelStart - 1] !== '\n') labelStart--;
  // Find the closing </label>
  let labelEnd = app.indexOf('</label>', consentIdx);
  if (labelEnd !== -1) {
    labelEnd = app.indexOf('\n', labelEnd + 8) + 1;
    app = app.substring(0, labelStart) + app.substring(labelEnd);
    changes.push('Removed consent checkbox');
  }
}

// Also remove any "Help improve RentScan" text that might be separate
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
if (app.includes('dossierSending') || app.includes('dossierSent')) {
  // These might be referenced somewhere, remove those references too
  app = app.replace(/\n.*setDossierSent\(false\).*/g, '');
}
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
} else if (app.includes('api/lead')) {
  changes.push('Lead save already present');
}

// ============ 5. REMOVE RETURN INSPECTION ============
const returnIdx = app.indexOf('Return Inspection');
if (returnIdx !== -1) {
  // Find the card div that contains Return Inspection
  // Go backwards to find the opening of this section's card
  let searchBack = app.substring(Math.max(0, returnIdx - 3000), returnIdx);
  
  // The Return Inspection section is between the Pickup Inspection card and the Dossier Generation card
  // Find "Pickup Inspection" to know where it ends, and "DOSSIER GENERATION" or "Pickup Dossier" for where next section starts
  
  const pickupInspEnd = app.lastIndexOf('add photos manually', returnIdx);
  let sectionStart = returnIdx;
  if (pickupInspEnd !== -1) {
    // Find end of the pickup inspection section (the closing </div> of its card)
    let afterPickup = app.indexOf('</div>', pickupInspEnd);
    afterPickup = app.indexOf('\n', afterPickup) + 1;
    // There might be another </div> for the card
    let nextLine = app.substring(afterPickup, afterPickup + 100).trim();
    if (nextLine.startsWith('</div>')) {
      afterPickup = app.indexOf('\n', afterPickup + nextLine.indexOf('</div>') + 6) + 1;
    }
    sectionStart = afterPickup;
  }
  
  // Find where the Return section ends (before DOSSIER GENERATION or Pickup Dossier)
  let sectionEnd = app.indexOf('DOSSIER GENERATION', returnIdx);
  if (sectionEnd === -1) sectionEnd = app.indexOf('Pickup Dossier', returnIdx);
  if (sectionEnd !== -1) {
    // Go back to the start of the card div before this
    let beforeDossier = app.lastIndexOf('<div', sectionEnd);
    while (beforeDossier > 0 && app[beforeDossier - 1] !== '\n') beforeDossier--;
    // Go back more to find the comment or card start
    let prevLine = app.lastIndexOf('\n', beforeDossier - 2);
    let checkLine = app.substring(prevLine + 1, beforeDossier).trim();
    if (checkLine.startsWith('{/*') || checkLine === '') {
      beforeDossier = prevLine + 1;
    }
    sectionEnd = beforeDossier;
  }
  
  if (sectionStart < sectionEnd) {
    app = app.substring(0, sectionStart) + '\n' + app.substring(sectionEnd);
    changes.push('Removed Return Inspection section');
  }
}

// ============ 6. WEBSITE: REMOVE SHARE BUTTONS, KEEP SAVE AS PDF ============

// 6a. Change "Dossier ready! Now share it:" to "Dossier ready!"
app = app.replace('Dossier ready! Now share it:', 'Dossier ready!');

// 6b. Remove "Send to rental company" button
const sendBtn = app.indexOf('Send to rental company');
if (sendBtn !== -1) {
  // Find the comment before it
  let blockStart = app.lastIndexOf('{/* Send to rental company', sendBtn);
  if (blockStart === -1) blockStart = app.lastIndexOf('<button', sendBtn);
  // Go to start of line
  while (blockStart > 0 && app[blockStart - 1] !== '\n') blockStart--;
  // Find end: </button> after "Send to rental company"
  let blockEnd = app.indexOf('</button>', sendBtn) + 9;
  blockEnd = app.indexOf('\n', blockEnd) + 1;
  app = app.substring(0, blockStart) + app.substring(blockEnd);
  changes.push('Removed Send to rental company button');
}

// 6c. Remove WhatsApp button
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

// 6d. Remove "On mobile" text
app = app.replace(/\n\s*<p[^>]*>[^<]*On mobile[^<]*share menu[^<]*<\/p>/g, '');
changes.push('Removed On mobile text');

// 6e. Remove empty flex div wrapper around Save as PDF (if only child left)
// Find the <div style={{ display: "flex" around Save as PDF
const savePdfIdx = app.indexOf('Save as PDF');
if (savePdfIdx !== -1) {
  const flexDiv = app.lastIndexOf('display: "flex"', savePdfIdx);
  if (flexDiv !== -1 && (savePdfIdx - flexDiv) < 200) {
    let divStart = app.lastIndexOf('<div', flexDiv);
    while (divStart > 0 && app[divStart - 1] !== '\n') divStart--;
    let divLine = app.indexOf('\n', divStart);
    // Remove just the opening <div> line
    app = app.substring(0, divStart) + app.substring(divLine + 1);
    
    // Now find and remove the </div> after the Save as PDF </button>
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
    changes.push('Removed flex wrapper, Save as PDF standalone');
  }
  
  // Make Save as PDF full width
  app = app.replace(/flex: 1, background: "#0A0E14"/, 'width: "100%", background: "#0A0E14"');
  app = app.replace(
    /color: T\.sub, borderRadius: "12px", padding: "12px", fontSize: "13px"/,
    'color: T.sub, borderRadius: "12px", padding: "14px", fontSize: "15px"'
  );
}

// ============ FINAL CLEANUP ============
// Remove multiple consecutive blank lines (max 1)
app = app.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync('src/App.jsx', app);

// ============ VERIFICATION ============
console.log('Changes applied:');
changes.forEach(c => console.log('  + ' + c));

const checks = {
  'Generate Pickup Dossier button': app.includes('Generate Pickup Dossier'),
  'Save as PDF button': app.includes('Save as PDF'),
  'dossierSaved block': app.includes('{dossierSaved && <>') || app.includes('{dossierSaved &&'),
  'Lead save (/api/lead)': app.includes('api/lead'),
  'Email label (optional)': app.includes('(optional)'),
  'Dossier HTML generation': app.includes('_dossierBlob') && app.includes('setDossierSaved(true)'),
};

const bads = {
  'Send to rental company': app.includes('Send to rental company'),
  'WhatsApp share button': app.includes('Share via WhatsApp'),
  'On mobile text': /On mobile.*share menu/.test(app),
  'Return Inspection': app.includes('Return Inspection'),
  'dossierSending state': app.includes('dossierSending'),
  'to receive a copy': app.includes('to receive a copy'),
};

console.log('\nShould be present:');
Object.entries(checks).forEach(([k, v]) => console.log(`  ${v ? 'OK' : 'MISSING'} ${k}`));

console.log('\nShould be removed:');
Object.entries(bads).forEach(([k, v]) => console.log(`  ${v ? 'STILL THERE' : 'removed'} ${k}`));

const allGood = Object.values(checks).every(v => v) && Object.values(bads).every(v => !v);
console.log(allGood ? '\n=== ALL GOOD - safe to push ===' : '\n=== ISSUES FOUND - check above ===');
