const fs = require('fs');
let lines = fs.readFileSync('src/App.jsx', 'utf8').split('\n');

// Find key line numbers
let rentalDetailsStart = -1;
let rentalDetailsEnd = -1;
let contractCardEnd = -1;

for (let i = 0; i < lines.length; i++) {
  // Find Rental Details card start
  if (lines[i].includes('Rental Details') && lines[i].includes('css.card') === false && lines[i].includes('<h3')) {
    // The card div is one line before
    rentalDetailsStart = i - 1;
  }
  // Find Rental Details card end - the closing </div> after Notes textarea
  if (rentalDetailsStart > 0 && rentalDetailsEnd === -1 && i > rentalDetailsStart) {
    if (lines[i].includes('placeholder="Notes..."')) {
      // The closing </div> is the next line with just </div>
      for (let j = i + 1; j < i + 5; j++) {
        if (lines[j].trim() === '</div>') {
          rentalDetailsEnd = j;
          break;
        }
      }
    }
  }
  // Find where the Contract card section ends (the upload button line + description + closing div)
  if (lines[i].includes('AI reads your contract and auto-fills rental details')) {
    // Next line with </div> closes the contract card
    for (let j = i + 1; j < i + 5; j++) {
      if (lines[j].trim() === '</div>') {
        contractCardEnd = j;
        break;
      }
    }
  }
}

if (rentalDetailsStart === -1 || rentalDetailsEnd === -1 || contractCardEnd === -1) {
  console.log('ERROR: Could not find all sections');
  console.log('rentalDetailsStart:', rentalDetailsStart);
  console.log('rentalDetailsEnd:', rentalDetailsEnd);
  console.log('contractCardEnd:', contractCardEnd);
  process.exit(1);
}

// Check if rental details is already after contract card
if (rentalDetailsStart > contractCardEnd) {
  console.log('Sections are already in correct order.');
  process.exit(0);
}

console.log(`Found Rental Details: lines ${rentalDetailsStart + 1}-${rentalDetailsEnd + 1}`);
console.log(`Contract card ends at: line ${contractCardEnd + 1}`);

// Extract the Rental Details block
const rentalBlock = lines.slice(rentalDetailsStart, rentalDetailsEnd + 1);

// Remove rental block from current position
lines.splice(rentalDetailsStart, rentalDetailsEnd - rentalDetailsStart + 1);

// Recalculate contractCardEnd since we removed lines
const removedCount = rentalDetailsEnd - rentalDetailsStart + 1;
const newContractCardEnd = contractCardEnd - removedCount;

// Insert rental block after the contract card end
lines.splice(newContractCardEnd + 1, 0, '', ...rentalBlock);

fs.writeFileSync('src/App.jsx', lines.join('\n'), 'utf8');
console.log('Done! Rental Details moved after Contract & Documents.');
console.log('Order: Contract upload → Rental Details (auto-filled) → Pickup → Return');
