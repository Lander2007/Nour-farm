const fs = require('fs');

const content = fs.readFileSync('data/products.ts', 'utf8');
const regex = /id:\s*["']([^"']+)["'][\s\S]*?name:\s*["']([^"']+)["'][\s\S]*?section:\s*["']([^"']+)["'][\s\S]*?image:\s*["']([^"']+)["']/g;
let m;
const list = [];
while ((m = regex.exec(content)) !== null) {
  list.push({ id: m[1], name: m[2], section: m[3], image: m[4] });
}

console.log(`Total products parsed: ${list.length}`);
list.forEach((p, i) => {
  console.log(`${i+1}. [${p.id}] (${p.section}) ${p.name} => ${p.image}`);
});
