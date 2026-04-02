const fs = require('fs');
const { execSync } = require('child_process');

// 1. Get the FULL working App.jsx from last good commit
const oldApp = execSync('git show c401c3e:src/App.jsx', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });

// 2. Extract the complete dossier section from old version
// Find from after email input </div> to end of dossier card </div>
const oldEmailEnd = oldApp.indexOf('placeholder="your@email.com"');
const oldEmailLineEnd = oldApp.indexOf('</div>', oldApp.indexOf('</div>', oldEmailEnd) + 1);
// Go to end of that </div> line
let oldSectionStart = oldApp.indexOf('\n', oldEmailLineEnd) + 1;

// Find the end: "{!dossierSaved && " line + the </div> after it
const oldNotSaved = oldApp.indexOf('{!dossierSaved &&', oldSectionStart);
const oldSectionEnd = oldApp.indexOf('</div>', oldNotSaved);
const oldSectionEndLine = oldApp.indexOf('\n', oldSectionEnd) + 1;

const oldSection = oldApp.substring(oldSectionStart, oldSectionEndLine);
console.log('Extracted', oldSection.split('\n').length, 'lines from old commit');

// 3. Modify: remove share buttons, WhatsApp, keep only Save as PDF
let newSection = oldSection;

// Remove "Dossier ready! Now share it:" - change to just "Dossier ready!"
newSection = newSection.replace(/Dossier ready! Now share it:/, 'Dossier ready!');

// Remove the "Send to rental company" button block
const sendBtnStart = newSection.indexOf('{/* Send to rental company');
if (sendBtnStart !== -1) {
  const sendBtnEnd = newSection.indexOf('</button>', sendBtnStart) + 9;
  // Find the newline after </button>
  const sendBtnEndLine = newSection.indexOf('\n', sendBtnEnd) + 1;
  // Go back to start of comment line
  let sendLineStart = sendBtnStart;
  while (sendLineStart > 0 && newSection[sendLineStart - 1] !== '\n') sendLineStart--;
  newSection = newSection.substring(0, sendLineStart) + newSection.substring(sendBtnEndLine);
}

// Remove the flex container div around Save as PDF (make it standalone)
// Remove <div style={{ display: "flex"...}}>
newSection = newSection.replace(/<div style=\{\{ display: "flex", gap: "8px", marginBottom: "8px" \}\}>\n/, '');
// Remove matching </div>
// Find the </div> right after </button> for Save as PDF
const savePdfEnd = newSection.indexOf('Save as PDF');
const saveBtnEnd = newSection.indexOf('</button>', savePdfEnd);
const afterSaveBtn = newSection.indexOf('\n', saveBtnEnd);
const nextLine = newSection.substring(afterSaveBtn + 1, afterSaveBtn + 50).trim();
if (nextLine.startsWith('</div>')) {
  const divEnd = newSection.indexOf('</div>', afterSaveBtn);
  const divEndLine = newSection.indexOf('\n', divEnd) + 1;
  newSection = newSection.substring(0, afterSaveBtn + 1) + newSection.substring(divEndLine);
}

// Remove WhatsApp button block
const waComment = newSection.indexOf('{/* Share via WhatsApp');
if (waComment !== -1) {
  let waStart = waComment;
  while (waStart > 0 && newSection[waStart - 1] !== '\n') waStart--;
  const waEnd = newSection.indexOf('</button>', waComment) + 9;
  const waEndLine = newSection.indexOf('\n', waEnd) + 1;
  newSection = newSection.substring(0, waStart) + newSection.substring(waEndLine);
}

// Remove "On mobile" explanation text
newSection = newSection.replace(/\s*<p[^>]*>[^<]*On mobile[^<]*<\/p>\s*/g, '\n');

// Make Save as PDF full width instead of flex: 1
newSection = newSection.replace(/flex: 1, background: "#0A0E14"/, 'width: "100%", background: "#0A0E14"');

// Change Save as PDF styling to be more prominent
newSection = newSection.replace(
  /color: T\.sub, borderRadius: "12px", padding: "12px", fontSize: "13px"/,
  'color: T.sub, borderRadius: "12px", padding: "14px", fontSize: "15px"'
);

console.log('Modified section:', newSection.split('\n').length, 'lines');

// 4. Now replace the broken section in current App.jsx
let currentApp = fs.readFileSync('src/App.jsx', 'utf8');

const curEmailEnd = currentApp.indexOf('placeholder="your@email.com"');
const curEmailDivEnd = currentApp.indexOf('</div>', currentApp.indexOf('</div>', curEmailEnd) + 1);
let curSectionStart = currentApp.indexOf('\n', curEmailDivEnd) + 1;

const curNotSaved = currentApp.indexOf('{!dossierSaved &&', curSectionStart);
const curSectionEnd = currentApp.indexOf('</div>', curNotSaved);
const curSectionEndLine = currentApp.indexOf('\n', curSectionEnd) + 1;

console.log('Replacing lines', curSectionStart, 'to', curSectionEndLine, 'in current file');

currentApp = currentApp.substring(0, curSectionStart) + newSection + currentApp.substring(curSectionEndLine);

fs.writeFileSync('src/App.jsx', currentApp);

// 5. Verify
const hasGenerate = currentApp.includes('Generate Pickup Dossier');
const hasSavePdf = currentApp.includes('Save as PDF');
const hasDossierSaved = currentApp.includes('{dossierSaved && <>');
const hasShare = currentApp.includes('Send to rental company');
const hasWhatsApp = currentApp.includes('Share via WhatsApp');
const hasOnMobile = currentApp.includes('On mobile');
const hasLead = currentApp.includes('api/lead');

console.log('\nVerification:');
console.log('  Generate Pickup Dossier:', hasGenerate ? 'OK' : 'MISSING');
console.log('  Save as PDF:', hasSavePdf ? 'OK' : 'MISSING');
console.log('  dossierSaved block:', hasDossierSaved ? 'OK' : 'MISSING');
console.log('  Lead save:', hasLead ? 'OK' : 'MISSING');
console.log('  Send to rental company:', hasShare ? 'STILL THERE (bad)' : 'removed (good)');
console.log('  WhatsApp:', hasWhatsApp ? 'STILL THERE (bad)' : 'removed (good)');
console.log('  On mobile text:', hasOnMobile ? 'STILL THERE (bad)' : 'removed (good)');
