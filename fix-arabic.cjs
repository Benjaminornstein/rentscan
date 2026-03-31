const fs = require('fs');
let c = fs.readFileSync('api/scan.js', 'utf8');

// After deduplication, add Arabic text removal
c = c.replace(
  'text = unique.join(". ");',
  `// Remove Arabic text (bilingual pages double the content)
    const filtered = unique.filter(line => {
      const arabicChars = (line.match(/[\\u0600-\\u06FF]/g) || []).length;
      return arabicChars < line.length * 0.3; // Keep lines that are less than 30% Arabic
    });
    text = filtered.join(". ");`
);

fs.writeFileSync('api/scan.js', c, 'utf8');
console.log('Done! Arabic text filtering added — bilingual pages will now show full English terms.');
