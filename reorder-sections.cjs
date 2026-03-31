const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// Find the Contract & Documents Photos line (with the custom setter from update-extract)
const contractMatch = c.match(/(<Photos title="Contract & Documents"[\s\S]*?guides=\{false\} \/>)/);
if (!contractMatch) {
  console.log('ERROR: Could not find Contract & Documents section');
  process.exit(1);
}
const contractSection = contractMatch[1];

// Remove it from current position
c = c.replace(contractSection, '___CONTRACT_PLACEHOLDER___');

// Find the Rental Details card and put Contract section before it
c = c.replace(
  `<div style={css.card}>\n          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 14px" }}>\u{1F697} Rental Details</h3>`,
  `${contractSection}\n\n        <div style={css.card}>\n          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 14px" }}>\u{1F697} Rental Details</h3>`
);

// Remove placeholder
c = c.replace('___CONTRACT_PLACEHOLDER___', '');

// Clean up any double blank lines
c = c.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('Done! Contract & Documents is now above Rental Details.');
console.log('Flow: Upload contract photo → auto-fill fields → user reviews');
