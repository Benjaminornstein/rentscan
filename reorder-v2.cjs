const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// Find the Rental Details card - starts with the card div containing "Rental Details"
const rentalStart = c.indexOf('\u{1F697} Rental Details');
if (rentalStart === -1) { console.log('ERROR: Could not find Rental Details section'); process.exit(1); }

// Find the Contract & Documents card - starts with "Contract & Documents"
const contractStart = c.indexOf('\u{1F4C4} Contract & Documents');
if (contractStart === -1) { console.log('ERROR: Could not find Contract & Documents section'); process.exit(1); }

// Check current order
if (contractStart < rentalStart) {
  console.log('Contract section is already above Rental Details. No changes needed.');
  process.exit(0);
}

// Find the opening <div style={css.card}> before each section
// Walk backwards from each header to find the card opening
function findCardStart(content, headerPos) {
  let pos = headerPos;
  while (pos > 0) {
    pos--;
    // Look for <div style={css.card}>
    const chunk = content.substring(pos, pos + 25);
    if (chunk.includes('style={css.card}')) {
      // Go back a bit more to find the <div
      let divStart = pos;
      while (divStart > 0 && content[divStart] !== '<') divStart--;
      return divStart;
    }
  }
  return -1;
}

// Find card boundaries
const rentalCardStart = findCardStart(c, rentalStart);
const contractCardStart = findCardStart(c, contractStart);

if (rentalCardStart === -1 || contractCardStart === -1) {
  console.log('ERROR: Could not find card boundaries');
  process.exit(1);
}

// Find the end of each card section
// The contract card ends before the Pickup Inspection Photos section
const pickupMarker = c.indexOf('Pickup Inspection', contractStart);
// Walk backwards from pickup to find where contract card ends
let contractCardEnd = pickupMarker;
while (contractCardEnd > 0) {
  contractCardEnd--;
  if (c.substring(contractCardEnd, contractCardEnd + 8) === '</div>\n\n' ||
      c.substring(contractCardEnd, contractCardEnd + 7) === '</div>\n') {
    contractCardEnd += 6; // include </div>
    break;
  }
}

// The rental card ends before the contract card
const rentalCardEnd = contractCardStart;

// Extract both sections
const rentalSection = c.substring(rentalCardStart, rentalCardEnd).trim();
const contractSection = c.substring(contractCardStart, contractCardEnd).trim();

// Replace: put contract before rental
const before = c.substring(0, rentalCardStart);
const after = c.substring(contractCardEnd);

c = before + contractSection + '\n\n        ' + rentalSection + '\n\n        ' + after.trim();

// Clean up extra whitespace
c = c.replace(/\n{4,}/g, '\n\n');

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('Done! Contract & Documents moved above Rental Details.');
console.log('New order: Upload contract → Auto-fill → Review details');
