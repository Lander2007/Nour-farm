const fs = require('fs');

const content = fs.readFileSync('data/products.ts', 'utf8');

const regex = /id:\s*["']([^"']+)["'][\s\S]*?name:\s*["']([^"']+)["'][\s\S]*?section:\s*["']([^"']+)["'][\s\S]*?image:\s*["']([^"']+)["']/g;
let m;
const products = [];
while ((m = regex.exec(content)) !== null) {
  products.push({
    id: m[1],
    name: m[2],
    section: m[3],
    image: m[4]
  });
}

console.log('Total products:', products.length);

// Group by image
const imageToProducts = {};
products.forEach(p => {
  if (!imageToProducts[p.image]) imageToProducts[p.image] = [];
  imageToProducts[p.image].push(p);
});

console.log('\n--- ALL UNIQUE IMAGES AND PRODUCTS USING THEM ---');
Object.entries(imageToProducts).forEach(([img, prods], idx) => {
  console.log(`\n#${idx+1}: Image: ${img}`);
  prods.forEach(p => console.log(`   - [${p.id}] (${p.section}) ${p.name}`));
});
