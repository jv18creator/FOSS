import { EDITOR_DPI } from './pageFormats';

export type ResizeUnit = 'px' | 'cm' | 'in';

const CM_PER_IN = 2.54;

export function pxToUnit(px: number, unit: ResizeUnit): number {
  if (unit === 'px') return px;
  if (unit === 'cm') return (px / EDITOR_DPI) * CM_PER_IN;
  return px / EDITOR_DPI;
}

export function unitToPx(value: number, unit: ResizeUnit): number {
  if (unit === 'px') return value;
  if (unit === 'cm') return (value / CM_PER_IN) * EDITOR_DPI;
  return value * EDITOR_DPI;
}

export function formatUnitValue(value: number, unit: ResizeUnit): string {
  if (unit === 'px') return String(Math.round(value));
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function formatPresetDimensions(
  width: number,
  height: number,
  unit: ResizeUnit,
): string {
  if (unit === 'px') return `${width}×${height} px`;
  if (unit === 'cm') return `${width}×${height} cm`;
  return `${width}×${height} in`;
}
