import type { TOptions } from 'fabric';
import { FabricText, Textbox, type Canvas, type FabricObject } from 'fabric';
import { EDITOR_DPI, SAFE_MARGIN_MM, mmToPx } from './pageFormats';
import { getMeta, isGuide, setMeta } from './fabricMeta';
import type { TextboxProps } from 'fabric';

export type StudioTextOptions = TOptions<TextboxProps> & { pageWidth?: number };

export function pageContentWrapWidth(pageW: number, left = 0): number {
  const margin = mmToPx(SAFE_MARGIN_MM, EDITOR_DPI);
  return Math.max(100, pageW - Math.max(left, 0) - margin);
}

/** Create wrapping text; long unbroken strings wrap via splitByGrapheme. */
export function createStudioTextbox(text: string, options: StudioTextOptions = {}): Textbox {
  const { pageWidth, width, ...rest } = options;
  const left = typeof rest.left === 'number' ? rest.left : 0;
  const wrapWidth =
    typeof width === 'number' && width > 0
      ? width
      : pageWidth != null
        ? pageContentWrapWidth(pageWidth, left)
        : 280;

  return new Textbox(text, {
    originX: 'left',
    originY: 'top',
    splitByGrapheme: true,
    width: wrapWidth,
    ...rest,
  });
}

function isWrappingTextbox(obj: FabricObject): obj is Textbox {
  return obj instanceof Textbox;
}

/**
 * Ensure text objects wrap to a box width. Upgrades legacy FabricText / IText
 * instances loaded from templates. Returns the object that replaced `prefer`
 * when that object was upgraded (for re-selection).
 */
export function ensureWrappingTextObjects(
  canvas: Canvas,
  pageW: number,
  prefer?: FabricObject | null,
): FabricObject | null {
  let preferredNext: FabricObject | null = null;
  const objects = [...canvas.getObjects()];
  for (const obj of objects) {
    if (isGuide(obj) || !(obj instanceof FabricText)) continue;

    if (isWrappingTextbox(obj)) {
      const left = obj.left ?? 0;
      const maxWrap = pageContentWrapWidth(pageW, left);
      const scaledW = (obj.width ?? 0) * (obj.scaleX ?? 1);
      const nextW = Math.min(Math.max(scaledW, obj.minWidth || 20), maxWrap);
      const patch: Record<string, unknown> = { splitByGrapheme: true };
      if ((obj.scaleX ?? 1) !== 1 || (obj.scaleY ?? 1) !== 1) {
        patch.scaleX = 1;
        patch.scaleY = 1;
        patch.width = nextW;
      } else if (!obj.width || obj.width > maxWrap) {
        patch.width = maxWrap;
      }
      obj.set(patch);
      obj.initDimensions();
      obj.setCoords();
      if (prefer === obj) preferredNext = obj;
      continue;
    }

    const meta = getMeta(obj);
    const left = obj.left ?? 0;
    const maxWrap = pageContentWrapWidth(pageW, left);
    const scaledW = (obj.width ?? 0) * (obj.scaleX ?? 1);
    const wrapW = Math.min(Math.max(scaledW, 100), maxWrap);
    const wasPreferred = prefer === obj;

    const box = createStudioTextbox(obj.text ?? '', {
      left,
      top: obj.top ?? 0,
      width: wrapW,
      pageWidth: pageW,
      fontFamily: obj.fontFamily,
      fontSize: obj.fontSize,
      fontWeight: obj.fontWeight,
      fontStyle: obj.fontStyle,
      fill: obj.fill,
      textAlign: obj.textAlign,
      lineHeight: obj.lineHeight,
      charSpacing: obj.charSpacing,
      underline: obj.underline,
      linethrough: obj.linethrough,
      opacity: obj.opacity,
      angle: obj.angle,
      selectable: obj.selectable,
      evented: obj.evented,
    });
    if (meta) setMeta(box, meta);

    const idx = canvas.getObjects().indexOf(obj);
    canvas.remove(obj);
    canvas.insertAt(idx, box);
    if (wasPreferred) preferredNext = box;
  }
  return preferredNext;
}
