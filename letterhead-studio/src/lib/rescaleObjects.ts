import { FabricText, Line, Rect, type FabricObject } from 'fabric';
import { isGuide } from './fabricMeta';

/** Rescale canvas objects when the page pixel size changes. */
export function rescaleObjectsForPageResize(
  objects: FabricObject[],
  sx: number,
  sy: number,
) {
  objects.forEach((obj) => {
    if (isGuide(obj)) return;

    if (obj instanceof Line) {
      const line = obj as Line & { x1?: number; y1?: number; x2?: number; y2?: number };
      line.set({
        x1: (line.x1 ?? 0) * sx,
        y1: (line.y1 ?? 0) * sy,
        x2: (line.x2 ?? 0) * sx,
        y2: (line.y2 ?? 0) * sy,
      });
    } else if (obj instanceof FabricText) {
      const size = obj.fontSize ?? 12;
      obj.set({
        left: (obj.left ?? 0) * sx,
        top: (obj.top ?? 0) * sy,
        fontSize: size * sy,
        scaleX: 1,
        scaleY: 1,
      });
    } else if (obj instanceof Rect) {
      obj.set({
        left: (obj.left ?? 0) * sx,
        top: (obj.top ?? 0) * sy,
        width: (obj.width ?? 0) * sx,
        height: (obj.height ?? 0) * sy,
        scaleX: 1,
        scaleY: 1,
      });
    } else {
      obj.set({
        left: (obj.left ?? 0) * sx,
        top: (obj.top ?? 0) * sy,
        scaleX: (obj.scaleX ?? 1) * sx,
        scaleY: (obj.scaleY ?? 1) * sy,
      });
    }
    obj.setCoords();
  });
}
