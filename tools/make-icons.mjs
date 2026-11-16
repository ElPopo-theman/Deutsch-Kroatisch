// Erzeugt die App-Symbole (PNG) aus einer SVG-Vorlage.
// Aufruf: node tools/make-icons.mjs   (benötigt Playwright mit Chromium und die Schrift „Inter“)

import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';

// require() findet auch ein global installiertes Playwright.
const { chromium } = createRequire(import.meta.url)('playwright');

const svg = (scale) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="sea" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b5d8f"/>
      <stop offset="1" stop-color="#0c86ab"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#sea)"/>
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">
    <path fill="#ffffff" d="M126 112h260a62 62 0 0 1 62 62v128a62 62 0 0 1-62 62H232l-88 70 16-70h-34a62 62 0 0 1-62-62V174a62 62 0 0 1 62-62z"/>
    <text x="256" y="290" text-anchor="middle" font-family="Inter, 'Helvetica Neue', Arial, sans-serif" font-weight="900"
          font-size="148" letter-spacing="-6" fill="#0b5d8f">Bok<tspan fill="#c8502a">!</tspan></text>
  </g>
</svg>`;

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0b5d8f"/>
  <path fill="#fff" d="M18 15h28a8 8 0 0 1 8 8v14a8 8 0 0 1-8 8H30l-11 9 2-9h-3a8 8 0 0 1-8-8V23a8 8 0 0 1 8-8z"/>
  <text x="32" y="39" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', Arial, sans-serif" font-weight="900" font-size="22" fill="#0b5d8f">B<tspan fill="#c8502a">!</tspan></text>
</svg>
`;

const targets = [
  ['icons/icon-512.png', 512, 1],
  ['icons/icon-192.png', 192, 1],
  ['icons/icon-180.png', 180, 1],
  ['icons/icon-maskable-512.png', 512, 0.78],
];

await mkdir('icons', { recursive: true });
await writeFile('icons/favicon.svg', favicon);

const browser = await chromium.launch();
for (const [file, size, scale] of targets) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg(scale)}`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width: size, height: size } });
  await page.close();
  console.log('geschrieben:', file);
}
await browser.close();
