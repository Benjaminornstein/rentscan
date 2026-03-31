const fs = require('fs');

// ============================================
// PART 1: Backend - scan.js
// ============================================
let scan = fs.readFileSync('api/scan.js', 'utf8');

// 1A. Add /terms admin command — store terms directly in database
const adminHandler = `
  // ===== ADMIN: /terms command =====
  const firstLine = (contractText || "").split("\\n")[0].trim();
  const termsMatch = firstLine.match(/^\\/terms\\s+(.+)/i);
  if (termsMatch && contractText) {
    const afterCmd = termsMatch[1].trim();
    const urlInLine = afterCmd.match(/https?:\\/\\/[^\\s]+/);
    const companyName = urlInLine ? afterCmd.replace(urlInLine[0], "").trim() : afterCmd;
    const sourceUrl = urlInLine ? urlInLine[0] : null;
    const termsText = contractText.substring(contractText.indexOf("\\n") + 1).trim();

    if (!companyName) {
      return res.status(200).json({ mode: "chat", answer: "Usage: /terms CompanyName\\n[paste terms here]", tips: [] });
    }
    if (termsText.length < 50) {
      return res.status(200).json({ mode: "chat", answer: "Terms text too short. Paste the full terms after /terms CompanyName.", tips: [] });
    }

    const key = \`terms:\${companyName.toLowerCase().replace(/[^a-z0-9]/g, "_")}\`;
    await redis(["SET", key, JSON.stringify({
      company: companyName,
      url: sourceUrl,
      terms: termsText.substring(0, 80000),
      timestamp: new Date().toISOString(),
      source: "admin",
      charCount: termsText.length,
    })]);
    await redis(["SADD", "terms:companies", companyName]);

    return res.status(200).json({ mode: "chat", answer: [
      "Terms stored successfully!",
      "",
      "Company: " + companyName,
      "Characters: " + termsText.length.toLocaleString(),
      "Source: " + (sourceUrl || "manual entry"),
      "Stored: " + new Date().toLocaleString("en-GB", { timeZone: "Asia/Dubai" }),
      "",
      "Users asking about " + companyName + " will now get answers from these terms.",
    ].join("\\n"), tips: [] });
  }
`;

scan = scan.replace(
  `if (!contractText && (!messages || !messages.length)) {
    return res.status(400).json({ error: "No text provided" });
  }`,
  `if (!contractText && (!messages || !messages.length)) {
    return res.status(400).json({ error: "No text provided" });
  }
${adminHandler}`
);

// 1B. Replace findRelevantTerms — returns metadata + age
const funcStart = scan.indexOf('async function findRelevantTerms(userText) {');
if (funcStart === -1) { console.log('ERROR: findRelevantTerms not found'); process.exit(1); }
let depth = 0, funcEnd = funcStart, foundFirst = false;
for (let i = funcStart; i < scan.length; i++) {
  if (scan[i] === '{') { depth++; foundFirst = true; }
  if (scan[i] === '}') { depth--; }
  if (foundFirst && depth === 0) { funcEnd = i + 1; break; }
}

scan = scan.substring(0, funcStart) + `async function findRelevantTerms(userText) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return { text: "", meta: null };
  try {
    const termsCompanies = await redis(["SMEMBERS", "terms:companies"]);
    if (!termsCompanies?.result?.length) return { text: "", meta: null };
    const textLower = userText.toLowerCase();
    for (const company of termsCompanies.result) {
      if (textLower.includes(company.toLowerCase())) {
        const key = \`terms:\${company.toLowerCase().replace(/[^a-z0-9]/g, "_")}\`;
        const result = await redis(["GET", key]);
        if (!result?.result) continue;
        try {
          const data = JSON.parse(result.result);
          if (!data.terms) continue;
          const storedDate = data.timestamp ? new Date(data.timestamp) : null;
          const ageDays = storedDate ? Math.floor((Date.now() - storedDate.getTime()) / 86400000) : null;
          const dateStr = storedDate ? storedDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "unknown date";

          let ageNote = "";
          if (ageDays !== null && ageDays > 60) {
            ageNote = " (WARNING: " + ageDays + " days old, may be outdated)";
          } else if (ageDays !== null && ageDays > 14) {
            ageNote = " (" + ageDays + " days ago, user should verify)";
          }

          const ctx = \`\\n\\nSTORED TERMS & CONDITIONS FOR \${company.toUpperCase()}\\nReviewed on \${dateStr}\${ageNote}.\${data.url ? " Source: " + data.url : ""}\\nTHIS DATA HAS PRIORITY over your general knowledge. Use exact AED amounts from these terms. Always tell the user the review date and that they should verify with the company.\\n\\n\${data.terms.substring(0, 40000)}\`;

          return { text: ctx, meta: { company, date: dateStr, url: data.url || null, ageDays: ageDays || 0 } };
        } catch { continue; }
      }
    }
    return { text: "", meta: null };
  } catch { return { text: "", meta: null }; }
}` + scan.substring(funcEnd);

// 1C. Update destructuring — findRelevantTerms now returns { text, meta }
scan = scan.replace(
  'const [marketContext, termsContext] = await Promise.all',
  'const [marketContext, termsResult] = await Promise.all'
);
scan = scan.replace(
  `findRelevantTerms(searchText),
    ]);`,
  `findRelevantTerms(searchText),
    ]);
    const termsContext = termsResult.text;
    const termsMeta = termsResult.meta;`
);

// 1D. Add terms rules to prompt
scan = scan.replace(
  'Be factual and neutral about companies. Never badmouth by name.',
  `Be factual and neutral about companies. Never badmouth by name.

TERMS DATA RULES:
- Stored terms have PRIORITY over your general knowledge. Use exact AED amounts from the terms.
- Always state: "Based on [Company]'s terms as published on their website, reviewed on [date]."
- Always end terms-based answers with: "Terms can change at any time. Verify directly with the company before signing."
- NEVER present stored terms as "current" — frame as "as of [date]".
- Never invent AED amounts. If unsure, say so.`
);

// 1E. Add termsMeta to API response
scan = scan.replace(
  'return res.status(200).json({ mode: "chat", answer: text, tips: [] });',
  'return res.status(200).json({ mode: "chat", answer: text, tips: [], termsUsed: termsMeta || null });'
);

fs.writeFileSync('api/scan.js', scan);
console.log('Backend done:');
console.log('  + /terms admin command');
console.log('  + Database terms get priority over AI knowledge');
console.log('  + Age-based warnings (14d, 60d)');
console.log('  + termsUsed metadata in response');

// ============================================
// PART 2: Frontend - App.jsx disclaimer bar
// ============================================
let app = fs.readFileSync('src/App.jsx', 'utf8');

// 2A. Store termsUsed from response
if (app.includes('setChatMessages([{ role: "user", content: text }, { role: "assistant", content: data.answer }]);') &&
    !app.includes('data.termsUsed')) {
  app = app.replace(
    'setChatMessages([{ role: "user", content: text }, { role: "assistant", content: data.answer }]);',
    `setChatMessages([{ role: "user", content: text }, { role: "assistant", content: data.answer }]);
          if (data.termsUsed) setRes(prev => ({ ...prev, termsUsed: data.termsUsed }));`
  );
}

// 2B. Add disclaimer bar after answer
const marker = 'whiteSpace: "pre-wrap" }}>{res.answer';
const idx = app.indexOf(marker);
if (idx !== -1 && !app.includes('termsUsed &&')) {
  const closeDiv = app.indexOf('</div>', idx);
  if (closeDiv !== -1) {
    const at = closeDiv + 6;
    const bar = `

            {res.termsUsed && (
              <div style={{
                marginTop: "14px", padding: "12px 16px", borderRadius: "10px",
                backgroundColor: res.termsUsed.ageDays > 60 ? "rgba(255,100,50,0.1)" : res.termsUsed.ageDays > 14 ? "rgba(255,200,50,0.1)" : "rgba(100,200,100,0.07)",
                border: res.termsUsed.ageDays > 60 ? "1px solid rgba(255,100,50,0.25)" : res.termsUsed.ageDays > 14 ? "1px solid rgba(255,200,50,0.2)" : "1px solid rgba(100,200,100,0.15)",
                fontSize: "12px", lineHeight: 1.5, color: "#999",
              }}>
                <span style={{ fontWeight: 700, color: res.termsUsed.ageDays > 60 ? "#ff6432" : res.termsUsed.ageDays > 14 ? "#e8b930" : "#7cb87c" }}>
                  {res.termsUsed.ageDays > 60 ? "\\u26A0\\uFE0F Data may be outdated" : res.termsUsed.ageDays > 14 ? "\\u26A0\\uFE0F Verify with company" : "\\u2705 Recently reviewed"}
                </span>
                {" \\u2014 Based on "}{res.termsUsed.company}{"'s terms, reviewed "}{res.termsUsed.date}
                {". Terms can change \\u2014 verify with the company before signing."}
                {res.termsUsed.url && (<>{" "}<a href={res.termsUsed.url} target="_blank" rel="noopener noreferrer" style={{ color: "#C9A227", textDecoration: "underline" }}>View source</a></>)}
              </div>
            )}`;

    app = app.substring(0, at) + bar + app.substring(at);
    console.log('Frontend done:');
    console.log('  + Disclaimer bar (green/yellow/orange)');
    console.log('  + Company name, date, source link');
  }
} else if (app.includes('termsUsed &&')) {
  console.log('Frontend: disclaimer bar already present');
}

fs.writeFileSync('src/App.jsx', app);

console.log('\n=== HOW TO ADD TERMS ===');
console.log('In the RentScan scan box, type:');
console.log('');
console.log('  /terms Octane Club Premium Rental');
console.log('  [paste terms text here]');
console.log('');
console.log('With source URL:');
console.log('  /terms Hertz UAE https://hertz.ae/terms');
console.log('  [paste terms text here]');
console.log('');
