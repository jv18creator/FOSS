import { Canvas, FabricImage } from 'fabric';
import type { PageFormat } from './pageFormats';
import { SAFE_MARGIN_MM, mmToPx, EDITOR_DPI } from './pageFormats';
import { setMeta } from './fabricMeta';
import { clampObjectToPage } from './pageBounds';
import { normalizeObjectToTopLeft } from './objectLayout';
import './fabricSetup';

export async function addLogoFromFile(
  canvas: Canvas,
  file: File,
  format: PageFormat,
) {
  const margin = mmToPx(SAFE_MARGIN_MM, EDITOR_DPI);
  const url = URL.createObjectURL(file);
  try {
    const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
    const maxW = mmToPx(40, EDITOR_DPI);
    const scale = Math.min(maxW / (img.width ?? maxW), 1);
    img.set({
      left: margin,
      top: mmToPx(10, EDITOR_DPI),
      scaleX: scale,
      scaleY: scale,
      originX: 'left',
      originY: 'top',
    });
    normalizeObjectToTopLeft(img);
    setMeta(img, {
      role: 'logo',
      locked: false,
      placeholder: false,
      label: file.name,
    });
    canvas.add(img);
    clampObjectToPage(img, canvas.getWidth(), canvas.getHeight());
    canvas.setActiveObject(img);
    canvas.renderAll();
  } finally {
    URL.revokeObjectURL(url);
  }
  void format;
}
