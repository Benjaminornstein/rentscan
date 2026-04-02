const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');
let changes = [];

// 1. Remove the lone checkbox (✅ without text after anonymous text was removed)
// It's likely a standalone checkbox element or a ✅ emoji on its own
// Look for common patterns
const checkboxPatterns = [
  // Standalone checkbox input near dossier
  /\s*<input[^>]*type=["']checkbox["'][^>]*checked[^>]*\/?>(?:\s*<label[^>]*>[^<]*<\/label>)?/g,
  // Lone ✅ div/span
  /\s*<(?:div|span|p)[^>]*>\s*(?:✅|âœ…)\s*<\/(?:div|span|p)>/g,
];

for (const pattern of checkboxPatterns) {
  if (pattern.test(app)) {
    app = app.replace(pattern, '');
    changes.push('Removed checkbox element');
    break;
  }
}

// Also try: if there's a state for the checkbox consent, remove it
// And look for the checkbox near the Generate button
if (app.includes('consent') || app.includes('shareData') || app.includes('agreeShare')) {
  app = app.replace(/\n\s*const \[(?:consent|shareData|agreeShare)[^\n]*\n/g, '\n');
  changes.push('Removed consent state');
}

// 2. Remove "Send to rental company" button (the navigator.share one)
// Find the button that contains "Send to rental company"
const shareButtonStart = app.indexOf('Send to rental company');
if (shareButtonStart !== -1) {
  // Find the <button that contains this text
  let searchBack = shareButtonStart;
  while (searchBack > 0 && !app.substring(searchBack - 50, searchBack).includes('<button')) searchBack--;
  const btnStart = app.lastIndexOf('<button', shareButtonStart);
  
  // Find the closing </button> after this
  // But the onClick might have nested braces, so find the matching </button>
  const btnEnd = app.indexOf('</button>', shareButtonStart);
  if (btnStart !== -1 && btnEnd !== -1) {
    // Find the start of the line
    let lineStart = btnStart;
    while (lineStart > 0 && app[lineStart - 1] !== '\n') lineStart--;
    
    const removed = app.substring(lineStart, btnEnd + 9);
    app = app.substring(0, lineStart) + app.substring(btnEnd + 9);
    changes.push('Removed "Send to rental company" button');
  }
}

// Also remove the comment line before it
app = app.replace(/\s*\{\/\* Send to rental company via Share API or mailto \*\/\}\s*/g, '\n');

// 3. Remove WhatsApp button
const waStart = app.indexOf('WhatsApp');
if (waStart !== -1) {
  // Find the button/div containing WhatsApp
  const waBtnStart = app.lastIndexOf('<button', waStart);
  const waBtnEnd = app.indexOf('</button>', waStart);
  if (waBtnStart !== -1 && waBtnEnd !== -1 && (waStart - waBtnStart) < 500) {
    let lineStart = waBtnStart;
    while (lineStart > 0 && app[lineStart - 1] !== '\n') lineStart--;
    app = app.substring(0, lineStart) + app.substring(waBtnEnd + 9);
    changes.push('Removed WhatsApp button');
  }
}

// 4. Remove the "On mobile: Send to rental company opens your share menu" text
app = app.replace(/<p[^>]*>[^<]*On mobile[^<]*share menu[^<]*<\/p>/g, '');
changes.push('Removed share menu explanation text');

// 5. Remove Return Inspection section
// Look for "Return Inspection" heading
const returnIdx = app.indexOf('Return Inspection');
if (returnIdx !== -1) {
  // Find the containing section/div - go back to find the opening
  // The section likely starts with a div that has a border or card style
  let sectionStart = returnIdx;
  // Go back to find the parent div (look for a div with style that looks like a card)
  let depth = 0;
  for (let i = returnIdx; i >= 0; i--) {
    if (app[i] === '>') depth++;
    if (app[i] === '<') {
      depth--;
      if (depth <= -2) {
        sectionStart = i;
        break;
      }
    }
  }
  
  // Actually, let's find it more reliably by looking for the pattern
  // The return inspection is in a similar card div as pickup inspection
  // Find the line containing "Return Inspection" and work outward
  let lineStart = returnIdx;
  while (lineStart > 0 && app[lineStart - 1] !== '\n') lineStart--;
  
  // Go back a few lines to find the opening div of the section
  let searchArea = app.substring(Math.max(0, lineStart - 500), lineStart);
  let cardStart = searchArea.lastIndexOf('{pickupP');
  if (cardStart === -1) {
    // Try finding the div before "Return Inspection"
    // Look for a blank line or section separator before
    let backLines = app.substring(Math.max(0, lineStart - 2000), lineStart).split('\n');
    // Find where the return section card starts (similar pattern to pickup)
    for (let i = backLines.length - 1; i >= 0; i--) {
      if (backLines[i].trim().startsWith('<div') && backLines[i].includes('border')) {
        sectionStart = lineStart - backLines.slice(i).join('\n').length;
        break;
      }
    }
  }
  
  // Find the end of the Return Inspection section
  // It likely ends before "Pickup Dossier" section
  const dossierSection = app.indexOf('Pickup Dossier', returnIdx);
  if (dossierSection !== -1) {
    let sectionEnd = dossierSection;
    // Go back to find the closing div
    while (sectionEnd > returnIdx && app[sectionEnd - 1] !== '\n') sectionEnd--;
    // Go back one more line to get the div closing
    let prevNewline = app.lastIndexOf('\n', sectionEnd - 2);
    
    // Remove from after pickup inspection photos to before pickup dossier
    // Actually, let's be smarter - remove from "Return Inspection" heading's parent div to right before "Pickup Dossier"
  }
}

// Simpler approach for Return Inspection: remove by line filtering
const lines = app.split('\n');
let inReturnSection = false;
let braceDepth = 0;
let returnSectionRemoved = false;
const filtered = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  // Detect start of return section
  if (trimmed.includes('Return Inspection') && !inReturnSection) {
    inReturnSection = true;
    braceDepth = 0;
    // Also remove the parent div (go back and remove recent lines until we find the card div)
    // Remove the last few lines that are part of the return section card
    while (filtered.length > 0) {
      const lastLine = filtered[filtered.length - 1].trim();
      filtered.pop();
      // Stop when we've removed back to a section break (empty line or end of previous section)
      if (lastLine === '' || lastLine === ')}'  || lastLine.includes('pickupP') || lastLine.includes('Pickup Inspection') || lastLine.includes('add photos manually')) {
        filtered.push(filtered.length > 0 ? '' : ''); // Keep the separator
        break;
      }
    }
    continue;
  }
  
  if (inReturnSection) {
    // Count divs to find when the section ends
    // Look for the next major section (Pickup Dossier)
    if (trimmed.includes('Pickup Dossier') || trimmed.includes('DOSSIER GENERATION')) {
      inReturnSection = false;
      returnSectionRemoved = true;
      filtered.push(line); // Keep this line
      continue;
    }
    continue; // Skip this line (part of return section)
  }
  
  filtered.push(line);
}

if (returnSectionRemoved) {
  app = filtered.join('\n');
  changes.push('Removed Return Inspection section');
}

// Also remove returnP state references if they exist but are no longer used
// Keep the state declaration but it just won't be rendered

fs.writeFileSync('src/App.jsx', app);

console.log('Changes:');
changes.forEach(c => console.log('  + ' + c));
console.log('\nVerify:');
console.log('  "Send to rental company":', app.includes('Send to rental company') ? 'STILL THERE' : 'removed');
console.log('  "WhatsApp":', app.includes('WhatsApp') && app.includes('<button') ? 'STILL THERE' : 'removed');
console.log('  "Return Inspection":', app.includes('Return Inspection') ? 'STILL THERE' : 'removed');
console.log('  "Save as PDF":', app.includes('Save as PDF') || app.includes('save') || app.includes('PDF') ? 'present' : 'MISSING');
console.log('  "On mobile" text:', app.includes('On mobile') ? 'STILL THERE' : 'removed');
