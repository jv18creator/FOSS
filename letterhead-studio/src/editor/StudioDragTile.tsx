import type { ReactNode, DragEvent } from 'react';
import {
  setStudioDragData,
  type StudioDragPayload,
} from './studioDragDrop';

interface StudioDragTileProps {
  label: string;
  payload: StudioDragPayload;
  onActivate: () => void;
  className?: string;
  children: ReactNode;
  testId?: string;
  /** When true, only the preview area is shown (no caption under the tile). */
  hideLabel?: boolean;
}

export function StudioDragTile({
  label,
  payload,
  onActivate,
  className = 'studio-element-tile',
  children,
  testId,
  hideLabel = false,
}: StudioDragTileProps) {
  const onDragStart = (e: DragEvent) => {
    setStudioDragData(e.dataTransfer, payload);
  };

  return (
    <button
      type="button"
      className={className}
      title={label}
      aria-label={label}
      data-testid={testId}
      draggable
      onDragStart={onDragStart}
      onClick={onActivate}
    >
      <span className="studio-tile-preview">{children}</span>
      {!hideLabel ? <span className="studio-tile-label">{label}</span> : null}
    </button>
  );
}
