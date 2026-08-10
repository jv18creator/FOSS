import type { EditorMode } from '../hooks/useLetterheadCanvas';
import { StudioEmptyState } from './StudioEmptyState';
import { IconEmptySelection } from './StudioPanelIcons';

interface SelectionPanelProps {
  mode: EditorMode;
  activeMeta: {
    meta?: {
      role?: string;
      locked?: boolean;
      placeholder?: boolean;
      label?: string;
    };
    text?: string;
  } | null;
  onDelete: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onMetaChange: (patch: {
    locked?: boolean;
    placeholder?: boolean;
    label?: string;
  }) => void;
  onTextChange: (text: string) => void;
}

export function SelectionPanel({
  mode,
  activeMeta,
  onDelete,
  onBringForward,
  onSendBackward,
  onMetaChange,
  onTextChange,
}: SelectionPanelProps) {
  const hasSelection = Boolean(activeMeta?.meta);
  if (!hasSelection) {
    return (
      <StudioEmptyState
        icon={<IconEmptySelection />}
        title="Nothing selected"
        description="Click an object on the canvas or pick a layer to edit properties."
      />
    );
  }

  return (
    <div className="studio-selection-form">
      <label className="studio-field">
        <span>Label</span>
        <input
          data-testid="sel-label"
          value={activeMeta?.meta?.label ?? ''}
          disabled={mode === 'use'}
          onChange={(e) => onMetaChange({ label: e.target.value })}
        />
      </label>
      {activeMeta?.text !== undefined && (
        <label className="studio-field">
          <span>Text</span>
          <textarea
            data-testid="sel-text"
            rows={4}
            value={activeMeta.text}
            onChange={(e) => onTextChange(e.target.value)}
          />
        </label>
      )}
      {mode === 'design' && (
        <>
          <label className="studio-check">
            <input
              type="checkbox"
              data-testid="sel-locked"
              checked={activeMeta?.meta?.locked ?? false}
              onChange={(e) => onMetaChange({ locked: e.target.checked })}
            />
            Lock layout (fixed in Use mode)
          </label>
          <label className="studio-check">
            <input
              type="checkbox"
              data-testid="sel-placeholder"
              checked={activeMeta?.meta?.placeholder ?? false}
              onChange={(e) => onMetaChange({ placeholder: e.target.checked })}
            />
            Editable field in Use mode
          </label>
        </>
      )}
      <div className="studio-btn-row">
        <button type="button" onClick={onBringForward}>
          Forward
        </button>
        <button type="button" onClick={onSendBackward}>
          Back
        </button>
        <button
          type="button"
          className="studio-btn-danger"
          data-testid="delete-selected"
          onClick={onDelete}
          disabled={mode === 'use'}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
