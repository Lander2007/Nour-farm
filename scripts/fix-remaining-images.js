const fs = require('fs');

let content = fs.readFileSync('data/products.ts', 'utf8');

// Replace avocado-fresh to /avocado.webp
content = content.replace(/(id:\s*["']avocado-fresh["'][\s\S]*?image:\s*)["'][^"']+["']/, '$1"/avocado.webp"');

// Replace tropical-avocado to /avocado.webp
content = content.replace(/(id:\s*["']tropical-avocado["'][\s\S]*?image:\s*)["'][^"']+["']/, '$1"/avocado.webp"');

// Replace sliced-avocado-250g to /avocado.webp
content = content.replace(/(id:\s*["']sliced-avocado-250g["'][\s\S]*?image:\s*)["'][^"']+["']/, '$1"/avocado.webp"');

// Replace sliced-avocado-fingers-150g to /avocado.webp
content = content.replace(/(id:\s*["']sliced-avocado-fingers-150g["'][\s\S]*?image:\s*)["'][^"']+["']/, '$1"/avocado.webp"');

// Replace fresh-pomegranate-seeds-250g to /pomegranate.webp
content = content.replace(/(id:\s*["']fresh-pomegranate-seeds-250g["'][\s\S]*?image:\s*)["'][^"']+["']/, '$1"/pomegranate.webp"');

// Replace pomegranates to /pomegranate.webp
content = content.replace(/(id:\s*["']pomegranate-fruit["'][\s\S]*?image:\s*)["'][^"']+["']/, '$1"/pomegranate.webp"');

// Replace sliced-orange-rounds-150g to /orange.webp
content = content.replace(/(id:\s*["']sliced-orange-rounds-150g["'][\s\S]*?image:\s*)["'][^"']+["']/, '$1"/orange.webp"');

// Replace navel-orange to /orange.webp
content = content.replace(/(id:\s*["']navel-orange["'][\s\S]*?image:\s*)["'][^"']+["']/, '$1"/orange.webp"');

// Replace local-orange to /orange.webp
content = content.replace(/(id:\s*["']local-orange["'][\s\S]*?image:\s*)["'][^"']+["']/, '$1"/orange.webp"');

// Replace italian-basil to /basil.webp
content = content.replace(/(id:\s*["']italian-basil["'][\s\S]*?image:\s*)["'][^"']+["']/, '$1"/basil.webp"');

fs.writeFileSync('data/products.ts', content, 'utf8');
console.log('Cleaned up remaining items to local high-res webp assets!');
