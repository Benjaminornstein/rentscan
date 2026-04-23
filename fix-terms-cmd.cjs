const fs = require('fs');
let scan = fs.readFileSync('api/scan.js', 'utf8');

// Find the spot right after the contractText/messages extraction
const marker = '// Need either contractText (first message) or messages (conversation)';
if (!scan.includes(marker)) {
  console.log('ERROR: Could not find insertion point');
  process.exit(1);
}

const termsHandler = `
    // /terms command: admin data entry
    if (contractText && contractText.trim().startsWith("/terms ")) {
      const lines = contractText.trim().split("\\n");
      const firstLine = lines[0].replace("/terms ", "").trim();
      const parts = firstLine.split(" ");
      // Extract company name and optional URL
      let url = null;
      let companyParts = [];
      for (const p of parts) {
        if (p.startsWith("http://") || p.startsWith("https://")) {
          url = p;
        } else {
          companyParts.push(p);
        }
      }
      const company = companyParts.join(" ");
      const termsText = lines.slice(1).join("\\n").trim();
      
      if (!company || !termsText) {
        return res.status(200).json({ response: "Format: /terms CompanyName [optional URL]\\n[paste terms text]" });
      }
      
      await storeTerms(company, url, termsText);
      return res.status(200).json({ 
        response: "Terms saved for " + company + ". Characters: " + termsText.length + ". Timestamp: " + new Date().toISOString() + (url ? ". Source: " + url : "")
      });
    }

`;

scan = scan.replace(marker, termsHandler + '    ' + marker);
fs.writeFileSync('api/scan.js', scan, 'utf8');

// Verify
console.log('Added /terms handler:', scan.includes('startsWith("/terms ")') ? 'OK' : 'MISSING');
console.log('storeTerms called:', scan.includes('await storeTerms(company, url, termsText)') ? 'OK' : 'MISSING');
