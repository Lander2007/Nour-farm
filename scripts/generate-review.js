const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '../public/noor farm images');
const files = fs.readdirSync(imgDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp') || f.endsWith('.jpeg'));

const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>معاينة صور نور فارم - Noor Farm Images</title>
  <style>
    body { font-family: sans-serif; background: #f4f6f8; margin: 20px; }
    h1 { text-align: center; color: #1e3a1e; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
    .card { background: white; border-radius: 12px; padding: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; }
    .card img { width: 100%; height: 200px; object-fit: contain; background: #fafafa; border-radius: 8px; }
    .card p { margin: 8px 0 0; font-weight: bold; font-size: 13px; color: #333; direction: ltr; }
  </style>
</head>
<body>
  <h1>معاينة صور منتجات نور فارم (${files.length} صورة)</h1>
  <div class="grid">
    ${files.map(f => `
      <div class="card">
        <img src="/noor%20farm%20images/${encodeURIComponent(f)}" alt="${f}" loading="lazy" />
        <p>${f}</p>
      </div>
    `).join('')}
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, '../public/review-images.html'), html, 'utf8');
console.log('Generated review-images.html successfully with', files.length, 'images.');
