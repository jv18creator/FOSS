import type { Canvas } from 'fabric';
import { isGuide } from './fabricMeta';
import { normalizeObjectToTopLeft } from './objectLayout';

/** Fix legacy templates and Fabric defaults (center origin) that break drag/clamp. */
export function normalizeLetterheadLayout(canvas: Canvas) {
  for (const obj of canvas.getObjects()) {
    if (isGuide(obj)) continue;
    normalizeObjectToTopLeft(obj);
  }
}
