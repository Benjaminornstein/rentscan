const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');
const changes = [];

// ============ 1. FOOTER DISCLAIMER ============
const oldFooter = 'Photos stored locally on your device. Anonymous rental data (company, car, pricing) is automatically collected to improve RentScan for all users.';
if (app.includes(oldFooter)) {
  app = app.replace(oldFooter, 'Photos are stored locally on your device.');
  changes.push('Footer text simplified');
}

// ============ 2. REMOVE shareConsent ============
if (app.includes('const shareConsent = true;')) {
  app = app.replace(/\n\s*const shareConsent = true;.*\n/g, '\n');
  changes.push('shareConsent removed');
}

// ============ 3. OPT-IN TEXT BELOW EMAIL FIELD ============
const emailInputIdx = app.indexOf('placeholder="your@email.com"');
if (emailInputIdx !== -1 && !app.includes('promotional offers')) {
  const closingDiv = app.indexOf('</div>', emailInputIdx);
  if (closingDiv !== -1) {
    const afterDiv = closingDiv + 6;
    const optInText = '\n            <p style={{ fontSize: "10px", color: T.dim, marginTop: "4px" }}>By entering your email you agree to receive product updates, rental tips, and occasional promotional offers. Unsubscribe anytime.</p>';
    app = app.substring(0, afterDiv) + optInText + app.substring(afterDiv);
    changes.push('Added opt-in text below email field');
  }
}

// ============ 4. PRIVACY: ADD EMAIL TO "INFORMATION WE COLLECT" ============
const collectMarker = 'Contact information submitted via "Get Quote" forms (name, phone number)';
if (app.includes(collectMarker) && !app.includes('Email address (optional) when generating')) {
  app = app.replace(
    collectMarker,
    collectMarker + '<br/>\n        \\u2022 Email address (optional) when generating a pickup dossier'
  );
  changes.push('Privacy: added email to data collection');
}

// ============ 5. PRIVACY: ADD EMAIL + MARKETING TO "HOW WE USE" ============
const useMarker = 'Communication:</strong> If you contact us, we may use your information to respond';
if (app.includes(useMarker) && !app.includes('Product updates & promotions:')) {
  app = app.replace(
    useMarker,
    useMarker
    + '<br/>\n        \\u2022 <strong style={{ color: T.text }}>Product updates & promotions:</strong> If you provide your email, we may send product updates, rental tips, and promotional offers about RentScan or relevant partner services. You can unsubscribe at any time by replying to any email or contacting info@rentscan.ae'
  );
  changes.push('Privacy: added marketing/promotions to data usage');
}

// ============ 6. PRIVACY: ADD TO DATA SHARING SECTION ============
const sharingMarker = 'We do <strong style={{ color: T.text }}>not</strong> sell your personal information to third parties.';
if (app.includes(sharingMarker) && !app.includes('Email marketing provider')) {
  app = app.replace(
    sharingMarker,
    '\\u2022 <strong style={{ color: T.text }}>Email marketing provider:</strong> Your email address may be shared with our email service provider (MailerSend) solely for the purpose of sending communications you consented to.</p>\n        <p>' + sharingMarker
  );
  changes.push('Privacy: added email provider to data sharing');
}

// ============ WRITE ============
fs.writeFileSync('src/App.jsx', app, 'utf8');

console.log('Changes:');
changes.forEach(c => console.log('  + ' + c));

console.log('\nVerification:');
console.log('  Footer:', app.includes('Photos are stored locally on your device.') && !app.includes('automatically collected') ? 'OK' : 'CHECK');
console.log('  shareConsent:', !app.includes('const shareConsent = true') ? 'removed' : 'STILL THERE');
console.log('  Opt-in text:', app.includes('promotional offers') ? 'OK' : 'CHECK');
console.log('  Email in collection:', app.includes('Email address (optional)') ? 'OK' : 'CHECK');
console.log('  Marketing in usage:', app.includes('Product updates & promotions:') ? 'OK' : 'CHECK');
console.log('  MailerSend in sharing:', app.includes('MailerSend') ? 'OK' : 'CHECK');
