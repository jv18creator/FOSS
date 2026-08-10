/** Google Fonts loaded in studio-editor.css — free for editor use. */
export const STUDIO_FONT_FAMILIES = [
  { id: 'inter', label: 'Inter', stack: 'Inter, system-ui, sans-serif' },
  { id: 'roboto', label: 'Roboto', stack: 'Roboto, system-ui, sans-serif' },
  { id: 'open-sans', label: 'Open Sans', stack: '"Open Sans", system-ui, sans-serif' },
  { id: 'lato', label: 'Lato', stack: 'Lato, system-ui, sans-serif' },
  { id: 'montserrat', label: 'Montserrat', stack: 'Montserrat, system-ui, sans-serif' },
  { id: 'poppins', label: 'Poppins', stack: 'Poppins, system-ui, sans-serif' },
  { id: 'raleway', label: 'Raleway', stack: 'Raleway, system-ui, sans-serif' },
  { id: 'nunito', label: 'Nunito', stack: 'Nunito, system-ui, sans-serif' },
  { id: 'dm-sans', label: 'DM Sans', stack: '"DM Sans", system-ui, sans-serif' },
  { id: 'source-sans', label: 'Source Sans 3', stack: '"Source Sans 3", system-ui, sans-serif' },
  { id: 'playfair', label: 'Playfair Display', stack: '"Playfair Display", Georgia, serif' },
  { id: 'merriweather', label: 'Merriweather', stack: 'Merriweather, Georgia, serif' },
  { id: 'libre-baskerville', label: 'Libre Baskerville', stack: '"Libre Baskerville", Georgia, serif' },
  { id: 'oswald', label: 'Oswald', stack: 'Oswald, system-ui, sans-serif' },
  { id: 'bebas', label: 'Bebas Neue', stack: '"Bebas Neue", system-ui, sans-serif' },
  { id: 'rock-salt', label: 'Rock Salt', stack: '"Rock Salt", cursive' },
  { id: 'pacifico', label: 'Pacifico', stack: 'Pacifico, cursive' },
  { id: 'dancing', label: 'Dancing Script', stack: '"Dancing Script", cursive' },
] as const;

/** Standard typography sizes for the top bar and new text. */
export const STUDIO_FONT_SIZES = [
  8, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 42, 48, 56, 64, 72, 96,
] as const;

export function studioFontSizeSelectOptions(currentSize: number): number[] {
  const rounded = Math.round(currentSize);
  if ((STUDIO_FONT_SIZES as readonly number[]).includes(rounded)) {
    return [...STUDIO_FONT_SIZES];
  }
  return [...STUDIO_FONT_SIZES, rounded].sort((a, b) => a - b);
}

export const TEXT_PRESETS = [
  {
    id: 'header',
    label: 'Create header',
    text: 'Heading',
    fontSize: 42,
    fontWeight: 'bold' as const,
    fontFamily: 'Montserrat, system-ui, sans-serif',
    role: 'heading' as const,
  },
  {
    id: 'subheader',
    label: 'Create sub-header',
    text: 'Subheading',
    fontSize: 28,
    fontWeight: '600' as const,
    fontFamily: 'Inter, system-ui, sans-serif',
    role: 'heading' as const,
  },
  {
    id: 'body',
    label: 'Create body text',
    text: 'Body text goes here',
    fontSize: 16,
    fontWeight: 'normal' as const,
    fontFamily: 'Inter, system-ui, sans-serif',
    role: 'body' as const,
  },
] as const;

export const TEXT_STYLE_TEMPLATES = [
  {
    id: 'adventure',
    preview: 'Life is an ADVENTURE',
    text: 'Life is an\nADVENTURE',
    fontFamily: '"Rock Salt", cursive',
    fontSize: 36,
    fill: '#0f172a',
  },
  {
    id: 'congrats',
    preview: 'Congratulations!',
    text: 'Congratulations!',
    fontFamily: 'Pacifico, cursive',
    fontSize: 40,
    fill: '#1e40af',
  },
  {
    id: 'proposal',
    preview: 'MARKETING PROPOSAL',
    text: 'MARKETING PROPOSAL',
    fontFamily: 'Oswald, system-ui, sans-serif',
    fontSize: 32,
    fill: '#111827',
    fontWeight: 'bold' as const,
  },
  {
    id: 'elegant-serif',
    preview: 'Timeless Elegance',
    text: 'Timeless Elegance',
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: 34,
    fill: '#1c1917',
    fontWeight: 'bold' as const,
  },
  {
    id: 'sale-banner',
    preview: 'SUMMER SALE',
    text: 'SUMMER SALE',
    fontFamily: '"Bebas Neue", system-ui, sans-serif',
    fontSize: 48,
    fill: '#dc2626',
  },
  {
    id: 'thank-you',
    preview: 'Thank you',
    text: 'Thank you',
    fontFamily: '"Dancing Script", cursive',
    fontSize: 44,
    fill: '#7c3aed',
  },
  {
    id: 'quote',
    preview: '"Create with purpose"',
    text: '"Create with purpose"',
    fontFamily: 'Merriweather, Georgia, serif',
    fontSize: 22,
    fill: '#334155',
    fontWeight: 'bold' as const,
  },
  {
    id: 'startup-pitch',
    preview: 'PITCH DECK',
    text: 'PITCH DECK',
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontSize: 30,
    fill: '#0f766e',
    fontWeight: 'bold' as const,
  },
  {
    id: 'neon-pop',
    preview: 'NEON NIGHTS',
    text: 'NEON NIGHTS',
    fontFamily: 'Montserrat, system-ui, sans-serif',
    fontSize: 28,
    fill: '#ec4899',
    fontWeight: 'bold' as const,
  },
  {
    id: 'minimal-cap',
    preview: 'LESS IS MORE',
    text: 'LESS IS MORE',
    fontFamily: 'Raleway, system-ui, sans-serif',
    fontSize: 26,
    fill: '#64748b',
    fontWeight: '600' as const,
  },
  {
    id: 'friendly',
    preview: 'Hello there!',
    text: 'Hello there!',
    fontFamily: 'Nunito, system-ui, sans-serif',
    fontSize: 32,
    fill: '#2563eb',
    fontWeight: 'bold' as const,
  },
  {
    id: 'editorial',
    preview: 'The Daily Edit',
    text: 'The Daily Edit',
    fontFamily: '"Libre Baskerville", Georgia, serif',
    fontSize: 28,
    fill: '#0f172a',
  },
  {
    id: 'badge',
    preview: 'NEW ARRIVAL',
    text: 'NEW ARRIVAL',
    fontFamily: 'Oswald, system-ui, sans-serif',
    fontSize: 30,
    fill: '#ea580c',
    fontWeight: 'bold' as const,
  },
  {
    id: 'handwritten',
    preview: 'With love',
    text: 'With love',
    fontFamily: '"Rock Salt", cursive',
    fontSize: 28,
    fill: '#be123c',
  },
  {
    id: 'corporate',
    preview: 'Annual Report 2026',
    text: 'Annual Report 2026',
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: 24,
    fill: '#1e3a5f',
    fontWeight: 'bold' as const,
  },
  {
    id: 'tech',
    preview: 'Build. Ship. Repeat.',
    text: 'Build. Ship. Repeat.',
    fontFamily: '"Source Sans 3", system-ui, sans-serif',
    fontSize: 26,
    fill: '#0d9488',
    fontWeight: 'bold' as const,
  },
] as const;

/** Draggable font showcase tiles (sidebar). */
export const FONT_SHOWCASE = STUDIO_FONT_FAMILIES.map((font) => ({
  id: `font-${font.id}`,
  label: font.label,
  preview: 'Aa',
  text: font.label,
  fontFamily: font.stack,
  fontSize: font.id === 'bebas' || font.id === 'oswald' ? 36 : 32,
  fill: '#0f172a',
  fontWeight: font.id === 'playfair' || font.id === 'merriweather' ? ('bold' as const) : undefined,
}));
