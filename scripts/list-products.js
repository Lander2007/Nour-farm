const fs = require('fs');
const content = fs.readFileSync('data/products.ts', 'utf8');
const regex = /id:\s*["']([^"']+)["'][\s\S]*?name:\s*["']([^"']+)["'][\s\S]*?section:\s*["']([^"']+)["']/g;
let m;
const list = [];
while ((m = regex.exec(content)) !== null) {
  list.push({ id: m[1], name: m[2], section: m[3] });
}
fs.writeFileSync('scripts/products-list.json', JSON.stringify(list, null, 2), 'utf8');
console.log('Exported', list.length, 'products to scripts/products-list.json');
