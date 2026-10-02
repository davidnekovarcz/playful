const fs = require('fs');
const path = require('path');

const standaloneDir = path.join('.next', 'standalone');
const publicSrc = 'public';
const publicDest = path.join(standaloneDir, 'public');
const staticSrc = path.join('.next', 'static');
const staticDest = path.join(standaloneDir, '.next', 'static');

if (!fs.existsSync(standaloneDir)) {
  console.error('Standalone output missing. Run `next build` with output: "standalone" first.');
  process.exit(1);
}

fs.cpSync(publicSrc, publicDest, { recursive: true });
fs.cpSync(staticSrc, staticDest, { recursive: true });

console.log('Copied public/ and .next/static into standalone output');
