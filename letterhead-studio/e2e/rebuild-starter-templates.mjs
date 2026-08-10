/**
 * Rebuilds bundled starter letterheads via the editor UI (Playwright).
 * Run: node e2e/rebuild-starter-templates.mjs  (dev server on :5173)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'templates', 'occasions');
const assetsDir = path.join(root, 'public', 'starter-assets');

const mm = (n) => Math.round((n / 25.4) * 96);
const M = 15;
const PAGE_W = {
  a4: mm(210),
  'us-letter': mm(215.9),
  executive: mm(184.15),
};

async function buildTemplate(page, spec) {
  const tool = (name) => page.getByRole('button', { name, exact: true }).click();
  const pick = (i) =>
    page.evaluate((idx) => window.__letterheadEditor.selectContentIndex(idx), i);
  const xf = (patch) =>
    page.evaluate((p) => window.__letterheadEditor.transformActive(p), patch);
  const text = async (value) => {
    await tool('Layers');
    await page.getByTestId('sel-text').fill(value);
  };
  const lock = async () => {
    await tool('Layers');
    await page.getByTestId('sel-locked').check();
  };
  const uploadHero = async (filePath) => {
    await tool('Upload');
    await page.getByTestId('upload-logo').setInputFiles(filePath);
    await page.getByTestId('upload-asset').click();
  };

  const pw = PAGE_W[spec.formatId];
  const innerW = pw - mm(M * 2);

  await page.goto(`${process.env.EDITOR_URL ?? 'http://127.0.0.1:5173'}/`);
  await page.waitForFunction(() => window.__letterheadEditor?.getCounts() != null);

  await tool('Templates');
  await page.getByTestId('template-name').fill(spec.name);
  await tool('Resize');
  await page.getByTestId('page-format').selectOption(spec.formatId);
  await page.getByTestId('orientation-portrait').click();
  await tool('Background');
  await page.getByRole('button', { name: spec.bgLabel, exact: true }).click();

  let idx = 0;

  await uploadHero(spec.heroImage);
  await pick(idx);
  await xf({
    left: 0,
    top: 0,
    width: pw,
    height: mm(spec.heroHeightMm),
    sendToBack: true,
  });
  await lock();
  idx++;

  await tool('Elements');
  await page.getByRole('button', { name: 'Rectangle', exact: true }).click();
  await pick(idx);
  await xf({
    left: 0,
    top: mm(spec.heroHeightMm - 18),
    width: pw,
    height: mm(18),
    fill: spec.overlay,
    opacity: 0.88,
  });
  await lock();
  idx++;

  await tool('Text');
  await page.getByTestId('add-heading').click();
  await pick(idx);
  await xf({
    left: mm(M),
    top: mm(spec.heroHeightMm - 14),
    fill: spec.titleColor,
    fontFamily: spec.titleFont,
    fontSize: spec.titleSize,
  });
  await text(spec.title);
  idx++;

  await tool('Text');
  await page.getByRole('button', { name: 'Create sub-header', exact: true }).click();
  await pick(idx);
  await xf({
    left: mm(M),
    top: mm(spec.heroHeightMm - 6),
    fill: spec.subColor,
    fontFamily: spec.subFont,
    fontSize: 10,
  });
  await text(spec.subtitle);
  idx++;

  await tool('Elements');
  await page.getByTestId('add-line').click();
  await pick(idx);
  await xf({
    line: {
      x1: mm(M),
      y1: mm(spec.heroHeightMm + 4),
      x2: mm(M) + innerW,
      y2: mm(spec.heroHeightMm + 4),
    },
    stroke: spec.accent,
    strokeWidth: 1.5,
  });
  await lock();
  idx++;

  await tool('Text');
  await page.getByTestId('add-body').click();
  await pick(idx);
  await xf({
    left: mm(M),
    top: mm(spec.heroHeightMm + 8),
    fill: spec.bodyColor,
    fontFamily: spec.bodyFont,
    fontSize: 10,
  });
  await text(spec.contact);
  idx++;

  await tool('Elements');
  await page.getByTestId('add-line').click();
  await pick(idx);
  await xf({
    line: {
      x1: mm(M),
      y1: mm(spec.bodyGuideMm),
      x2: mm(M) + innerW,
      y2: mm(spec.bodyGuideMm),
    },
    stroke: spec.guideColor,
    strokeWidth: 0.5,
  });
  await lock();
  idx++;

  await tool('Text');
  await page.getByTestId('add-body').click();
  await pick(idx);
  await xf({
    left: mm(M),
    top: mm(spec.bodyGuideMm + 3),
    fill: spec.mutedColor,
    fontFamily: spec.bodyFont,
    fontSize: 9,
    opacity: 0.85,
  });
  await text(spec.bodyHint);

  return page.evaluate(() => window.__letterheadEditor.exportPayload());
}

const specs = [
  {
    id: 'atelier-nord',
    name: 'Atelier Nord',
    formatId: 'a4',
    bgLabel: 'Cloud',
    heroImage: path.join(assetsDir, 'atelier-hero.jpg'),
    heroHeightMm: 52,
    overlay: '#0f172a',
    title: 'Atelier Nord',
    titleFont: '"Libre Baskerville", Georgia, serif',
    titleSize: 26,
    titleColor: '#faf8f5',
    subtitle: 'Exhibition architecture · Copenhagen',
    subFont: '"Source Sans 3", system-ui, sans-serif',
    subColor: '#e2e8f0',
    accent: '#b45309',
    contact:
      'Vesterbrogade 12 · 1620 København V\n+45 33 12 90 00 · studio@ateliernord.dk · ateliernord.dk',
    bodyFont: '"Source Sans 3", system-ui, sans-serif',
    bodyColor: '#334155',
    bodyGuideMm: 88,
    guideColor: '#cbd5e1',
    mutedColor: '#64748b',
    bodyHint: 'Letter body begins below this line.',
  },
  {
    id: 'violet-hour',
    name: 'Violet Hour',
    formatId: 'us-letter',
    bgLabel: 'White',
    heroImage: path.join(assetsDir, 'violet-hero.jpg'),
    heroHeightMm: 48,
    overlay: '#1f1024',
    title: 'Violet Hour',
    titleFont: '"Playfair Display", Georgia, serif',
    titleSize: 30,
    titleColor: '#fdf4ff',
    subtitle: 'Private events · Chicago',
    subFont: 'Raleway, system-ui, sans-serif',
    subColor: '#f5d0fe',
    accent: '#9d174d',
    contact:
      '440 Lake Shore Drive · Penthouse 18\nbookings@violethour.events · (312) 555-0184',
    bodyFont: 'Raleway, system-ui, sans-serif',
    bodyColor: '#44403c',
    bodyGuideMm: 82,
    guideColor: '#e9d5ff',
    mutedColor: '#78716c',
    bodyHint: 'Letter body begins below this line.',
  },
  {
    id: 'ledger-harvest',
    name: 'Ledger Harvest',
    formatId: 'executive',
    bgLabel: 'Mint',
    heroImage: path.join(assetsDir, 'ledger-hero.jpg'),
    heroHeightMm: 46,
    overlay: '#14532d',
    title: 'Ledger Harvest Co-op',
    titleFont: 'Oswald, system-ui, sans-serif',
    titleSize: 22,
    titleColor: '#f7fee7',
    subtitle: 'Soil-to-table since 2011',
    subFont: 'Merriweather, Georgia, serif',
    subColor: '#dcfce7',
    accent: '#d97706',
    contact:
      'Route 9 Market Barn · Hudson, NY 12534\n(518) 555-0140 · hello@ledgerharvest.coop',
    bodyFont: 'Merriweather, Georgia, serif',
    bodyColor: '#365314',
    bodyGuideMm: 78,
    guideColor: '#bbf7d0',
    mutedColor: '#4d7c0f',
    bodyHint: 'Letter body begins below this line.',
  },
];

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 960 });

const baseUrl = process.env.EDITOR_URL ?? 'http://127.0.0.1:5173';

function externalizeTemplateImages(payload, assetBase = '/starter-assets') {
  const objects = payload?.canvas?.objects;
  if (!Array.isArray(objects)) return payload;
  for (const obj of objects) {
    if (obj.type !== 'Image' || !obj.letterhead?.label) continue;
    const name = obj.letterhead.label;
    if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')) {
      obj.src = `${assetBase}/${name}`;
    }
  }
  return payload;
}

const publicOut = path.join(root, 'public', 'templates', 'occasions');

for (const spec of specs) {
  process.env.EDITOR_URL = baseUrl;
  let payload = await buildTemplate(page, spec);
  payload = externalizeTemplateImages(payload);
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(publicOut, { recursive: true });
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  fs.writeFileSync(path.join(outDir, `${spec.id}.letterhead.json`), json);
  fs.writeFileSync(path.join(publicOut, `${spec.id}.letterhead.json`), json);
  console.log('Wrote', spec.id);
}

await browser.close();
