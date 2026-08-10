const FILL = '#9ca3af';

function svgMarkup(pathInner: string, viewBox = '0 0 24 24') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${pathInner}</svg>`;
}

export type PrimitiveShapeKind =
  | 'rect'
  | 'circle'
  | 'triangle'
  | 'star'
  | 'diamond'
  | 'pentagon'
  | 'hexagon'
  | 'right-triangle'
  | 'parallelogram';

export type ShapeCatalogEntry =
  | {
      id: string;
      label: string;
      kind: 'primitive';
      primitive: PrimitiveShapeKind;
      preview: string;
    }
  | {
      id: string;
      label: string;
      kind: 'svg';
      preview: string;
      markup: string;
    };

function prim(
  id: string,
  label: string,
  primitive: PrimitiveShapeKind,
  preview: string,
): ShapeCatalogEntry {
  return { id, label, kind: 'primitive', primitive, preview };
}

function svgShape(id: string, label: string, pathD: string, viewBox?: string): ShapeCatalogEntry {
  const preview = `<path d="${pathD}" fill="${FILL}"/>`;
  return {
    id,
    label,
    kind: 'svg',
    preview,
    markup: svgMarkup(preview, viewBox),
  };
}

/** Knovo-style shape library (preview paths are unique silhouettes). */
export const SHAPE_CATALOG: ShapeCatalogEntry[] = [
  prim('rect', 'Rectangle', 'rect', `<rect x="4" y="7" width="16" height="12" rx="1" fill="${FILL}"/>`),
  prim('circle', 'Circle', 'circle', `<circle cx="12" cy="13" r="8" fill="${FILL}"/>`),
  prim('triangle', 'Triangle', 'triangle', `<path d="M12 4 L21 20 H3 Z" fill="${FILL}"/>`),
  prim('star', 'Star', 'star', `<path d="M12 2l2.8 8.6H23l-7 5.1 2.7 8.3L12 18.6 5.3 24l2.7-8.3-7-5.1h8.2z" fill="${FILL}"/>`),
  prim('diamond', 'Diamond', 'diamond', `<path d="M12 3l9 10-9 10-9-10z" fill="${FILL}"/>`),
  prim('pentagon', 'Pentagon', 'pentagon', `<path d="M12 3l8.5 6.5-3.2 9.8H6.7L3.5 9.5z" fill="${FILL}"/>`),
  prim('hexagon', 'Hexagon', 'hexagon', `<path d="M7 4h10l5 8-5 8H7l-5-8z" fill="${FILL}"/>`),
  prim(
    'right-triangle',
    'Right triangle',
    'right-triangle',
    `<path d="M5 19V5h14z" fill="${FILL}"/>`,
  ),
  prim(
    'parallelogram',
    'Parallelogram',
    'parallelogram',
    `<path d="M7 6h14l-3 12H4z" fill="${FILL}"/>`,
  ),
  svgShape('speech', 'Speech bubble', 'M5 5h14v9H11l-4 4V5z'),
  svgShape('heart', 'Heart', 'M12 20s-6.5-4-6.5-9.5C5.5 7 8 5 12 7c4-2 6.5 0 6.5 3.5C18.5 16 12 20 12 20z'),
  svgShape('cloud', 'Cloud', 'M7 16a4 4 0 1 1 0-8 5.5 5.5 0 0 1 10.6 1.8A3.5 3.5 0 1 1 18 16H7z'),
  svgShape('arch', 'Arch', 'M5 18V11a7 7 0 0 1 14 0v7H5z'),
  svgShape('cross', 'Cross', 'M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z'),
  svgShape('plus-soft', 'Plus', 'M11 5h2v14h-2zm-6 6h14v2H5z'),
  svgShape(
    'arrow-right-block',
    'Arrow right',
    'M4 11h10l-3-3v-2l7 6-7 6v-2l3-3H4z',
  ),
  svgShape(
    'arrow-left-block',
    'Arrow left',
    'M20 11H10l3-3V6l-7 6 7 6v-2l-3-3h10z',
  ),
  svgShape('arrow-up-block', 'Arrow up', 'M11 20V10l-3 3V9l7-6 7 6v4l-3-3v10z'),
  svgShape('arrow-down-block', 'Arrow down', 'M13 4v10l3-3v4l-7 6-7-6v-4l3 3V4z'),
  svgShape(
    'flower-4',
    'Four petals',
    'M12 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-6 6a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm12 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-6 6a3 3 0 1 1 0 6 3 3 0 0 1 0-6z',
  ),
  svgShape(
    'banner-down',
    'Banner',
    'M4 5h16l-2 7 2 7H4l2-7-2-7zm8 3v8M8 8l4 3 4-3',
  ),
  svgShape('cylinder', 'Cylinder', 'M6 7h12v10H6zm0-2c0-1.5 2.7-2.5 6-2.5s6 1 6 2.5'),
  svgShape('teardrop', 'Teardrop', 'M12 3c4 5 7 8.5 7 12a7 7 0 1 1-14 0c0-3.5 3-7 7-12z'),
  svgShape('teardrop-inv', 'Drop', 'M12 21C8 16 5 12.5 5 9a7 7 0 1 1 14 0c0 3.5-3 7-7 12z'),
  svgShape(
    'burst',
    'Starburst',
    'M12 2l1.8 6.5L20 8l-5 4.2L17 19l-5-3.5L7 19l2-6.8L4 8l6.2.5z',
  ),
  svgShape(
    'burst-thin',
    'Thin burst',
    'M12 2v6M12 22v-6M2 12h6M22 12h-6M4.9 4.9l4.2 4.2M14.9 14.9l4.2 4.2M19.1 4.9l-4.2 4.2M9.1 14.9l-4.2 4.2',
  ),
  svgShape('wave-flag', 'Wave flag', 'M4 6h16v3H4zm0 5h12c2 0 4 1 4 3H4z'),
  svgShape('flower-6', 'Six petals', 'M12 4a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm5.2 3.8a2.5 2.5 0 1 0-2.5 4.3 2.5 2.5 0 0 0 2.5-4.3zm1.3 7a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0zm-6.5 4.2a2.5 2.5 0 1 0-2.5-4.3 2.5 2.5 0 0 0 2.5 4.3zM4.5 14.8a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0zm1.3-7a2.5 2.5 0 1 0 2.5-4.3 2.5 2.5 0 0 0-2.5 4.3z'),
  svgShape('hourglass', 'Hourglass', 'M7 4h10v3l-4 5 4 5v3H7v-3l4-5-4-5V4z'),
  svgShape('house', 'House', 'M12 4l9 7v9H3v-9l9-7zm-2 10h4v6h-4z'),
  svgShape('shield', 'Shield', 'M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6z'),
  svgShape('shield-2', 'Crest', 'M12 2l7 4v7c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z'),
  svgShape('leaf', 'Leaf', 'M6 18c8-2 12-8 14-14 0 0-10 2-14 14z'),
  svgShape('lightning', 'Lightning', 'M13 2L4 14h6l-1 8 9-12h-6z'),
  svgShape('horseshoe', 'Arc', 'M6 14a6 6 0 1 1 12 0v2H6z'),
  svgShape('l-shape', 'L shape', 'M5 5h6v14H5zm6 0h8v6h-8z'),
  svgShape('t-shape', 'T shape', 'M5 5h14v5H5zm5 5v10h4V10z'),
  svgShape('steps-2', 'Steps 2', 'M5 17V11h6v6zm6 0V8h8v9z'),
  svgShape('steps-3', 'Steps 3', 'M4 18V14h4v4zm4-4V10h4v4zm4-4V6h8v8z'),
  svgShape('steps-4', 'Steps 4', 'M3 19v-3h3v3zm3-3v-3h3v3zm3-3V10h3v3zm3-3V7h6v6z'),
  svgShape(
    'blob-1',
    'Blob A',
    'M8 5c3-2 8-1 10 3s0 9-4 11-9 1-11-4 2-8 5-10z',
  ),
  svgShape(
    'blob-2',
    'Blob B',
    'M7 6c4-3 10-1 12 4s-1 10-6 12-11-2-12-7 1-9 6-9z',
  ),
  svgShape(
    'blob-3',
    'Blob C',
    'M9 4c5 0 9 3 10 8s-2 9-7 10-10-3-11-8 2-10 8-10z',
  ),
  svgShape(
    'blob-4',
    'Blob D',
    'M6 8c2-4 9-5 12-1s2 9-2 12-10 2-13-3 1-11 3-8z',
  ),
  svgShape(
    'blob-5',
    'Blob E',
    'M10 3c6 1 10 5 9 10s-6 8-11 7S2 14 4 9s4-6 6-6z',
  ),
  svgShape(
    'blob-6',
    'Blob F',
    'M8 7c3-3 9-2 11 3s-1 9-6 11-10-1-11-6 1-8 6-8z',
  ),
  svgShape('wide-rect', 'Wide bar', 'M3 10h18v4H3z'),
  svgShape('pill-split', 'Split pill', 'M4 12a8 8 0 0 1 16 0v2H4z'),
  svgShape('rounded-top', 'Rounded top', 'M6 8h12v12H6zm0-2a6 6 0 0 1 12 0v2H6z'),
  svgShape('compass-star', 'Compass', 'M12 3l2 7h7l-5.5 4 2 7L12 17l-5.5 4 2-7L3 10h7z'),
];

export function getShapeById(id: string): ShapeCatalogEntry | undefined {
  return SHAPE_CATALOG.find((s) => s.id === id);
}
