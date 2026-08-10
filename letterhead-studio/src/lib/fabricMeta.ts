import type { FabricObject } from 'fabric';

export type ElementRole =
  | 'logo'
  | 'heading'
  | 'body'
  | 'line'
  | 'shape'
  | 'image'
  | 'draw'
  | 'guide';

export interface LetterheadMeta {
  role: ElementRole;
  locked: boolean;
  placeholder: boolean;
  fieldId?: string;
  label?: string;
}

export const META_KEY = 'letterhead';

export function getMeta(obj: FabricObject): LetterheadMeta | undefined {
  return (obj as FabricObject & { letterhead?: LetterheadMeta }).letterhead;
}

export function setMeta(obj: FabricObject, meta: Partial<LetterheadMeta>) {
  const current = getMeta(obj) ?? {
    role: 'body',
    locked: false,
    placeholder: false,
  };
  (obj as FabricObject & { letterhead: LetterheadMeta }).letterhead = {
    ...current,
    ...meta,
  };
}

export function isGuide(obj: FabricObject): boolean {
  return getMeta(obj)?.role === 'guide';
}

export function isLocked(obj: FabricObject): boolean {
  return Boolean(getMeta(obj)?.locked);
}

export function applyLockState(obj: FabricObject) {
  const locked = isLocked(obj);
  obj.set({
    selectable: true,
    evented: true,
    hasControls: !locked,
    lockMovementX: locked,
    lockMovementY: locked,
    lockScalingX: locked,
    lockScalingY: locked,
    lockRotation: locked,
    hoverCursor: locked ? 'default' : 'move',
  });
}

export function applyUseMode(obj: FabricObject, useMode: boolean) {
  if (isGuide(obj)) {
    obj.set({ selectable: false, evented: false, visible: useMode });
    return;
  }
  const meta = getMeta(obj);
  if (!useMode) {
    applyLockState(obj);
    return;
  }
  if (meta?.placeholder) {
    obj.set({
      selectable: true,
      evented: true,
      hasControls: false,
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
    });
    return;
  }
  obj.set({
    selectable: false,
    evented: false,
    hasControls: false,
  });
}
