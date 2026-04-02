const fs = require('fs');

// Read logo and convert to base64
const logo = fs.readFileSync('public/logo.png');
const base64Logo = 'data:image/png;base64,' + logo.toString('base64');
console.log('Logo size:', Math.round(logo.length / 1024) + 'KB');

// Replace URL references with base64
let app = fs.readFileSync('src/App.jsx', 'utf8');
const count = (app.match(/https:\/\/rentscan\.ae\/logo\.png/g) || []).length;
app = app.replace(/https:\/\/rentscan\.ae\/logo\.png/g, base64Logo);
fs.writeFileSync('src/App.jsx', app, 'utf8');

console.log('Replaced', count, 'logo URLs with base64');
console.log('Logo will now work offline in downloaded dossiers');
