const fs = require('fs');
let code = fs.readFileSync('api/scan.js', 'utf8');

// Check if the extraction lines are missing
if (!code.includes('const termsContext = termsResult.text')) {
  code = code.replace(
    'const [marketContext, termsResult] = await Promise.all',
    'const [marketContext, termsResult] = await Promise.all'
  );
  
  // Find the closing of Promise.all and add extraction after it
  const promiseEnd = code.indexOf(']);', code.indexOf('const [marketContext, termsResult]'));
  if (promiseEnd !== -1) {
    const insertAt = promiseEnd + 3;
    code = code.substring(0, insertAt) + '\n    const termsContext = termsResult.text;\n    const termsMeta = termsResult.meta;\n' + code.substring(insertAt);
  }
}

fs.writeFileSync('api/scan.js', code);
console.log('Done! Added termsContext/termsMeta extraction.');
