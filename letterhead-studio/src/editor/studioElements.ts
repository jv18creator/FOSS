export type LineStyleId =
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'arrow-end'
  | 'arrow-both'
  | 'circle-arrow'
  | 'square-bar';

export const LINE_STYLES: {
  id: LineStyleId;
  label: string;
  strokeDashArray?: number[];
  variant?: 'path';
}[] = [
  { id: 'solid', label: 'Solid' },
  { id: 'dashed', label: 'Dashed', strokeDashArray: [12, 6] },
  { id: 'dotted', label: 'Dotted', strokeDashArray: [2, 4] },
  { id: 'arrow-end', label: 'Arrow', variant: 'path' },
  { id: 'arrow-both', label: 'Double arrow', variant: 'path' },
  { id: 'circle-arrow', label: 'Circle arrow', variant: 'path' },
  { id: 'square-bar', label: 'Square end', variant: 'path' },
];

export { SHAPE_CATALOG, getShapeById } from './studioShapeLibrary';
export type { ShapeCatalogEntry, PrimitiveShapeKind } from './studioShapeLibrary';
