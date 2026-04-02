const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

// Find the exact broken block and remove it
// It starts after "{dossierSaved && <>" with a button onClick
// and ends before the "Dossier ready" paragraph

const startMarker = '{dossierSaved && <>';
const endMarker = 'Dossier ready';

const startIdx = app.indexOf(startMarker);
if (startIdx === -1) {
  console.log('ERROR: Could not find dossierSaved block');
  process.exit(1);
}

const afterStart = startIdx + startMarker.length;
const endIdx = app.indexOf(endMarker, afterStart);
if (endIdx === -1) {
  console.log('ERROR: Could not find "Dossier ready" marker');
  process.exit(1);
}

// Find the start of the line containing "Dossier ready"
let lineStart = endIdx;
while (lineStart > 0 && app[lineStart - 1] !== '\n') lineStart--;

// Everything between afterStart and lineStart is the broken email button block
const removedBlock = app.substring(afterStart, lineStart);
console.log('Removing', removedBlock.split('\n').length, 'lines of broken email code');

// Replace: keep dossierSaved && <> and jump to the Dossier ready line
app = app.substring(0, afterStart) + '\n' + app.substring(lineStart);

fs.writeFileSync('src/App.jsx', app);

// Verify
const stillBroken = app.includes('setDossierSending') || app.includes('Could not send email');
const hasShare = app.includes('navigator.share');
const hasDossierReady = app.includes('Dossier ready');
console.log(stillBroken ? 'WARNING: Still has broken code' : 'Clean! Broken email code removed.');
console.log('Share button:', hasShare ? 'OK' : 'MISSING');
console.log('Dossier ready text:', hasDossierReady ? 'OK' : 'MISSING');
