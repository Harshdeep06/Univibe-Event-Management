const fs = require('fs');
const https = require('https');
const path = require('path');

const deps = [
  {
    url: 'https://cdn.tailwindcss.com',
    dest: path.join(__dirname, '..', 'public', 'js', 'tailwind.js')
  },
  {
    url: 'https://unpkg.com/lucide@0.400.0/dist/umd/lucide.min.js',
    dest: path.join(__dirname, '..', 'public', 'js', 'lucide.min.js')
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        download(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${url} -> ${dest}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  const jsDir = path.join(__dirname, '..', 'public', 'js');
  if (!fs.existsSync(jsDir)) {
    fs.mkdirSync(jsDir, { recursive: true });
  }

  for (const dep of deps) {
    try {
      console.log(`Downloading ${dep.url}...`);
      await download(dep.url, dep.dest);
    } catch (err) {
      console.error(`Error downloading ${dep.url}:`, err.message);
    }
  }
}

main();
