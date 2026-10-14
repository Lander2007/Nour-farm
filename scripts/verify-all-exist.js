const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('data/products.ts', 'utf8');
const regex = /id:\s*["']([^"']+)["'][\s\S]*?name:\s*["']([^"']+)["'][\s\S]*?section:\s*["']([^"']+)["'][\s\S]*?image:\s*["']([^"']+)["']/g;

let m;
const missingLocal = [];
let total = 0;
while ((m = regex.exec(content)) !== null) {
  total++;
  const id = m[1];
  const name = m[2];
  const section = m[3];
  const img = m[4];

  if (img.startsWith('/')) {
    const localPath = path.join(__dirname, '../public', img.replace(/^\//, ''));
    if (!fs.existsSync(localPath)) {
      missingLocal.push({ id, name, section, img, localPath });
    }
  }
}

console.log(`Audited ${total} products.`);
if (missingLocal.length > 0) {
  console.error(`Found ${missingLocal.length} missing local images:`, missingLocal);
} else {
  console.log('ALL local images exist on disk (100% verified)!');
}
