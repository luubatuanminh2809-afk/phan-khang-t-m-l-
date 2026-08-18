const fs = require('fs');
const path = require('path');

const root = 'C:/Users/Dien luu/Documents/PKTL';
const distDir = path.join(root, 'dist');
const cssFile = fs.readdirSync(path.join(distDir, 'assets')).find(f => f.endsWith('.css'));
const jsFile = fs.readdirSync(path.join(distDir, 'assets')).find(f => f.endsWith('.js'));

const css = fs.readFileSync(path.join(distDir, 'assets', cssFile), 'utf8');
let js = fs.readFileSync(path.join(distDir, 'assets', jsFile), 'utf8');

// Walks public/images instead of listing every file by hand. The hand-written list drifted
// out of date the moment new scene art was added, and a missed entry fails silently: the
// path stays a plain URL that resolves to nothing once the HTML is opened offline. Files
// the bundle never references simply don't match and cost nothing.
const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

function collectImages(dir, urlPrefix) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    const url = urlPrefix + '/' + entry.name;
    if (entry.isDirectory()) return collectImages(full, url);
    const mime = MIME_BY_EXT[path.extname(entry.name).toLowerCase()];
    return mime ? [[url, full, mime]] : [];
  });
}

// longest path first, so a shorter path can never eat part of a longer one
const images = collectImages(path.join(root, 'public/images'), '/images')
  .sort((a, b) => b[0].length - a[0].length);


const unused = [];
for (const [urlPath, filePath, mime] of images) {
  const buf = fs.readFileSync(filePath);
  const b64 = `data:${mime};base64,` + buf.toString('base64');
  const before = js.length;
  js = js.split(urlPath).join(b64);
  // never referenced by the bundle — either genuinely unused art, or a path built by
  // string concatenation in the source, which survives bundling as separate ops rather
  // than one matchable literal (see the note in data/assetMap.ts)
  if (js.length === before) unused.push(urlPath);
}
if (unused.length) console.log('NOT referenced by the bundle (' + unused.length + '):', unused.join(', '));

// Artifact-compatible fragment: no doctype/html/head/body — the host wraps it.
const fragment = `<title>Moralyn</title>
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>`;

const outPath = path.join(root, 'moralyn-artifact.html');
fs.writeFileSync(outPath, fragment);
console.log('wrote', outPath, fragment.length, 'bytes total');
