const fs = require('fs');
const path = require('path');

function mkdirp(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Blog pages go in public/ as folder/index.html for clean URLs
const files = {
  'public/blog/index.html': 'blog-index',
  'public/blog/dubai-car-rental-hidden-fees/index.html': 'article-1',
  'public/blog/car-rental-scams-dubai/index.html': 'article-2',
  'public/blog/deposit-not-returned-dubai-rental/index.html': 'article-3',
  'public/sitemap.xml': 'sitemap',
  'public/robots.txt': 'robots',
};

// Source files (downloaded from Claude)
const sources = {
  'blog-index': 'blog/index.html',
  'article-1': 'blog/dubai-car-rental-hidden-fees.html',
  'article-2': 'blog/car-rental-scams-dubai.html',
  'article-3': 'blog/deposit-not-returned-dubai-rental.html',
  'sitemap': 'blog/sitemap.xml',
  'robots': 'blog/robots.txt',
};

let count = 0;
for (const [dest, key] of Object.entries(files)) {
  const src = sources[key];
  if (!fs.existsSync(src)) {
    console.log('MISSING source:', src);
    continue;
  }
  mkdirp(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log('  Created:', dest);
  count++;
}

console.log('\n' + count + ' files created');
console.log('\nURLs that will be live after deploy:');
console.log('  https://rentscan.ae/blog/');
console.log('  https://rentscan.ae/blog/dubai-car-rental-hidden-fees');
console.log('  https://rentscan.ae/blog/car-rental-scams-dubai');
console.log('  https://rentscan.ae/blog/deposit-not-returned-dubai-rental');
console.log('  https://rentscan.ae/sitemap.xml');
console.log('  https://rentscan.ae/robots.txt');
console.log('\nNext: Submit sitemap to Google Search Console at https://search.google.com/search-console');
