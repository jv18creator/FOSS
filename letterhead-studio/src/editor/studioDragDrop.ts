export const STUDIO_DRAG_MIME = 'application/x-letterhead-studio';

export type StudioDragPayload =
  | { type: 'line'; style: string }
  | { type: 'shape'; shapeId: string }
  | { type: 'text-preset'; presetId: string }
  | { type: 'text-template'; templateId: string }
  | { type: 'upload'; assetId: string }
  | { type: 'background-solid'; color: string }
  | { type: 'background-gradient'; gradientId: string };

export function encodeStudioDrag(payload: StudioDragPayload): string {
  return JSON.stringify(payload);
}

export function decodeStudioDrag(raw: string): StudioDragPayload | null {
  try {
    const parsed = JSON.parse(raw) as StudioDragPayload;
    if (parsed && typeof parsed === 'object' && 'type' in parsed) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

export function setStudioDragData(dt: DataTransfer, payload: StudioDragPayload) {
  const encoded = encodeStudioDrag(payload);
  dt.setData(STUDIO_DRAG_MIME, encoded);
  dt.setData('text/plain', payload.type);
  dt.effectAllowed = 'copy';
}

export function readStudioDragData(dt: DataTransfer): StudioDragPayload | null {
  const raw = dt.getData(STUDIO_DRAG_MIME);
  if (raw) return decodeStudioDrag(raw);
  return null;
}
