import type { FabricObject } from 'fabric';
import { isGuide } from './fabricMeta';

/**
 * Keep the axis-aligned bounding box inside the page.
 * Apply on pointer-up (object:modified), not during drag — live clamp fights Fabric's mover.
 */
export function clampObjectToPage(
  obj: FabricObject,
  pageW: number,
  pageH: number,
) {
  if (isGuide(obj)) return;
  obj.setCoords();
  const bound = obj.getBoundingRect();
  let dx = 0;
  let dy = 0;
  if (bound.left < 0) dx += -bound.left;
  if (bound.top < 0) dy += -bound.top;
  if (bound.left + bound.width > pageW) {
    dx -= bound.left + bound.width - pageW;
  }
  if (bound.top + bound.height > pageH) {
    dy -= bound.top + bound.height - pageH;
  }
  if (dx === 0 && dy === 0) return;
  obj.set({
    left: (obj.left ?? 0) + dx,
    top: (obj.top ?? 0) + dy,
  });
  obj.setCoords();
}
