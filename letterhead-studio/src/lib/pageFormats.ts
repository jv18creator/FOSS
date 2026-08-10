export type PageFormatId = 'a4' | 'us-letter' | 'legal' | 'executive';

export type PageOrientation = 'portrait' | 'landscape';

export interface PageFormat {
  id: PageFormatId;
  label: string;
  widthMm: number;
  heightMm: number;
  region: string;
  orientation: PageOrientation;
}

/** Base catalog sizes (portrait). */
export const PAGE_FORMATS: Omit<PageFormat, 'orientation'>[] = [
  {
    id: 'a4',
    label: 'A4',
    widthMm: 210,
    heightMm: 297,
    region: 'Global / India',
  },
  {
    id: 'us-letter',
    label: 'US Letter',
    widthMm: 215.9,
    heightMm: 279.4,
    region: 'US & Canada',
  },
  {
    id: 'legal',
    label: 'Legal',
    widthMm: 215.9,
    heightMm: 355.6,
    region: 'Legal documents',
  },
  {
    id: 'executive',
    label: 'Executive',
    widthMm: 184.15,
    heightMm: 266.7,
    region: 'Memos & stationery',
  },
];

export const EDITOR_DPI = 96;
export const EXPORT_DPI = 300;
export const SAFE_MARGIN_MM = 12;

export function mmToPx(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi);
}

export function withOrientation(
  base: (typeof PAGE_FORMATS)[number],
  orientation: PageOrientation,
): PageFormat {
  if (orientation === 'portrait') {
    return { ...base, orientation };
  }
  return {
    ...base,
    orientation,
    widthMm: base.heightMm,
    heightMm: base.widthMm,
  };
}

export function getFormatById(
  id: PageFormatId,
  orientation: PageOrientation = 'portrait',
): PageFormat {
  const base = PAGE_FORMATS.find((f) => f.id === id);
  if (!base) throw new Error(`Unknown format: ${id}`);
  return withOrientation(base, orientation);
}

export function formatStageLabel(format: PageFormat): string {
  const orient =
    format.orientation === 'landscape' ? 'Landscape' : 'Portrait';
  return `${format.label} · ${orient}`;
}

/** Match canvas pixels to a catalog format, or fall back to custom dimensions. */
export function stageInfoFromPageSize(
  pageSize: { width: number; height: number },
  dpi: number = EDITOR_DPI,
): { label: string; widthMm: number; heightMm: number } {
  for (const base of PAGE_FORMATS) {
    for (const orientation of ['portrait', 'landscape'] as const) {
      const f = withOrientation(base, orientation);
      const px = canvasPixelSize(f, dpi);
      if (
        Math.abs(px.width - pageSize.width) <= 1 &&
        Math.abs(px.height - pageSize.height) <= 1
      ) {
        return {
          label: formatStageLabel(f),
          widthMm: f.widthMm,
          heightMm: f.heightMm,
        };
      }
    }
  }
  const widthMm = (pageSize.width / dpi) * 25.4;
  const heightMm = (pageSize.height / dpi) * 25.4;
  const orient = widthMm > heightMm ? 'Landscape' : 'Portrait';
  return {
    label: `Custom · ${orient}`,
    widthMm: Math.round(widthMm * 10) / 10,
    heightMm: Math.round(heightMm * 10) / 10,
  };
}

export function canvasPixelSize(format: PageFormat, dpi: number) {
  return {
    width: mmToPx(format.widthMm, dpi),
    height: mmToPx(format.heightMm, dpi),
  };
}
