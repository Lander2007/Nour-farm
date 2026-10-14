const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\kaled\\.gemini\\antigravity-ide\\brain\\b9e9f6fe-e9c6-4cad-8e2c-c38068e5bc8e';
const dest1 = path.join(__dirname, '../public/noor-farm-images');
const dest2 = path.join(__dirname, '../public/noor farm images');

const files = fs.readdirSync(brainDir);

const mapping = {
  'red_plum': 'red-plum.jpg',
  'cantaloupe': 'cantaloupe.jpg',
  'fresh_figs': 'fresh-figs.jpg',
  'golden_apple': 'golden-apple.jpg',
  'persimmon_kaka': 'persimmon-kaka.jpg',
  'shelled_peas': 'shelled-peas.jpg',
  'peas_carrots': 'peas-carrots.jpg',
  'fresh_dates': 'fresh-dates.jpg',
  'chestnuts': 'chestnuts.jpg',
  'nectarine': 'nectarine.jpg',
};

for (const [prefix, targetName] of Object.entries(mapping)) {
  const match = files.find(f => f.startsWith(prefix) && f.endsWith('.jpg'));
  if (match) {
    const src = path.join(brainDir, match);
    fs.copyFileSync(src, path.join(dest1, targetName));
    fs.copyFileSync(src, path.join(dest2, targetName));
    console.log(`Copied ${match} -> ${targetName}`);
  } else {
    console.warn(`Could not find file with prefix ${prefix}`);
  }
}
