import { unitToPx, type ResizeUnit } from '../lib/resizeUnits';

export type ResizePresetDef = {
  id: string;
  label: string;
  width: number;
  height: number;
  unit: ResizeUnit;
};

export type ResizeCategoryDef = {
  id: string;
  label: string;
  presets: ResizePresetDef[];
};

export type ResizePresetResolved = ResizePresetDef & {
  widthPx: number;
  heightPx: number;
  dimensionLabel: string;
};

function resolvePreset(p: ResizePresetDef): ResizePresetResolved {
  const widthPx = Math.round(unitToPx(p.width, p.unit));
  const heightPx = Math.round(unitToPx(p.height, p.unit));
  const unitSuffix = p.unit === 'px' ? 'px' : p.unit === 'cm' ? 'cm' : 'in';
  return {
    ...p,
    widthPx,
    heightPx,
    dimensionLabel: `${p.width}×${p.height} ${unitSuffix}`,
  };
}

const RAW_CATEGORIES: ResizeCategoryDef[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    presets: [
      { id: 'ig-post', label: 'Post', width: 1080, height: 1080, unit: 'px' },
      { id: 'ig-story', label: 'Story', width: 1080, height: 1920, unit: 'px' },
      { id: 'ig-ad', label: 'Ad', width: 1080, height: 1080, unit: 'px' },
    ],
  },
  {
    id: 'facebook',
    label: 'Facebook',
    presets: [
      { id: 'fb-post-landscape', label: 'Post (Landscape)', width: 1200, height: 630, unit: 'px' },
      { id: 'fb-post-square', label: 'Post (Square)', width: 1080, height: 1080, unit: 'px' },
      { id: 'fb-cover', label: 'Cover', width: 851, height: 315, unit: 'px' },
    ],
  },
  {
    id: 'youtube',
    label: 'Youtube',
    presets: [
      { id: 'yt-thumb', label: 'Thumbnail', width: 1280, height: 720, unit: 'px' },
      { id: 'yt-channel', label: 'Channel', width: 2560, height: 1440, unit: 'px' },
      { id: 'yt-short', label: 'Short', width: 1080, height: 1920, unit: 'px' },
    ],
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    presets: [
      { id: 'li-post', label: 'Post', width: 1200, height: 627, unit: 'px' },
      { id: 'li-banner', label: 'Banner', width: 1584, height: 396, unit: 'px' },
      { id: 'li-square', label: 'Square', width: 1080, height: 1080, unit: 'px' },
    ],
  },
  {
    id: 'twitter',
    label: 'Twitter',
    presets: [
      { id: 'tw-post', label: 'Post', width: 1600, height: 900, unit: 'px' },
      { id: 'tw-header', label: 'Header', width: 1500, height: 500, unit: 'px' },
      { id: 'tw-square', label: 'Square', width: 1080, height: 1080, unit: 'px' },
    ],
  },
  {
    id: 'video',
    label: 'Video',
    presets: [
      { id: 'vid-fhd', label: 'Full HD', width: 1920, height: 1080, unit: 'px' },
      { id: 'vid-4k', label: '4K UHD', width: 3840, height: 2160, unit: 'px' },
      { id: 'vid-vertical', label: 'Vertical HD', width: 1080, height: 1920, unit: 'px' },
      { id: 'vid-square', label: 'Square HD', width: 1080, height: 1080, unit: 'px' },
    ],
  },
  {
    id: 'print',
    label: 'Print',
    presets: [
      { id: 'print-invite', label: 'Invitation', width: 14, height: 14, unit: 'cm' },
      { id: 'print-a4-p', label: 'A4 Portrait', width: 21, height: 29.7, unit: 'cm' },
      { id: 'print-a4-l', label: 'A4 Landscape', width: 29.7, height: 21, unit: 'cm' },
      { id: 'print-a3', label: 'A3', width: 29.7, height: 42, unit: 'cm' },
      { id: 'print-letter-p', label: 'Letter Portrait', width: 8.5, height: 11, unit: 'in' },
      { id: 'print-letter-l', label: 'Letter Landscape', width: 11, height: 8.5, unit: 'in' },
      { id: 'print-card', label: 'Business card', width: 3.5, height: 2, unit: 'in' },
      { id: 'print-poster', label: 'Poster', width: 18, height: 24, unit: 'in' },
    ],
  },
];

export const RESIZE_CATEGORIES = RAW_CATEGORIES.map((cat) => ({
  ...cat,
  presets: cat.presets.map(resolvePreset),
}));
