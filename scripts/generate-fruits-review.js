const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../public/fruits-review');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));

const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>معاينة صور الفواكه الخارجية</title>
  <style>
    body { font-family: sans-serif; background: #f4f6f8; margin: 20px; }
    h1 { text-align: center; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .card { background: white; border-radius: 12px; padding: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; }
    .card img { width: 100%; height: 180px; object-fit: contain; background: #fafafa; border-radius: 8px; }
    .card p { margin: 8px 0 0; font-weight: bold; font-size: 14px; direction: ltr; }
  </style>
</head>
<body>
  <h1>معاينة صور الفواكه والأصناف الخارجية (${files.length} صورة)</h1>
  <div class="grid">
    ${files.map(f => `
      <div class="card">
        <img src="/fruits-review/${f}" alt="${f}" />
        <p>${f.replace('.jpg', '')}</p>
      </div>
    `).join('')}
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, '../public/fruits-review.html'), html, 'utf8');
console.log('Written fruits-review.html');
