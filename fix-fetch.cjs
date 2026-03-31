const fs = require('fs');
let c = fs.readFileSync('api/scan.js', 'utf8');

// Replace the fetchUrlContent function with a better one
const oldFetch = `async function fetchUrlContent(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RentScan/1.0)",
        "Accept": "text/html,application/xhtml+xml,*/*",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    let text = html
      .replace(/<script[^>]*>[\\s\\S]*?<\\/script>/gi, " ")
      .replace(/<style[^>]*>[\\s\\S]*?<\\/style>/gi, " ")
      .replace(/<nav[^>]*>[\\s\\S]*?<\\/nav>/gi, " ")
      .replace(/<footer[^>]*>[\\s\\S]*?<\\/footer>/gi, " ")
      .replace(/<header[^>]*>[\\s\\S]*?<\\/header>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\\s+/g, " ")
      .trim();
    return text.substring(0, 30000);
  } catch { return null; }
}`;

const newFetch = `async function fetchUrlContent(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,*/*",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    // Aggressively strip non-content HTML
    let text = html
      .replace(/<script[^>]*>[\\s\\S]*?<\\/script>/gi, "")
      .replace(/<style[^>]*>[\\s\\S]*?<\\/style>/gi, "")
      .replace(/<nav[^>]*>[\\s\\S]*?<\\/nav>/gi, "")
      .replace(/<footer[^>]*>[\\s\\S]*?<\\/footer>/gi, "")
      .replace(/<header[^>]*>[\\s\\S]*?<\\/header>/gi, "")
      .replace(/<aside[^>]*>[\\s\\S]*?<\\/aside>/gi, "")
      .replace(/<form[^>]*>[\\s\\S]*?<\\/form>/gi, "")
      .replace(/<select[^>]*>[\\s\\S]*?<\\/select>/gi, "")
      .replace(/<svg[^>]*>[\\s\\S]*?<\\/svg>/gi, "")
      .replace(/<img[^>]*>/gi, "")
      .replace(/<link[^>]*>/gi, "")
      .replace(/<meta[^>]*>/gi, "")
      .replace(/<input[^>]*>/gi, "")
      .replace(/<button[^>]*>[\\s\\S]*?<\\/button>/gi, "")
      .replace(/<iframe[^>]*>[\\s\\S]*?<\\/iframe>/gi, "")
      .replace(/<!--[\\s\\S]*?-->/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\\s+/g, " ")
      .trim();
    // Remove duplicate lines (menus often repeat)
    const lines = text.split(". ");
    const seen = new Set();
    const unique = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length < 5) continue;
      if (seen.has(trimmed)) continue;
      seen.add(trimmed);
      unique.push(trimmed);
    }
    text = unique.join(". ");
    return text.substring(0, 50000);
  } catch { return null; }
}`;

if (c.includes('async function fetchUrlContent')) {
  // Find and replace the function
  const start = c.indexOf('async function fetchUrlContent');
  // Find the closing of the function - look for the next function or export
  let depth = 0;
  let end = start;
  let foundFirst = false;
  for (let i = start; i < c.length; i++) {
    if (c[i] === '{') { depth++; foundFirst = true; }
    if (c[i] === '}') { depth--; }
    if (foundFirst && depth === 0) { end = i + 1; break; }
  }
  c = c.substring(0, start) + newFetch + c.substring(end);
  console.log('Done! Improved URL content extraction:');
  console.log('  - Strips more HTML junk (svg, img, buttons, forms, etc.)');
  console.log('  - Removes duplicate lines (repeated navigation menus)');
  console.log('  - Increased limit to 50k chars');
  console.log('  - Better User-Agent for more sites to respond');
} else {
  console.log('ERROR: Could not find fetchUrlContent function');
}

// Also update storeTerms limit to match
c = c.replace('termsText.substring(0, 50000)', 'termsText.substring(0, 80000)');

fs.writeFileSync('api/scan.js', c, 'utf8');
