const fs = require('fs');
let code = fs.readFileSync('api/scan.js', 'utf8');

// Add null stripping before the market data extraction
code = code.replace(
  'const marketMatch = text.match',
  'text = text.replace(/```json\\s*null\\s*```/g, "").replace(/\\bnull\\b\\s*$/g, "").trim();\n    const marketMatch = text.match'
);

fs.writeFileSync('api/scan.js', code);
console.log('Done! Null stripped from AI output.');
