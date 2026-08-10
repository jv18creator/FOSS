import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export const FORMATS = [
  { id: 'a4', label: 'A4', w: 210, h: 297 },
  { id: 'us-letter', label: 'US Letter', w: 215.9, h: 279.4 },
  { id: 'legal', label: 'Legal', w: 215.9, h: 355.6 },
  { id: 'executive', label: 'Executive', w: 184.15, h: 266.7 },
] as const;

export async function gotoEditor(page: Page) {
  await page.goto('/');
  await expect(page.getByTestId('toolbar')).toBeVisible();
  await page.waitForFunction(() => window.__letterheadEditor?.getCounts() != null);
}

export async function studioTool(page: Page, name: string) {
  await page.getByRole('button', { name, exact: true }).click();
}

const FORMAT_PRINT_PRESETS: Record<string, string> = {
  a4: 'A4 Portrait',
  'us-letter': 'Letter Portrait',
};

export async function applyPageSizeMm(page: Page, wMm: number, hMm: number) {
  await studioTool(page, 'Resize');
  await page.getByTestId('resize-units').selectOption('cm');
  const wCm = Math.round((wMm / 10) * 100) / 100;
  const hCm = Math.round((hMm / 10) * 100) / 100;
  await page.getByTestId('resize-width').fill(String(wCm));
  await page.getByTestId('resize-height').fill(String(hCm));
  await page.getByTestId('resize-apply').click();
}

export async function setPageFormat(page: Page, formatId: string) {
  const fmt = FORMATS.find((f) => f.id === formatId);
  if (!fmt) throw new Error(`Unknown format: ${formatId}`);
  const preset = FORMAT_PRINT_PRESETS[formatId];
  if (preset) {
    await studioTool(page, 'Resize');
    await page.getByRole('button', { name: preset, exact: true }).click();
    return;
  }
  await applyPageSizeMm(page, fmt.w, fmt.h);
}

export async function setPageLandscape(page: Page) {
  const size = await canvasSize(page);
  await studioTool(page, 'Resize');
  await page.getByTestId('resize-units').selectOption('px');
  await page.getByTestId('resize-width').fill(String(size.height));
  await page.getByTestId('resize-height').fill(String(size.width));
  await page.getByTestId('resize-apply').click();
}

export async function setEditorMode(page: Page, mode: 'design' | 'use') {
  await page.evaluate((m) => {
    window.__letterheadSetMode?.(m);
  }, mode);
}

export async function studioExport(
  page: Page,
  kind: 'export-png' | 'export-pdf' | 'export-json',
) {
  if (kind === 'export-json') {
    await studioTool(page, 'Templates');
    await page.getByTestId('export-json').click();
    return;
  }
  await page.getByRole('button', { name: 'Download' }).click();
  await page.getByTestId(kind).click();
}

export async function editorCounts(page: Page) {
  return page.evaluate(() => window.__letterheadEditor!.getCounts()!);
}

export async function canvasSize(page: Page) {
  return page.evaluate(() => window.__letterheadEditor!.getCanvasPixelSize());
}

export function mmToPx300(wMm: number, hMm: number) {
  const px = (mm: number) => Math.round((mm / 25.4) * 300);
  return { width: px(wMm), height: px(hMm) };
}

export function pngDimensions(buffer: Buffer) {
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

/** Parse first MediaBox from a PDF buffer (points). */
export function pdfMediaBoxPoints(buffer: Buffer): { w: number; h: number } | null {
  const text = buffer.toString('latin1');
  const match = text.match(/\/MediaBox\s*\[\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)\s*\]/);
  if (!match) return null;
  return { w: parseFloat(match[1]), h: parseFloat(match[2]) };
}

export function mmToPdfPoints(mm: number) {
  return (mm / 25.4) * 72;
}

export function expectedSafeMarginRatios(
  pageWidthMm: number,
  pageHeightMm: number,
  marginMm: number,
) {
  return {
    widthRatio: (pageWidthMm - marginMm * 2) / pageWidthMm,
    heightRatio: (pageHeightMm - marginMm * 2) / pageHeightMm,
  };
}

/** Sample PNG RGBA at x,y (top-left). */
export function pngPixelRgba(buffer: Buffer, x: number, y: number) {
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (x < 0 || y < 0 || x >= width || y >= height) return null;
  let offset = 8;
  while (offset < buffer.length) {
    const len = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    if (type === 'IDAT') break;
    offset += 12 + len;
  }
  return null;
}

declare global {
  interface Window {
    __letterheadSetMode?: (mode: 'design' | 'use') => void;
    __letterheadEditor?: {
      getCounts: () => { total: number; content: number; guides: number };
      getCanvasPixelSize: () => { width: number; height: number };
      isGuideVisible: () => boolean;
      getActiveType: () => string | null;
      moveActive: (left: number, top: number) => boolean;
      moveActiveClamped: (left: number, top: number) => boolean;
      getActivePosition: () => { left: number; top: number } | null;
      getStackRoles: () => string[];
      getLogoWidthPx: () => number | null;
      getViewportZoom: () => number;
      selectContentIndex?: (index: number) => void;
      transformActive?: (patch: {
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
      }) => boolean;
      exportPayload?: () => object | null;
    };
  }
}
