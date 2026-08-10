import type { Canvas } from 'fabric';

function readCanvasCssSize(canvas: Canvas) {
  const el = canvas.lowerCanvasEl;
  const cs = getComputedStyle(el);
  return {
    width: parseFloat(cs.width) || canvas.getWidth(),
    height: parseFloat(cs.height) || canvas.getHeight(),
  };
}

/** Fit logical page (96 DPI px) into the stage; scale via CSS so DOM overlay matches Fabric. */
export function syncCanvasViewport(
  canvas: Canvas,
  logicalW: number,
  logicalH: number,
  zoom: number,
) {
  const z = zoom > 0 ? zoom : 1;
  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  canvas.setDimensions({ width: logicalW, height: logicalH });
  canvas.setZoom(1);
  const cssW = logicalW * z;
  const cssH = logicalH * z;
  canvas.setDimensions(
    { width: `${cssW}px`, height: `${cssH}px` },
    { cssOnly: true },
  );
  canvas.calcOffset();
}

export function snapshotViewport(canvas: Canvas) {
  const css = readCanvasCssSize(canvas);
  return {
    vpt: [...canvas.viewportTransform] as [
      number,
      number,
      number,
      number,
      number,
      number,
    ],
    logicalW: canvas.getWidth(),
    logicalH: canvas.getHeight(),
    cssW: css.width,
    cssH: css.height,
    backstoreW: canvas.width,
    backstoreH: canvas.height,
    zoom: canvas.getZoom(),
  };
}

export function restoreViewport(
  canvas: Canvas,
  snap: ReturnType<typeof snapshotViewport>,
) {
  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  canvas.setDimensions({ width: snap.logicalW, height: snap.logicalH });
  canvas.setZoom(snap.zoom);
  canvas.setDimensions(
    { width: `${snap.cssW}px`, height: `${snap.cssH}px` },
    { cssOnly: true },
  );
  canvas.calcOffset();
}

export function displayScale(canvas: Canvas) {
  const logicalW = canvas.getWidth();
  if (logicalW < 1) return 1;
  const css = readCanvasCssSize(canvas);
  return css.width / logicalW;
}
