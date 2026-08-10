import { test } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  activateBackground,
  addShape,
  addSolidLine,
  addTextPreset,
  addTextStyleTemplate,
  editSelectedText,
  freshEditor,
  lockSelectedLayout,
  mm,
  saveTemplateToFile,
  selectContent,
  setPageFormat,
  setPortrait,
  setTemplateName,
  transformActive,
} from './template-builder';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'templates', 'occasions');

test.describe.configure({ mode: 'serial' });
test.setTimeout(120_000);

test('build occasion letterhead templates via editor', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });

  // —— 1. Sterling Boardroom — formal business correspondence ——
  await freshEditor(page);
  await setTemplateName(page, 'Sterling Boardroom');
  await setPageFormat(page, 'us-letter');
  await setPortrait(page);
  await activateBackground(page, 'White');

  await addShape(page, 'Rectangle');
  await selectContent(page, 0);
  await transformActive(page, {
    left: 0,
    top: 0,
    width: mm(215.9),
    height: mm(24),
    fill: '#1a2744',
    sendToBack: true,
  });
  await lockSelectedLayout(page);

  await addTextPreset(page, 'header');
  await selectContent(page, 1);
  await transformActive(page, {
    left: mm(14),
    top: mm(6),
    fill: '#f4f0e8',
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: 28,
  });
  await editSelectedText(page, 'STERLING & CO.');

  await addTextPreset(page, 'subheader');
  await selectContent(page, 2);
  await transformActive(page, {
    left: mm(14),
    top: mm(15),
    fill: '#c9b896',
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 11,
  });
  await editSelectedText(page, 'Capital Advisory  ·  Est. 1987');

  await addSolidLine(page);
  await selectContent(page, 3);
  await transformActive(page, {
    line: {
      x1: mm(12),
      y1: mm(30),
      x2: mm(203.9),
      y2: mm(30),
    },
    stroke: '#b8860b',
    strokeWidth: 1.5,
  });

  await addShape(page, 'Diamond');
  await selectContent(page, 4);
  await transformActive(page, {
    left: mm(103),
    top: mm(27),
    width: mm(6),
    height: mm(6),
    fill: '#b8860b',
    opacity: 0.95,
  });
  await lockSelectedLayout(page);

  await addTextPreset(page, 'body');
  await selectContent(page, 5);
  await transformActive(page, {
    left: mm(12),
    top: mm(34),
    fill: '#5c6578',
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 10,
  });
  await editSelectedText(
    page,
    'One Financial Plaza  ·  Suite 2400  ·  Boston, MA 02110\n+1 (617) 555-0142  ·  counsel@sterlingco.com',
  );

  await saveTemplateToFile(
    page,
    path.join(OUT_DIR, 'sterling-boardroom.letterhead.json'),
  );

  // —— 2. Champagne Vows — wedding & celebration stationery ——
  await freshEditor(page);
  await setTemplateName(page, 'Champagne Vows');
  await setPageFormat(page, 'a4');
  await setPortrait(page);
  await activateBackground(page, 'Blush');

  await addShape(page, 'Circle');
  await selectContent(page, 0);
  await transformActive(page, {
    left: mm(12),
    top: mm(10),
    width: mm(22),
    height: mm(22),
    fill: '#f5efe6',
    stroke: '#c9a87c',
    strokeWidth: 1,
  });
  await lockSelectedLayout(page);

  await addTextStyleTemplate(page, 'Timeless Elegance');
  await selectContent(page, 1);
  await transformActive(page, {
    left: mm(38),
    top: mm(11),
    fill: '#3d2c2e',
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: 30,
  });
  await editSelectedText(page, 'Eleanor & James');

  await addTextPreset(page, 'subheader');
  await selectContent(page, 2);
  await transformActive(page, {
    left: mm(38),
    top: mm(22),
    fill: '#8b5a6b',
    fontFamily: 'Raleway, system-ui, sans-serif',
    fontSize: 12,
  });
  await editSelectedText(page, 'WITH LOVE  ·  JUNE 14, 2026  ·  NAPA VALLEY');

  await addSolidLine(page);
  await selectContent(page, 3);
  await transformActive(page, {
    line: {
      x1: mm(12),
      y1: mm(32),
      x2: mm(198),
      y2: mm(32),
    },
    stroke: '#c9a87c',
    strokeWidth: 1,
  });

  await addTextStyleTemplate(page, 'Thank you');
  await selectContent(page, 4);
  await transformActive(page, {
    left: mm(12),
    top: mm(36),
    fill: '#be123c',
    fontFamily: '"Dancing Script", cursive',
    fontSize: 22,
    opacity: 0.85,
  });
  await editSelectedText(page, 'Gratefully yours,');

  await addTextPreset(page, 'body');
  await selectContent(page, 5);
  await transformActive(page, {
    left: mm(12),
    top: mm(48),
    fill: '#5c4a4d',
    fontFamily: '"Libre Baskerville", Georgia, serif',
    fontSize: 11,
  });
  await editSelectedText(
    page,
    'Willow & Vine Estate  ·  1840 Silverado Trail  ·  St. Helena, CA 94574\nrsvp@eleanorandjames.com',
  );

  await saveTemplateToFile(page, path.join(OUT_DIR, 'champagne-vows.letterhead.json'));

  // —— 3. Evergreen Holiday — seasonal correspondence ——
  await freshEditor(page);
  await setTemplateName(page, 'Evergreen Holiday');
  await setPageFormat(page, 'us-letter');
  await setPortrait(page);
  await activateBackground(page, 'Cloud');

  await addShape(page, 'Rectangle');
  await selectContent(page, 0);
  await transformActive(page, {
    left: 0,
    top: 0,
    width: mm(215.9),
    height: mm(18),
    fill: '#0f2e1f',
    sendToBack: true,
  });
  await lockSelectedLayout(page);

  await addTextPreset(page, 'header');
  await selectContent(page, 1);
  await transformActive(page, {
    left: mm(12),
    top: mm(4),
    fill: '#f5efe6',
    fontFamily: 'Oswald, system-ui, sans-serif',
    fontSize: 22,
  });
  await editSelectedText(page, 'NORTHWOOD COLLECTIVE');

  await addTextPreset(page, 'subheader');
  await selectContent(page, 2);
  await transformActive(page, {
    left: mm(12),
    top: mm(12),
    fill: '#a8c5b0',
    fontFamily: 'Merriweather, Georgia, serif',
    fontSize: 10,
  });
  await editSelectedText(page, 'Season’s greetings from our home to yours');

  await addSolidLine(page);
  await selectContent(page, 3);
  await transformActive(page, {
    line: {
      x1: mm(12),
      y1: mm(22),
      x2: mm(203.9),
      y2: mm(22),
    },
    stroke: '#c41e3a',
    strokeWidth: 2,
  });

  await addShape(page, 'Star');
  await selectContent(page, 4);
  await transformActive(page, {
    left: mm(100),
    top: mm(19),
    width: mm(8),
    height: mm(8),
    fill: '#c41e3a',
  });
  await lockSelectedLayout(page);

  await addTextPreset(page, 'body');
  await selectContent(page, 5);
  await transformActive(page, {
    left: mm(12),
    top: mm(26),
    fill: '#334155',
    fontFamily: 'Merriweather, Georgia, serif',
    fontSize: 11,
  });
  await editSelectedText(
    page,
    '42 Spruce Lane  ·  Burlington, VT 05401  ·  (802) 555-0198\nhello@northwoodcollective.com',
  );

  await addTextStyleTemplate(page, '"Create with purpose"');
  await selectContent(page, 6);
  await transformActive(page, {
    left: mm(12),
    top: mm(42),
    fill: '#0f2e1f',
    fontFamily: 'Merriweather, Georgia, serif',
    fontSize: 14,
    opacity: 0.9,
  });
  await editSelectedText(page, '"Warm wishes for a bright new year."');

  await saveTemplateToFile(
    page,
    path.join(OUT_DIR, 'evergreen-holiday.letterhead.json'),
  );
});
