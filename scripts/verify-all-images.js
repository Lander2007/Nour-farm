const fs = require('fs');
const path = require('path');

const file = fs.readFileSync(path.join(__dirname, '../data/products.ts'), 'utf8');
const matches = [...file.matchAll(/image:\s*["']([^"']+)["']/g)].map(m => m[1]);
console.log('Total image references in products.ts:', matches.length);

let missing = 0;
for (const img of matches) {
  const localPath = path.join(__dirname, '../public', img.replace(/^\//, ''));
  if (!fs.existsSync(localPath)) {
    console.error('MISSING:', img);
    missing++;
  }
}

console.log('Finished products check. Missing count:', missing);

const siteAssets = [
  '/tomato.webp',
  '/cucumber.webp',
  '/broccoli.webp',
  '/bell-pepper.webp',
  '/carrot.webp',
  '/pomegranate.webp',
  '/lemon.webp',
  '/avocado.webp',
  '/orange.webp',
  '/basil.webp',
  '/plate-top.webp',
  '/plate-back.webp',
  '/logo-icon.png',
  '/logo.jpeg',
  '/scenes/wash.jpg',
  '/scenes/cut.jpg',
  '/scenes/ready.jpg'
];

let siteMissing = 0;
for (const img of siteAssets) {
  const localPath = path.join(__dirname, '../public', img.replace(/^\//, ''));
  if (!fs.existsSync(localPath)) {
    console.error('SITE ASSET MISSING:', img);
    siteMissing++;
  }
}
console.log('Site assets check. Missing count:', siteMissing);
