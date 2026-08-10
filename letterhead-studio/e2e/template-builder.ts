import fs from 'node:fs';
import path from 'node:path';
import type { Page } from '@playwright/test';
import {
  gotoEditor,
  studioTool,
  setPageFormat,
} from './helpers';

export { setPageFormat };

/** Canvas pixels at 96 DPI (matches editor). */
export function mm(n: number): number {
  return Math.round((n / 25.4) * 96);
}

export type TransformPatch = {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  fontSize?: number;
  fontFamily?: string;
  line?: { x1: number; y1: number; x2: number; y2: number };
  sendToBack?: boolean;
};

export async function setTemplateName(page: Page, name: string) {
  await page.getByTestId('template-name').fill(name);
}

export { setPageFormat } from './helpers';

export async function setPortrait(page: Page) {
  await setPageFormat(page, 'a4');
}

export async function activateBackground(page: Page, label: string) {
  await studioTool(page, 'Background');
  await page.getByRole('button', { name: label, exact: true }).click();
}

export async function addShape(page: Page, shapeLabel: string) {
  await studioTool(page, 'Elements');
  await page.getByRole('button', { name: shapeLabel, exact: true }).click();
}

export async function addSolidLine(page: Page) {
  await studioTool(page, 'Elements');
  await page.getByTestId('add-line').click();
}

export async function addTextPreset(
  page: Page,
  preset: 'header' | 'subheader' | 'body',
) {
  await studioTool(page, 'Text');
  if (preset === 'header') {
    await page.getByTestId('add-heading').click();
  } else if (preset === 'body') {
    await page.getByTestId('add-body').click();
  } else {
    await page.getByRole('button', { name: 'Create sub-header', exact: true }).click();
  }
}

export async function addTextStyleTemplate(page: Page, ariaLabel: string) {
  await studioTool(page, 'Text');
  await page.getByRole('button', { name: ariaLabel, exact: true }).click();
}

export async function selectContent(page: Page, index: number) {
  await page.evaluate((i) => {
    window.__letterheadEditor!.selectContentIndex!(i);
  }, index);
}

export async function transformActive(page: Page, patch: TransformPatch) {
  await page.evaluate((p) => {
    window.__letterheadEditor!.transformActive!(p);
  }, patch);
}

export async function editSelectedText(page: Page, text: string) {
  await studioTool(page, 'Layers');
  await page.getByTestId('sel-text').fill(text);
}

export async function lockSelectedLayout(page: Page) {
  await studioTool(page, 'Layers');
  await page.getByTestId('sel-locked').check();
}

export async function setSelectedFill(page: Page, hex: string) {
  const swatch = page.locator('.studio-topbar-context .studio-color-swatch input[type="color"]');
  await swatch.fill(hex);
}

export async function setSelectedFontFamily(page: Page, label: string) {
  await page.getByLabel('Font family').selectOption({ label });
}

export async function setSelectedFontSize(page: Page, size: number) {
  await page.getByLabel('Font size').fill(String(size));
}

export async function saveTemplateToFile(page: Page, filePath: string) {
  const payload = await page.evaluate(() => window.__letterheadEditor!.exportPayload!());
  if (!payload) throw new Error('exportPayload returned null');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`);
}

export async function freshEditor(page: Page) {
  await gotoEditor(page);
}
