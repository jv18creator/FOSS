import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import {
  FORMATS,
  gotoEditor,
  studioTool,
  studioExport,
  editorCounts,
  canvasSize,
  mmToPx300,
  pngDimensions,
  pdfMediaBoxPoints,
  mmToPdfPoints,
} from './helpers';

test.describe('A. Canvas & viewport', () => {
  test('fresh load: blank canvas', async ({ page }) => {
    await gotoEditor(page);
    const counts = await editorCounts(page);
    expect(counts.content).toBe(0);
    expect(counts.guides).toBe(0);
    await expect(page.getByTestId('safe-margin-overlay')).toHaveCount(0);
    await expect(page.getByTestId('letterhead-canvas')).toBeVisible();
  });

  test('responsive: toolbar visible at 1280 and 768', async ({ page }) => {
    await gotoEditor(page);
    for (const width of [1280, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.getByTestId('toolbar')).toBeVisible();
      await expect(page.getByTestId('letterhead-canvas')).toBeVisible();
      await expect(page.getByTestId('safe-margin-overlay')).toHaveCount(0);
    }
  });

  test('heading can be placed inside safe margin', async ({ page }) => {
    await gotoEditor(page);
    await studioTool(page, 'Text');
    await page.getByTestId('add-heading').click();
    const layout = await page.evaluate(() => {
      const ed = window.__letterheadEditor!;
      const pos = ed.getActivePosition();
      const marginLeftPx = Math.round((12 / 25.4) * 96);
      return pos ? { marginLeftPx, left: pos.left } : null;
    });
    expect(layout).not.toBeNull();
    expect(layout!.left).toBeGreaterThanOrEqual(layout!.marginLeftPx - 2);
  });
});

test.describe('C. Page formats', () => {
  for (const fmt of FORMATS) {
    test(`format ${fmt.label} shows mm dimensions and canvas pixels`, async ({ page }) => {
      await gotoEditor(page);
      await studioTool(page, 'Resize');
      await page.getByTestId('page-format').selectOption(fmt.id);
      await expect(page.getByTestId('stage-format-label')).toContainText(fmt.label);
      await expect(page.getByTestId('stage-dimensions')).toContainText(
        `${fmt.w} × ${fmt.h} mm`,
      );
      const size = await canvasSize(page);
      const expectedW = Math.round((fmt.w / 25.4) * 96);
      const expectedH = Math.round((fmt.h / 25.4) * 96);
      expect(size.width).toBe(expectedW);
      expect(size.height).toBe(expectedH);
    });
  }

  test('content rescales on format change (not wiped)', async ({ page }) => {
    await gotoEditor(page);
    await studioTool(page, 'Text');
    await page.getByTestId('add-heading').click();
    await page.getByTestId('add-body').click();
    const before = await editorCounts(page);
    expect(before.content).toBe(2);
    await studioTool(page, 'Resize');
    await page.getByTestId('page-format').selectOption('legal');
    await studioTool(page, 'Layers');
    await expect(page.getByTestId('layer-list')).toContainText('Create header');
    const after = await editorCounts(page);
    expect(after.content).toBe(before.content);
  });

  test('landscape swaps width and height on stage', async ({ page }) => {
    await gotoEditor(page);
    await studioTool(page, 'Resize');
    await page.getByTestId('page-format').selectOption('a4');
    await page.getByTestId('orientation-landscape').click();
    await expect(page.getByTestId('stage-format-label')).toContainText('Landscape');
    await expect(page.getByTestId('stage-dimensions')).toContainText('297 × 210 mm');
    const size = await canvasSize(page);
    expect(size.width).toBe(Math.round((297 / 25.4) * 96));
    expect(size.height).toBe(Math.round((210 / 25.4) * 96));
  });

  test('orientation change rescales user content', async ({ page }) => {
    await gotoEditor(page);
    await studioTool(page, 'Text');
    await page.getByTestId('add-heading').click();
    const before = await editorCounts(page);
    await studioTool(page, 'Resize');
    await page.getByTestId('orientation-landscape').click();
    await studioTool(page, 'Layers');
    await expect(page.getByTestId('layer-list')).toContainText('Create header');
    const after = await editorCounts(page);
    expect(after.content).toBe(before.content);
  });
});

test.describe('D. Design mode — elements', () => {
  test('add heading, body, divider, shape', async ({ page }) => {
    await gotoEditor(page);
    await studioTool(page, 'Text');
    await page.getByTestId('add-heading').click();
    await page.getByTestId('add-body').click();
    await studioTool(page, 'Elements');
    await page.getByTestId('add-line').click();
    await page.locator('.studio-element-tile').first().click();
    await studioTool(page, 'Layers');
    const list = page.getByTestId('layer-list');
    await expect(list).toContainText('Create header');
    await expect(list).toContainText('Create body text');
    await expect(list).toContainText('Line');
    await expect(list).toContainText('rect');
  });

  test('delete removes selection; no fabric guides', async ({ page }) => {
    await gotoEditor(page);
    await studioTool(page, 'Text');
    await page.getByTestId('add-heading').click();
    const before = await editorCounts(page);
    await studioTool(page, 'Layers');
    await page.getByTestId('delete-selected').click();
    const after = await editorCounts(page);
    expect(after.content).toBe(before.content - 1);
    expect(after.guides).toBe(0);
  });

  test('editable field flag persists in JSON export', async ({ page }) => {
    await gotoEditor(page);
    await studioTool(page, 'Text');
    await page.getByTestId('add-heading').click();
    await studioTool(page, 'Layers');
    await page.getByTestId('sel-placeholder').check();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      studioExport(page, 'export-json'),
    ]);
    const filePath = await download.path();
    expect(filePath).toBeTruthy();
    const raw = fs.readFileSync(filePath!, 'utf8');
    const json = JSON.parse(raw) as { canvas?: { objects?: unknown[] } };
    const blob = JSON.stringify(json);
    expect(blob).toContain('placeholder');
    expect(blob).toContain('true');
  });

  test('logo upload scales to ~40 mm max width', async ({ page }) => {
    await gotoEditor(page);
    const logoPath = path.join(import.meta.dirname, 'fixtures', 'logo.png');
    await studioTool(page, 'Upload');
    await page.getByTestId('upload-logo').setInputFiles(logoPath);
    await page.getByTestId('upload-asset').click();
    await studioTool(page, 'Layers');
    await expect(page.getByTestId('layer-list')).toContainText('logo.png');
    const logoPx = await page.evaluate(() => window.__letterheadEditor!.getLogoWidthPx());
    const maxPx = Math.round((40 / 25.4) * 96);
    expect(logoPx).not.toBeNull();
    expect(logoPx!).toBeLessThanOrEqual(maxPx + 1);
  });

  test('stack order: shape below heading when added in sequence', async ({ page }) => {
    await gotoEditor(page);
    await studioTool(page, 'Elements');
    await page.locator('.studio-element-tile').first().click();
    await studioTool(page, 'Text');
    await page.getByTestId('add-heading').click();
    const roles = await page.evaluate(() => window.__letterheadEditor!.getStackRoles());
    const shapeIdx = roles.indexOf('shape');
    const headingIdx = roles.indexOf('heading');
    expect(shapeIdx).toBeGreaterThanOrEqual(0);
    expect(headingIdx).toBeGreaterThan(shapeIdx);
  });
});

test.describe('E. Use template mode', () => {
  test('locked fields respect use template mode', async ({ page }) => {
    await gotoEditor(page);
    await studioTool(page, 'Text');
    await page.getByTestId('add-heading').click();
    await studioTool(page, 'Layers');
    await page.getByTestId('sel-locked').check();
    await page.getByTestId('add-body').click();
    await studioTool(page, 'Resize');
    await page.getByTestId('mode-use').click();
    await expect(page.getByTestId('delete-selected')).toHaveCount(0);
    await studioTool(page, 'Layers');
    await page.getByRole('button', { name: 'Create header' }).click();
    expect(await page.evaluate(() => window.__letterheadEditor!.getActiveType())).toBeNull();
    await page.getByRole('button', { name: 'Create body text' }).click();
    await expect(page.getByTestId('sel-text')).toBeVisible();
    await page.getByTestId('sel-text').fill('Updated body\nLine two');
    await expect(page.getByTestId('sel-text')).toHaveValue('Updated body\nLine two');
  });

  test('design → use → design restores design controls', async ({ page }) => {
    await gotoEditor(page);
    await studioTool(page, 'Text');
    await page.getByTestId('add-heading').click();
    await studioTool(page, 'Resize');
    await page.getByTestId('mode-use').click();
    await page.getByTestId('mode-design').click();
    await studioTool(page, 'Layers');
    await expect(page.getByTestId('delete-selected')).toBeEnabled();
    await expect(page.getByTestId('sel-locked')).toBeVisible();
  });
});

test.describe('F. Templates panel', () => {
  test('shows blank-canvas hint and name field', async ({ page }) => {
    await gotoEditor(page);
    await studioTool(page, 'Templates');
    await expect(page.getByText(/blank page/i)).toBeVisible();
    await expect(page.getByTestId('template-name')).toBeVisible();
  });
});

test.describe('G. Inspector & layers', () => {
  test('layer click selects; label edit updates list', async ({ page }) => {
    await gotoEditor(page);
    await studioTool(page, 'Text');
    await page.getByTestId('add-heading').click();
    await studioTool(page, 'Layers');
    await page.getByTestId('sel-label').fill('Main title');
    await expect(page.getByTestId('layer-list')).toContainText('Main title');
  });

  test('multi-line body preserved', async ({ page }) => {
    await gotoEditor(page);
    await studioTool(page, 'Text');
    await page.getByTestId('add-body').click();
    await studioTool(page, 'Layers');
    const text = 'Line A\nLine B\nLine C';
    await page.getByTestId('sel-text').fill(text);
    await expect(page.getByTestId('sel-text')).toHaveValue(text);
  });
});

test.describe('H. Export / import', () => {
  test('PNG download approximate 300 DPI for A4', async ({ page }) => {
    await gotoEditor(page);
    await studioTool(page, 'Text');
    await page.getByTestId('add-heading').click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      studioExport(page, 'export-png'),
    ]);
    const filePath = await download.path();
    expect(filePath).toBeTruthy();
    const buf = fs.readFileSync(filePath!);
    const size = pngDimensions(buf);
    const { width, height } = mmToPx300(210, 297);
    expect(Math.abs(size.width - width)).toBeLessThanOrEqual(2);
    expect(Math.abs(size.height - height)).toBeLessThanOrEqual(2);
  });

  test('JSON round-trip restores format and layers', async ({ page }) => {
    await gotoEditor(page);
    await page.getByTestId('template-name').fill('QA Template');
    await studioTool(page, 'Text');
    await page.getByTestId('add-heading').click();
    await studioTool(page, 'Layers');
    await page.getByTestId('sel-label').fill('Company name');
    await studioTool(page, 'Resize');
    await page.getByTestId('page-format').selectOption('us-letter');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      studioExport(page, 'export-json'),
    ]);
    const jsonPath = await download.path();
    await page.reload();
    await page.waitForFunction(() => window.__letterheadEditor?.getCounts() != null);
    await studioTool(page, 'Templates');
    const fileInput = page.getByTestId('import-json');
    await fileInput.setInputFiles(jsonPath!);
    await expect(page.getByTestId('template-name')).toHaveValue('QA Template');
    await expect(page.getByTestId('stage-format-label')).toContainText('US Letter');
    await studioTool(page, 'Layers');
    await expect(page.getByTestId('layer-list')).toContainText('Company name');
  });

  test('broken JSON shows alert and app stays usable', async ({ page }) => {
    await gotoEditor(page);
    const bad = path.join(test.info().project.outputDir, 'bad.json');
    fs.mkdirSync(test.info().project.outputDir, { recursive: true });
    fs.writeFileSync(bad, '{ not valid');
    page.once('dialog', async (d) => {
      expect(d.message()).toMatch(/Could not load/i);
      await d.accept();
    });
    await studioTool(page, 'Templates');
    await page.getByTestId('import-json').setInputFiles(bad);
    await studioTool(page, 'Text');
    await page.getByTestId('add-heading').click();
    await studioTool(page, 'Layers');
    await expect(page.getByTestId('layer-list')).toContainText('Create header');
  });

  test('PDF MediaBox matches page size in points', async ({ page }) => {
    await gotoEditor(page);
    await studioTool(page, 'Resize');
    await page.getByTestId('page-format').selectOption('us-letter');
    await studioTool(page, 'Text');
    await page.getByTestId('add-heading').click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      studioExport(page, 'export-pdf'),
    ]);
    const buf = fs.readFileSync((await download.path())!);
    const box = pdfMediaBoxPoints(buf);
    expect(box).not.toBeNull();
    const expW = mmToPdfPoints(215.9);
    const expH = mmToPdfPoints(279.4);
    expect(Math.abs(box!.w - expW)).toBeLessThan(1.5);
    expect(Math.abs(box!.h - expH)).toBeLessThan(1.5);
  });

  test('landscape PNG uses swapped dimensions', async ({ page }) => {
    await gotoEditor(page);
    await studioTool(page, 'Resize');
    await page.getByTestId('orientation-landscape').click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      studioExport(page, 'export-png'),
    ]);
    const buf = fs.readFileSync((await download.path())!);
    const size = pngDimensions(buf);
    const { width, height } = mmToPx300(297, 210);
    expect(Math.abs(size.width - width)).toBeLessThanOrEqual(2);
    expect(Math.abs(size.height - height)).toBeLessThanOrEqual(2);
  });

  test('JSON round-trip restores orientation', async ({ page }) => {
    await gotoEditor(page);
    await studioTool(page, 'Resize');
    await page.getByTestId('orientation-landscape').click();
    await studioTool(page, 'Text');
    await page.getByTestId('add-heading').click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      studioExport(page, 'export-json'),
    ]);
    const jsonPath = await download.path();
    await page.reload();
    await page.waitForFunction(() => window.__letterheadEditor?.getCounts() != null);
    await studioTool(page, 'Templates');
    await page.getByTestId('import-json').setInputFiles(jsonPath!);
    await expect(page.getByTestId('stage-format-label')).toContainText('Landscape');
    await expect(page.getByTestId('stage-dimensions')).toContainText('297 × 210 mm');
  });
});

test.describe('B. Page bounds & pointer', () => {
  test('objects clamp inside page when moved programmatically', async ({ page }) => {
    await gotoEditor(page);
    await studioTool(page, 'Text');
    await page.getByTestId('add-heading').click();
    await page.evaluate(() => {
      window.__letterheadEditor!.moveActiveClamped(-40, -20);
    });
    const pos = await page.evaluate(() => window.__letterheadEditor!.getActivePosition());
    expect(pos!.left).toBeGreaterThanOrEqual(0);
    expect(pos!.top).toBeGreaterThanOrEqual(0);
  });

  test('viewport zoom matches stage scale', async ({ page }) => {
    await gotoEditor(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    const zoom = await page.evaluate(() => window.__letterheadEditor!.getViewportZoom());
    expect(zoom).toBeGreaterThan(0.4);
    expect(zoom).toBeLessThanOrEqual(0.92);
  });
});

test.describe('I. Regression', () => {
  test('orientation controls are available', async ({ page }) => {
    await gotoEditor(page);
    await studioTool(page, 'Resize');
    await expect(page.getByTestId('orientation-portrait')).toHaveClass(/active/);
    await page.getByTestId('orientation-landscape').click();
    await expect(page.getByTestId('orientation-landscape')).toHaveClass(/active/);
  });
});
