import { Point, type FabricObject } from 'fabric';

/** Top-left origin keeps drag/resize math aligned with Polotno-style x/y frames. */
export function normalizeObjectToTopLeft(obj: FabricObject) {
  if (obj.originX === 'left' && obj.originY === 'top') {
    obj.setCoords();
    return;
  }
  obj.setCoords();
  const box = obj.getBoundingRect();
  obj.set({
    originX: 'left',
    originY: 'top',
    left: box.left,
    top: box.top,
  });
  obj.setCoords();
}

export function centerObjectAt(
  obj: FabricObject,
  point: { left: number; top: number },
) {
  obj.setCoords();
  obj.setPositionByOrigin(new Point(point.left, point.top), 'center', 'center');
  normalizeObjectToTopLeft(obj);
}
