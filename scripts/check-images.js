const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('data/products.ts', 'utf8');
const regex = /id:\s*["']([^"']+)["'][\s\S]*?name:\s*["']([^"']+)["'][\s\S]*?section:\s*["']([^"']+)["'][\s\S]*?image:\s*["']([^"']+)["']/g;

const products = [];
let match;
while ((match = regex.exec(content)) !== null) {
  products.push({
    id: match[1],
    name: match[2],
    section: match[3],
    image: match[4]
  });
}

console.log('Total parsed products:', products.length);
const uniqueImages = Array.from(new Set(products.map(p => p.image)));
console.log('Unique images used:', uniqueImages);

const dir = path.join(__dirname, '../public/noor farm images');
const files = fs.readdirSync(dir);
console.log('Total files in noor farm images:', files.length);
