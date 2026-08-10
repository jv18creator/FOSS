export type StudioTool =
  | 'templates'
  | 'text'
  | 'elements'
  | 'draw'
  | 'upload'
  | 'background'
  | 'layers'
  | 'resize';

export const STUDIO_TOOLS: {
  id: StudioTool;
  label: string;
}[] = [
  { id: 'templates', label: 'Templates' },
  { id: 'text', label: 'Text' },
  { id: 'elements', label: 'Elements' },
  { id: 'draw', label: 'Draw' },
  { id: 'upload', label: 'Upload' },
  { id: 'background', label: 'Background' },
  { id: 'layers', label: 'Layers' },
  { id: 'resize', label: 'Resize' },
];
