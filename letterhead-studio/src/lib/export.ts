import { jsPDF } from 'jspdf';
import type { Canvas } from 'fabric';
import {
  EXPORT_DPI,
  EDITOR_DPI,
  type PageFormat,
} from './pageFormats';
import { isGuide } from './fabricMeta';
import {
  snapshotViewport,
  restoreViewport,
} from './canvasViewport';

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTemplateJson(
  canvas: Canvas,
  format: PageFormat,
  name: string,
  pageSizePx: { width: number; height: number },
) {
  const json = canvas.toJSON();
  const payload = {
    version: 1,
    name,
    formatId: format.id,
    orientation: format.orientation,
    editorDpi: EDITOR_DPI,
    pageWidthPx: pageSizePx.width,
    pageHeightPx: pageSizePx.height,
    canvas: json,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  downloadBlob(blob, `${slugify(name)}.letterhead.json`);
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'letterhead';
}

function withExportViewport(canvas: Canvas, width: number, height: number) {
  const snap = snapshotViewport(canvas);
  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  canvas.setDimensions({ width, height });
  canvas.setZoom(1);
  canvas.setDimensions(
    { width: `${width}px`, height: `${height}px` },
    { cssOnly: true },
  );
  canvas.calcOffset();
  return () => {
    restoreViewport(canvas, snap);
  };
}

export async function exportPng(
  canvas: Canvas,
  format: PageFormat,
  name: string,
  pageSizePx: { width: number; height: number },
) {
  const scale = EXPORT_DPI / EDITOR_DPI;
  const guides = canvas.getObjects().filter(isGuide);
  guides.forEach((g) => g.set({ visible: false }));
  const restore = withExportViewport(canvas, pageSizePx.width, pageSizePx.height);
  canvas.requestRenderAll();

  const dataUrl = canvas.toDataURL({
    format: 'png',
    multiplier: scale,
    enableRetinaScaling: false,
  });

  restore();
  guides.forEach((g) => g.set({ visible: true }));
  canvas.requestRenderAll();

  const res = await fetch(dataUrl);
  const blob = await res.blob();
  downloadBlob(blob, `${slugify(name)}-${format.id}.png`);
}

/** JPEG quality for PDF raster; PNG-in-PDF was ~25MB for any A4 page at 300dpi. */
const PDF_JPEG_QUALITY = 0.88;

export async function exportPdf(
  canvas: Canvas,
  format: PageFormat,
  name: string,
  pageSizePx: { width: number; height: number },
) {
  const scale = EXPORT_DPI / EDITOR_DPI;
  const guides = canvas.getObjects().filter(isGuide);
  guides.forEach((g) => g.set({ visible: false }));
  const restore = withExportViewport(canvas, pageSizePx.width, pageSizePx.height);
  canvas.requestRenderAll();

  // JPEG keeps print DPI while avoiding the fixed ~25MB uncompressed PNG embed.
  const dataUrl = canvas.toDataURL({
    format: 'jpeg',
    quality: PDF_JPEG_QUALITY,
    multiplier: scale,
    enableRetinaScaling: false,
  });

  restore();
  guides.forEach((g) => g.set({ visible: true }));
  canvas.requestRenderAll();

  const widthMm = (pageSizePx.width / EDITOR_DPI) * 25.4;
  const heightMm = (pageSizePx.height / EDITOR_DPI) * 25.4;
  const orientation = widthMm > heightMm ? 'l' : 'p';
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [widthMm, heightMm],
  });

  pdf.addImage(dataUrl, 'JPEG', 0, 0, widthMm, heightMm);
  pdf.save(`${slugify(name)}-${format.id}.pdf`);
}
