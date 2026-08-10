import { useRef, useState } from 'react';
import type { useLetterheadCanvas } from '../hooks/useLetterheadCanvas';
import { IconDelete, IconEye, IconEyeOff, IconGrip, IconLock } from './StudioToolbarIcons';

type EditorApi = ReturnType<typeof useLetterheadCanvas>;

export type LayerRow = ReturnType<EditorApi['layers']>[number];

interface LayersPanelProps {
  layers: LayerRow[];
  editor: EditorApi;
}

export function LayersPanel({ layers, editor }: LayersPanelProps) {
  const [dragDisplayIdx, setDragDisplayIdx] = useState<number | null>(null);
  const [overDisplayIdx, setOverDisplayIdx] = useState<number | null>(null);
  const dragGhostRef = useRef<HTMLElement | null>(null);

  const displayLayers = [...layers].reverse();

  const removeDragGhost = () => {
    dragGhostRef.current?.remove();
    dragGhostRef.current = null;
  };

  const finishDrag = () => {
    setDragDisplayIdx(null);
    setOverDisplayIdx(null);
    removeDragGhost();
  };

  const dropAtDisplayIndex = (targetDisplayIdx: number) => {
    if (dragDisplayIdx === null || layers.length === 0) {
      finishDrag();
      return;
    }
    if (dragDisplayIdx === targetDisplayIdx) {
      finishDrag();
      return;
    }
    const n = layers.length;
    const fromContent = n - 1 - dragDisplayIdx;
    const toContent = n - 1 - targetDisplayIdx;
    editor.reorderLayer(fromContent, toContent);
    finishDrag();
  };

  if (layers.length === 0) {
    return (
      <ul className="studio-layer-list polotno" data-testid="layer-list">
        <li className="studio-layer-empty" />
      </ul>
    );
  }

  return (
    <ul
      className="studio-layer-list polotno"
      data-testid="layer-list"
      onMouseLeave={() => editor.clearLayerHoverHighlight()}
    >
      {displayLayers.map((layer, displayIdx) => (
        <li
          key={`layer-${layer.index}-${layer.label}`}
          className={`studio-layer-row${overDisplayIdx === displayIdx ? ' studio-layer-row-over' : ''}${dragDisplayIdx === displayIdx ? ' studio-layer-row-dragging' : ''}`}
          onMouseEnter={() => editor.setLayerHoverHighlight(layer.index)}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setOverDisplayIdx(displayIdx);
          }}
          onDragLeave={() => {
            setOverDisplayIdx((prev) => (prev === displayIdx ? null : prev));
          }}
          onDrop={(e) => {
            e.preventDefault();
            dropAtDisplayIndex(displayIdx);
          }}
        >
          <span
            className="studio-layer-grip-wrap"
            draggable
            aria-label={`Reorder ${layer.label}`}
            onDragStart={(e) => {
              setDragDisplayIdx(displayIdx);
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', String(displayIdx));
              const row = e.currentTarget.closest('.studio-layer-row');
              if (row instanceof HTMLElement) {
                const ghost = row.cloneNode(true) as HTMLElement;
                ghost.classList.add('studio-layer-drag-ghost');
                ghost.style.width = `${row.offsetWidth}px`;
                document.body.appendChild(ghost);
                dragGhostRef.current = ghost;
                e.dataTransfer.setDragImage(ghost, 24, 18);
              }
            }}
            onDragEnd={finishDrag}
          >
            <IconGrip className="studio-layer-grip" />
          </span>
          <button
            type="button"
            className="studio-layer-name"
            onClick={() => editor.selectObject(layer.index)}
          >
            {layer.label}
          </button>
          <button
            type="button"
            className="studio-layer-icon-btn"
            aria-label={layer.visible ? 'Hide' : 'Show'}
            onClick={() => editor.toggleLayerVisibility(layer.index)}
          >
            {layer.visible ? <IconEye /> : <IconEyeOff />}
          </button>
          <button
            type="button"
            className="studio-layer-icon-btn"
            aria-label="Lock"
            onClick={() => {
              editor.selectObject(layer.index);
              editor.toggleLockSelected();
            }}
          >
            <IconLock />
          </button>
          <button
            type="button"
            className="studio-layer-icon-btn"
            aria-label="Delete"
            onClick={() => {
              editor.selectObject(layer.index);
              editor.deleteSelected();
            }}
          >
            <IconDelete />
          </button>
        </li>
      ))}
    </ul>
  );
}
