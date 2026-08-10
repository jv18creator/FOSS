import type { Canvas } from 'fabric';
import {
  canvasPixelSize,
  EDITOR_DPI,
  getFormatById,
  type PageFormatId,
  type PageOrientation,
} from './pageFormats';
import type { LetterheadTemplateFile } from './letterheadTemplate';
import { removeFabricGuides } from './guides';
import { normalizeLetterheadLayout } from './normalizeLetterheadLayout';

export async function applyLetterheadTemplate(
  canvas: Canvas,
  file: LetterheadTemplateFile,
  onMeta: (meta: {
    formatId?: PageFormatId;
    orientation?: PageOrientation;
    name?: string;
    pageSize?: { width: number; height: number };
  }) => void,
) {
  const formatId = file.formatId;
  const orientation = file.orientation;
  let pageSize: { width: number; height: number } | undefined;
  if (file.pageWidthPx && file.pageHeightPx) {
    pageSize = {
      width: Math.round(file.pageWidthPx),
      height: Math.round(file.pageHeightPx),
    };
  } else if (formatId && orientation) {
    pageSize = canvasPixelSize(getFormatById(formatId, orientation), EDITOR_DPI);
  }

  onMeta({
    formatId,
    orientation,
    name: file.name,
    pageSize,
  });
  await canvas.loadFromJSON(file.canvas);
  removeFabricGuides(canvas);
  normalizeLetterheadLayout(canvas);
  canvas.requestRenderAll();
}
