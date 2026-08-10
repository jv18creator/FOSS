import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'templates', 'occasions');

const builds = [
  { file: 'mcp-build-atelier-nord.mjs', out: 'atelier-nord.letterhead.json' },
  { file: 'mcp-build-violet-hour.mjs', out: 'violet-hour.letterhead.json' },
  { file: 'mcp-build-ledger-harvest.mjs', out: 'ledger-harvest.letterhead.json' },
];

const browser = await chromium.launch();
const page = await browser.newPage();

for (const { file, out } of builds) {
  const mod = await import(pathToFileURL(path.join(__dirname, file)).href);
  const fn = mod.default ?? mod;
  const payload = await fn(page);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, out), `${JSON.stringify(payload, null, 2)}\n`);
}

await browser.close();
console.log('Wrote', builds.length, 'templates to', outDir);
