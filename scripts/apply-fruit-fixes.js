const fs = require('fs');

let content = fs.readFileSync('data/products.ts', 'utf8');

const fruitFixes = {
  'red-plum': '/noor-farm-images/red-plum.jpg',
  'cantaloupe': '/noor-farm-images/cantaloupe.jpg',
  'fresh-figs': '/noor-farm-images/fresh-figs.jpg',
  'golden-apple': '/noor-farm-images/golden-apple.jpg',
  'persimmon-kaka': '/noor-farm-images/persimmon-kaka.jpg',
  'shelled-peas-500g': '/noor-farm-images/shelled-peas.jpg',
  'peas-carrots-mix-500g': '/noor-farm-images/peas-carrots.jpg',
  'samany-dates': '/noor-farm-images/fresh-dates.jpg',
  'zaghloul-dates': '/noor-farm-images/fresh-dates.jpg',
  'siwi-dates': '/noor-farm-images/fresh-dates.jpg',
  'barhi-dates': '/noor-farm-images/fresh-dates.jpg',
  'chestnuts': '/noor-farm-images/chestnuts.jpg',
  'nectarine': '/noor-farm-images/nectarine.jpg',
};

for (const [id, newImg] of Object.entries(fruitFixes)) {
  const blockRegex = new RegExp(`(id:\\s*["']${id}["'][\\s\\S]*?image:\\s*)(["'][^"']+["'])`, 'g');
  if (blockRegex.test(content)) {
    content = content.replace(blockRegex, `$1"${newImg}"`);
    console.log(`Updated [${id}] -> ${newImg}`);
  } else {
    console.warn(`Could not find id: ${id}`);
  }
}

fs.writeFileSync('data/products.ts', content, 'utf8');
console.log('All mismatched products successfully updated!');
