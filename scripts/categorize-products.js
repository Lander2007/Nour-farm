const fs = require('fs');

const content = fs.readFileSync('data/products.ts', 'utf8');

// Parse products
const regex = /id:\s*["']([^"']+)["'][\s\S]*?name:\s*["']([^"']+)["'][\s\S]*?section:\s*["']([^"']+)["'][\s\S]*?image:\s*["']([^"']+)["']/g;
let m;
const products = [];
while ((m = regex.exec(content)) !== null) {
  products.push({
    id: m[1],
    name: m[2],
    section: m[3],
    currentImage: m[4]
  });
}

console.log('Total products:', products.length);

const sections = {};
for (const p of products) {
  if (!sections[p.section]) sections[p.section] = [];
  sections[p.section].push(p);
}

for (const sec in sections) {
  console.log(`\n=== Section: ${sec} (${sections[sec].length} items) ===`);
  sections[sec].forEach((p, idx) => {
    console.log(`  ${idx+1}. [${p.id}] ${p.name}`);
  });
}
