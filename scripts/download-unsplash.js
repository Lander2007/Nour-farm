const fs = require('fs');
const path = require('path');
const https = require('https');

const unsplashMap = [
  { id: 'grapefruit', file: 'grapefruit.jpg', url: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?auto=format&fit=crop&w=800&q=85' },
  { id: 'crimson-grapes', file: 'crimson-grapes.jpg', url: 'https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=800&q=85' },
  { id: 'red-roomi-grapes', file: 'red-roomi-grapes.jpg', url: 'https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=800&q=85' },
  { id: 'red-apple', file: 'red-apple.jpg', url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=85' },
  { id: 'lebanese-apple', file: 'lebanese-apple.jpg', url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=85' },
  { id: 'sweet-guava', file: 'sweet-guava.jpg', url: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?auto=format&fit=crop&w=800&q=85' },
  { id: 'ewais-mango', file: 'ewais-mango.jpg', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=85' },
  { id: 'zebdia-mango', file: 'zebdia-mango.jpg', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=85' },
  { id: 'fass-mango', file: 'fass-mango.jpg', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=85' },
  { id: 'watermelon', file: 'watermelon.jpg', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=85' },
  { id: 'sweet-peach', file: 'sweet-peach.jpg', url: 'https://images.unsplash.com/photo-1629828874514-c1e5103f2150?auto=format&fit=crop&w=800&q=85' },
  { id: 'sweet-pear', file: 'sweet-pear.jpg', url: 'https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?auto=format&fit=crop&w=800&q=85' },
  { id: 'golden-pineapple', file: 'golden-pineapple.jpg', url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=85' },
  { id: 'kiwi-fruit', file: 'kiwi-fruit.jpg', url: 'https://images.unsplash.com/photo-1585059895524-72359e06133a?auto=format&fit=crop&w=800&q=85' },
  { id: 'papaya-fruit', file: 'papaya-fruit.jpg', url: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=800&q=85' },
  { id: 'moroccan-banana', file: 'moroccan-banana.jpg', url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=85' },
  { id: 'pico-banana', file: 'pico-banana.jpg', url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=85' },
  { id: 'imported-banana', file: 'imported-banana.jpg', url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=85' }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
      }
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  const targetDir = path.join(__dirname, '../public/noor-farm-images');
  for (const item of unsplashMap) {
    const dest = path.join(targetDir, item.file);
    if (!fs.existsSync(dest)) {
      console.log(`Downloading ${item.file}...`);
      try {
        await download(item.url, dest);
        console.log(`Saved ${item.file}`);
      } catch (e) {
        console.error(`Error downloading ${item.file}:`, e.message);
      }
    } else {
      console.log(`Already exists: ${item.file}`);
    }
  }

  // Update data/products.ts
  let productsContent = fs.readFileSync(path.join(__dirname, '../data/products.ts'), 'utf8');
  for (const item of unsplashMap) {
    productsContent = productsContent.replace(item.url, `/noor-farm-images/${item.file}`);
  }
  fs.writeFileSync(path.join(__dirname, '../data/products.ts'), productsContent, 'utf8');
  console.log('Updated data/products.ts to use 100% local images!');
}

run();
