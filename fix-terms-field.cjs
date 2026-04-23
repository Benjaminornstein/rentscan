const fs = require('fs');
let scan = fs.readFileSync('api/scan.js', 'utf8');

scan = scan.replace(
  'response: "Terms saved for "',
  'answer: "Terms saved for "'
);

scan = scan.replace(
  'response: "Format: /terms CompanyName',
  'answer: "Format: /terms CompanyName'
);

// Also add tips: [] if missing
scan = scan.replace(
  /answer: "Terms saved for " \+ company \+ "[^}]+\}/,
  (match) => match.includes('tips') ? match : match.slice(0, -1) + ', tips: [] }'
);

scan = scan.replace(
  /answer: "Format:[^}]+\}/,
  (match) => match.includes('tips') ? match : match.slice(0, -1) + ', tips: [] }'
);

fs.writeFileSync('api/scan.js', scan, 'utf8');

console.log('Returns answer:', scan.includes('answer: "Terms saved') ? 'OK' : 'MISSING');
console.log('No more response:', !scan.includes('response: "Terms saved') ? 'OK' : 'STILL THERE');
