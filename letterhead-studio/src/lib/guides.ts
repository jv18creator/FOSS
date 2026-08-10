import type { Canvas } from 'fabric';
import { isGuide } from './fabricMeta';

/** Remove legacy Fabric safe-margin rects (guide is now a DOM overlay). */
export function removeFabricGuides(canvas: Canvas) {
  canvas
    .getObjects()
    .filter((o) => isGuide(o))
    .forEach((o) => canvas.remove(o));
}
