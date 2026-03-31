const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// ============================================
// 1. TERMS: Add "Anonymous Market Data" section before "Limitation of liability"
// ============================================
c = c.replace(
  `<h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>8. Limitation of liability</h3>`,
  `<h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>8. Anonymous market data</h3>
      <p>RentScan automatically collects <strong style={{ color: T.text }}>anonymous, non-personal market data</strong> from contract scans and rental details submitted through the platform. This includes company names, vehicle models, daily rates, insurance terms, mileage limits, fuel policies, deposit amounts, and fee structures.</p>
      <p>This data contains no personal information and cannot be used to identify individual users. It is used to improve the accuracy of RentScan's cost estimates, identify pricing patterns, detect hidden fees, and provide better guidance to all users. By using RentScan, you acknowledge and agree that anonymous market data derived from your interactions may be collected and used for these purposes.</p>
      <p>This data may be presented in aggregated form to users (e.g., "average daily rate for this company" or "common hidden fees reported"). Individual submissions are never disclosed.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>9. Limitation of liability</h3>`
);

// Renumber Terms sections 9-14 to 10-15
c = c.replace('>9. Indemnification<', '>10. Indemnification<');
c = c.replace('>10. Company information and neutrality<', '>11. Company information and neutrality<');
c = c.replace('>11. User conduct<', '>12. User conduct<');
c = c.replace('>12. Modifications<', '>13. Modifications<');
c = c.replace('>13. Governing law<', '>14. Governing law<');
c = c.replace('>14. Contact<', '>15. Contact<');

// ============================================
// 2. PRIVACY: Add market data to "Information collected automatically"
// ============================================
c = c.replace(
  `<p><strong style={{ color: T.text }}>Information collected automatically:</strong></p>`,
  `<p><strong style={{ color: T.text }}>Information collected automatically:</strong></p>
      <p>\u2022 <strong style={{ color: T.text }}>Anonymous rental market data:</strong> When you scan a contract or submit rental details, RentScan automatically extracts non-personal market data including company names, vehicle models, daily rates, insurance terms, mileage limits, fuel policies, and fee structures. This data cannot identify you.<br/>`
);

// ============================================
// 3. PRIVACY: Add market intelligence to "How we use your information"
// ============================================
c = c.replace(
  `\u2022 <strong style={{ color: T.text }}>Analytics:</strong> Aggregated, anonymous usage data to improve our service<br/>`,
  `\u2022 <strong style={{ color: T.text }}>Market intelligence:</strong> Anonymous rental data is aggregated to improve cost estimates, identify pricing patterns, and detect common hidden fees across rental companies in Dubai. This helps all users get more accurate analyses.<br/>
      \u2022 <strong style={{ color: T.text }}>Analytics:</strong> Aggregated, anonymous usage data to improve our service<br/>`
);

// ============================================
// 4. PRIVACY: Add market data to retention section
// ============================================
c = c.replace(
  `\u2022 Analytics data is retained in aggregated, anonymous form<br/>`,
  `\u2022 Anonymous rental market data is retained indefinitely in aggregated form to improve service quality<br/>
      \u2022 Analytics data is retained in aggregated, anonymous form<br/>`
);

// ============================================
// 5. DISCLAIMER: Add market data disclaimer
// ============================================
c = c.replace(
  `<h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>Pricing data</h3>`,
  `<h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>Market data</h3>
      <p>RentScan collects anonymous market data from user interactions to improve its service. This data is aggregated and non-personal. While RentScan strives to provide accurate market insights based on this data, it makes no guarantees about the completeness or accuracy of aggregated market information. Market conditions change frequently and past data may not reflect current pricing or policies.</p>

      <h3 style={{ color: T.text, fontSize: "16px", marginTop: "24px", marginBottom: "8px" }}>Pricing data</h3>`
);

// ============================================
// 6. Remove consent checkbox - make data collection automatic
// ============================================

// Remove the checkbox UI
c = c.replace(
  `<label style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "16px", cursor: "pointer", fontSize: "13px", color: T.sub, lineHeight: 1.5 }}>
            <input type="checkbox" checked={shareConsent} onChange={e => setShareConsent(e.target.checked)} style={{ marginTop: "3px", accentColor: T.accent, width: "18px", height: "18px", flexShrink: 0 }} />
            <span>Help improve RentScan by sharing <strong style={{ color: T.text }}>anonymous</strong> rental info (company name, car model, price). No personal data is shared.</span>
          </label>`,
  `<div style={{ fontSize: "12px", color: T.dim, marginBottom: "16px", lineHeight: 1.5 }}>
            RentScan automatically collects anonymous market data (company, car model, pricing, policies) to improve analyses for all users. No personal information is collected. See our <button onClick={() => setTab("privacy")} style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", fontSize: "12px", textDecoration: "underline", padding: 0 }}>Privacy Policy</button>.
          </div>`
);

// Remove conditional consent check - always send data
c = c.replace(
  `if (shareConsent && rental.company) {`,
  `if (rental.company) {`
);

// Update footer text on My Rental page
c = c.replace(
  `<p style={{ fontSize: "11px", color: T.dim, textAlign: "center", padding: "16px 0", lineHeight: 1.6 }}>\u{1F4F8} Photos stored locally on your device. Only anonymous rental info (company, car, price) is shared if you consent.</p>`,
  `<p style={{ fontSize: "11px", color: T.dim, textAlign: "center", padding: "16px 0", lineHeight: 1.6 }}>\u{1F4F8} Photos stored locally on your device. Anonymous rental data (company, car, pricing) is automatically collected to improve RentScan for all users.</p>`
);

// Remove unused shareConsent state (keep variable but always true)
c = c.replace(
  `const [shareConsent, setShareConsent] = useState(true);`,
  `const shareConsent = true; // Always collect anonymous market data`
);

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('Done! Legal text updated successfully.');
console.log('Changes made:');
console.log('  1. Terms: Added section 8 "Anonymous market data"');
console.log('  2. Privacy: Added market data to collected info');
console.log('  3. Privacy: Added market intelligence to usage');
console.log('  4. Privacy: Added retention info');
console.log('  5. Disclaimer: Added market data disclaimer');
console.log('  6. Removed consent checkbox (now automatic)');
console.log('  7. Updated footer text');
