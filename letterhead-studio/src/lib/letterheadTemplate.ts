import type { PageFormatId, PageOrientation } from './pageFormats';

export type LetterheadTemplateFile = {
  version: number;
  name: string;
  formatId: PageFormatId;
  orientation: PageOrientation;
  editorDpi: number;
  pageWidthPx?: number;
  pageHeightPx?: number;
  canvas: object & { background?: string };
};
