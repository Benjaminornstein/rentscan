const fs = require('fs');
let scan = fs.readFileSync('api/scan.js', 'utf8');

// 1. Add Levenshtein + fuzzyCompanyMatch before findRelevantTerms
const levenshteinCode = `
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function fuzzyCompanyMatch(userText, companyName) {
  const textNorm = userText.toLowerCase().replace(/[^a-z0-9]/g, "");
  const compNorm = companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (textNorm.includes(compNorm)) return true;
  if (userText.toLowerCase().includes(companyName.toLowerCase())) return true;
  const len = compNorm.length;
  if (len < 4) return false;
  const maxDist = len >= 8 ? 2 : 1;
  for (let i = 0; i <= textNorm.length - len + maxDist; i++) {
    for (let j = Math.max(len - maxDist, 1); j <= len + maxDist && i + j <= textNorm.length; j++) {
      const sub = textNorm.substring(i, i + j);
      if (levenshtein(sub, compNorm) <= maxDist) return true;
    }
  }
  return false;
}

`;

if (!scan.includes('function levenshtein')) {
  const insertAt = scan.indexOf('async function findRelevantTerms');
  if (insertAt === -1) {
    console.log('ERROR: findRelevantTerms not found');
    process.exit(1);
  }
  scan = scan.substring(0, insertAt) + levenshteinCode + scan.substring(insertAt);
  console.log('Added levenshtein + fuzzyCompanyMatch functions');
} else {
  console.log('Functions already exist');
}

// 2. Replace the includes check with fuzzyCompanyMatch
const oldCheck = 'textLower.includes(company.toLowerCase())';
const newCheck = 'fuzzyCompanyMatch(userText, company)';

if (scan.includes(oldCheck)) {
  scan = scan.replace(oldCheck, newCheck);
  // Remove unused textLower line
  scan = scan.replace(/\n\s*const textLower = userText\.toLowerCase\(\);\n/, '\n');
  console.log('Replaced matching logic with fuzzyCompanyMatch');
} else if (scan.includes(newCheck)) {
  console.log('Already using fuzzyCompanyMatch');
} else {
  console.log('ERROR: Could not find matching logic');
  process.exit(1);
}

fs.writeFileSync('api/scan.js', scan, 'utf8');

console.log('\nVerification:');
console.log('  levenshtein:', scan.includes('function levenshtein') ? 'OK' : 'MISSING');
console.log('  fuzzyCompanyMatch:', scan.includes('function fuzzyCompanyMatch') ? 'OK' : 'MISSING');
console.log('  Used in matching:', scan.includes('fuzzyCompanyMatch(userText, company)') ? 'OK' : 'MISSING');
console.log('  Old includes gone:', !scan.includes('textLower.includes(company.toLowerCase())') ? 'OK' : 'STILL THERE');
