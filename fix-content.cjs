const fs = require('fs');
let c = fs.readFileSync('api/scan.js', 'utf8');

// Find the fetchUrlContent function and replace it entirely
const startMarker = 'async function fetchUrlContent(url) {';
const start = c.indexOf(startMarker);
if (start === -1) { console.log('ERROR: function not found'); process.exit(1); }

// Find the end of the function
let depth = 0, end = start, foundFirst = false;
for (let i = start; i < c.length; i++) {
  if (c[i] === '{') { depth++; foundFirst = true; }
  if (c[i] === '}') { depth--; }
  if (foundFirst && depth === 0) { end = i + 1; break; }
}

const newFunction = `async function fetchUrlContent(url) {
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
    
    // Try to find main content area first (skip navigation/menus)
    let contentHtml = html;
    const mainMatch = html.match(/<main[^>]*>([\\s\\S]*?)<\\/main>/i)
      || html.match(/<article[^>]*>([\\s\\S]*?)<\\/article>/i)
      || html.match(/<div[^>]*class="[^"]*(?:entry-content|post-content|page-content|main-content|terms|content-area)[^"]*"[^>]*>([\\s\\S]*?)<\\/div>/i);
    if (mainMatch) {
      contentHtml = mainMatch[1];
    }
    
    // Strip non-content HTML
    let text = contentHtml
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
    
    // Remove Arabic text (bilingual pages double the content)
    const sentences = text.split(". ");
    const seen = new Set();
    const result = [];
    for (const s of sentences) {
      const trimmed = s.trim();
      if (trimmed.length < 3) continue;
      if (seen.has(trimmed)) continue;
      seen.add(trimmed);
      // Skip lines that are mostly Arabic (>30% Arabic characters)
      const arabicChars = (trimmed.match(/[\\u0600-\\u06FF]/g) || []).length;
      if (arabicChars > trimmed.length * 0.3) continue;
      result.push(trimmed);
    }
    text = result.join(". ");
    
    return text.substring(0, 60000);
  } catch { return null; }
}`;

c = c.substring(0, start) + newFunction + c.substring(end);
fs.writeFileSync('api/scan.js', c, 'utf8');
console.log('Done! Content extraction improved:');
console.log('  - Finds <main>, <article>, or content div first (skips all navigation)');
console.log('  - Then strips HTML, deduplicates, removes Arabic');
console.log('  - 60k char limit');
console.log('  - Should capture full terms for any Dubai rental site');
