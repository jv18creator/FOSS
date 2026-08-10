export type SolidBackground = {
  id: string;
  label: string;
  color: string;
};

export type GradientBackground = {
  id: string;
  label: string;
  preview: string;
  colorStops: { offset: number; color: string }[];
  angleDeg?: number;
};

export const SOLID_BACKGROUNDS: SolidBackground[] = [
  { id: 'white', label: 'White', color: '#ffffff' },
  { id: 'slate-50', label: 'Cloud', color: '#f8fafc' },
  { id: 'slate-200', label: 'Mist', color: '#e2e8f0' },
  { id: 'rose-100', label: 'Blush', color: '#ffe4e6' },
  { id: 'amber-100', label: 'Sand', color: '#fef3c7' },
  { id: 'lime-100', label: 'Mint', color: '#ecfccb' },
  { id: 'sky-100', label: 'Sky', color: '#e0f2fe' },
  { id: 'violet-100', label: 'Lilac', color: '#ede9fe' },
  { id: 'slate-800', label: 'Charcoal', color: '#1e293b' },
  { id: 'navy', label: 'Navy', color: '#1e3a5f' },
];

export const GRADIENT_BACKGROUNDS: GradientBackground[] = [
  {
    id: 'sunrise',
    label: 'Sunrise',
    preview: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
    colorStops: [
      { offset: 0, color: '#f97316' },
      { offset: 1, color: '#fbbf24' },
    ],
    angleDeg: 135,
  },
  {
    id: 'ocean',
    label: 'Ocean',
    preview: 'linear-gradient(160deg, #0ea5e9 0%, #1e40af 100%)',
    colorStops: [
      { offset: 0, color: '#0ea5e9' },
      { offset: 1, color: '#1e40af' },
    ],
    angleDeg: 160,
  },
  {
    id: 'forest',
    label: 'Forest',
    preview: 'linear-gradient(145deg, #22c55e 0%, #14532d 100%)',
    colorStops: [
      { offset: 0, color: '#22c55e' },
      { offset: 1, color: '#14532d' },
    ],
    angleDeg: 145,
  },
  {
    id: 'berry',
    label: 'Berry',
    preview: 'linear-gradient(120deg, #ec4899 0%, #7c3aed 100%)',
    colorStops: [
      { offset: 0, color: '#ec4899' },
      { offset: 1, color: '#7c3aed' },
    ],
    angleDeg: 120,
  },
  {
    id: 'slate',
    label: 'Slate',
    preview: 'linear-gradient(180deg, #334155 0%, #0f172a 100%)',
    colorStops: [
      { offset: 0, color: '#334155' },
      { offset: 1, color: '#0f172a' },
    ],
    angleDeg: 180,
  },
  {
    id: 'peach',
    label: 'Peach',
    preview: 'linear-gradient(90deg, #fda4af 0%, #fef08a 100%)',
    colorStops: [
      { offset: 0, color: '#fda4af' },
      { offset: 1, color: '#fef08a' },
    ],
    angleDeg: 90,
  },
  {
    id: 'aurora',
    label: 'Aurora',
    preview: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #f472b6 100%)',
    colorStops: [
      { offset: 0, color: '#06b6d4' },
      { offset: 0.5, color: '#8b5cf6' },
      { offset: 1, color: '#f472b6' },
    ],
    angleDeg: 135,
  },
  {
    id: 'copper',
    label: 'Copper',
    preview: 'linear-gradient(160deg, #b45309 0%, #451a03 100%)',
    colorStops: [
      { offset: 0, color: '#b45309' },
      { offset: 1, color: '#451a03' },
    ],
    angleDeg: 160,
  },
  {
    id: 'frost',
    label: 'Frost',
    preview: 'linear-gradient(180deg, #e0f2fe 0%, #f8fafc 100%)',
    colorStops: [
      { offset: 0, color: '#e0f2fe' },
      { offset: 1, color: '#f8fafc' },
    ],
    angleDeg: 180,
  },
  {
    id: 'ink',
    label: 'Ink',
    preview: 'linear-gradient(135deg, #171717 0%, #404040 100%)',
    colorStops: [
      { offset: 0, color: '#171717' },
      { offset: 1, color: '#404040' },
    ],
    angleDeg: 135,
  },
];
