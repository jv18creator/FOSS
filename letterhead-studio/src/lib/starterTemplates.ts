import type { PageFormatId } from './pageFormats';

export type StarterTemplateMeta = {
  id: string;
  title: string;
  description: string;
  occasion: string;
  formatId: PageFormatId;
  formatLabel: string;
  previewPage: string;
  previewAccent: string;
  /** Fetched at runtime from public/. */
  jsonUrl: string;
};

const FORMAT_LABEL: Record<PageFormatId, string> = {
  a4: 'A4',
  'us-letter': 'US Letter',
  legal: 'Legal',
  executive: 'Executive',
};

export const STARTER_TEMPLATES: StarterTemplateMeta[] = [
  {
    id: 'atelier-nord',
    title: 'Atelier Nord',
    occasion: 'Formal',
    description: 'Photo header, 15 mm margins, contact strip.',
    formatId: 'a4',
    formatLabel: FORMAT_LABEL.a4,
    previewPage: '#f8fafc',
    previewAccent: '#b45309',
    jsonUrl: '/templates/occasions/atelier-nord.letterhead.json',
  },
  {
    id: 'violet-hour',
    title: 'Violet Hour',
    occasion: 'Events',
    description: 'Event photo banner with contact block.',
    formatId: 'us-letter',
    formatLabel: FORMAT_LABEL['us-letter'],
    previewPage: '#ffffff',
    previewAccent: '#9d174d',
    jsonUrl: '/templates/occasions/violet-hour.letterhead.json',
  },
  {
    id: 'ledger-harvest',
    title: 'Ledger Harvest',
    occasion: 'Seasonal',
    description: 'Farm photo header with ledger line.',
    formatId: 'executive',
    formatLabel: FORMAT_LABEL.executive,
    previewPage: '#ecfccb',
    previewAccent: '#d97706',
    jsonUrl: '/templates/occasions/ledger-harvest.letterhead.json',
  },
];

export async function fetchStarterTemplate(id: string) {
  const meta = STARTER_TEMPLATES.find((t) => t.id === id);
  if (!meta) throw new Error(`Unknown starter: ${id}`);
  const res = await fetch(meta.jsonUrl);
  if (!res.ok) throw new Error(`Failed to load ${meta.jsonUrl}`);
  return res.json();
}
