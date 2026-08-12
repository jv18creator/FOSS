import type { FabricObject } from 'fabric';
import { isGuide } from './fabricMeta';

/**
 * Hard clamp: keep the full axis-aligned bounding box inside the page.
 * Use for initial placement / explicit “fit to page” actions — not on drag end.
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

/**
 * Soft clamp: allow intentional overflow (cropping off the page), but keep at
 * least `minVisiblePx` of the object intersecting the page so it cannot vanish.
 */
export function keepObjectPartiallyOnPage(
  obj: FabricObject,
  pageW: number,
  pageH: number,
  minVisiblePx = 24,
) {
  if (isGuide(obj)) return;
  obj.setCoords();
  const bound = obj.getBoundingRect();
  const left = bound.left;
  const top = bound.top;
  const right = bound.left + bound.width;
  const bottom = bound.top + bound.height;

  let dx = 0;
  let dy = 0;

  // Fully or mostly past left edge → pull right until minVisible peeks in
  if (right < minVisiblePx) dx = minVisiblePx - right;
  // Fully or mostly past right edge → pull left
  else if (left > pageW - minVisiblePx) dx = pageW - minVisiblePx - left;

  if (bottom < minVisiblePx) dy = minVisiblePx - bottom;
  else if (top > pageH - minVisiblePx) dy = pageH - minVisiblePx - top;

  if (dx === 0 && dy === 0) return;
  obj.set({
    left: (obj.left ?? 0) + dx,
    top: (obj.top ?? 0) + dy,
  });
  obj.setCoords();
}
