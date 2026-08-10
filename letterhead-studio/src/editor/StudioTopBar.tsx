import { useEffect, useRef, useState } from 'react';
import { StudioFloatingTip } from '../components/StudioFloatingTip';
import type { EditorMode } from '../hooks/useLetterheadCanvas';
import type { ActiveSelectionState } from '../hooks/useLetterheadCanvas';
import { STUDIO_FONT_FAMILIES, studioFontSizeSelectOptions } from './studioFonts';
import {
  IconDelete,
  IconDownload,
  IconDuplicate,
  IconHelp,
  IconLock,
  IconOpacity,
  IconRedo,
  IconUndo,
} from './StudioToolbarIcons';

interface StudioTopBarProps {
  templateName: string;
  mode: EditorMode;
  editor: {
    canUndo: boolean;
    canRedo: boolean;
    undo: () => void;
    redo: () => void;
    bringForward: () => void;
    sendBackward: () => void;
    toggleLockSelected: () => void;
    duplicateSelected: () => Promise<void>;
    deleteSelected: () => void;
    activeSelection: () => ActiveSelectionState;
    updateSelectedFill: (color: string) => void;
    updateSelectedFontFamily: (family: string) => void;
    updateSelectedFontSize: (size: number) => void;
    updateSelectedOpacity: (opacity: number) => void;
    setPageBackground: (color: string) => void;
  };
  pageBackground: string;
  downloadOpen: boolean;
  onDownloadToggle: () => void;
  onExportPng: () => void;
  onExportPdf: () => void;
}

export function StudioTopBar({
  templateName,
  mode,
  editor,
  pageBackground,
  downloadOpen,
  onDownloadToggle,
  onExportPng,
  onExportPdf,
}: StudioTopBarProps) {
  const [opacityOpen, setOpacityOpen] = useState(false);
  const opacityWrapRef = useRef<HTMLDivElement>(null);
  const selection = editor.activeSelection();
  const hasSelection = selection.kind !== 'none';
  const isText = selection.kind === 'text';
  const fillColor = hasSelection && 'fill' in selection ? (selection.fill ?? '#000000') : '#000000';
  const locked = hasSelection && 'locked' in selection ? selection.locked : false;
  const opacityPercent = Math.round(
    (('opacity' in selection ? selection.opacity : 1) ?? 1) * 100,
  );

  useEffect(() => {
    if (!opacityOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (
        opacityWrapRef.current &&
        !opacityWrapRef.current.contains(event.target as Node)
      ) {
        setOpacityOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [opacityOpen]);

  return (
    <header className="studio-topbar">
      <div className="studio-brand">
        <span className="studio-brand-mark" aria-hidden />
        <span className="studio-brand-name" title={templateName}>
          {templateName.trim() || 'Untitled template'}
        </span>
      </div>
      <div className="studio-topbar-divider" aria-hidden />
      <div className="studio-topbar-group">
        <button
          type="button"
          className="studio-icon-btn"
          aria-label="Undo"
          disabled={!editor.canUndo}
          onClick={editor.undo}
        >
          <IconUndo />
        </button>
        <button
          type="button"
          className="studio-icon-btn"
          aria-label="Redo"
          disabled={!editor.canRedo}
          onClick={editor.redo}
        >
          <IconRedo />
        </button>
      </div>

      {hasSelection && (
        <div className="studio-topbar-context">
          <label className="studio-color-swatch" title="Fill color">
            <span className="studio-sr-only">Fill color</span>
            <input
              type="color"
              value={fillColor}
              disabled={mode === 'use' && !('placeholder' in selection && selection.placeholder)}
              onChange={(e) => editor.updateSelectedFill(e.target.value)}
            />
          </label>

          {isText && selection.kind === 'text' && (
            <>
              <select
                className="studio-topbar-select"
                aria-label="Font family"
                value={selection.fontFamily ?? STUDIO_FONT_FAMILIES[0].stack}
                disabled={mode === 'use' && !selection.placeholder}
                onChange={(e) => editor.updateSelectedFontFamily(e.target.value)}
              >
                {STUDIO_FONT_FAMILIES.map((f) => (
                  <option key={f.id} value={f.stack}>
                    {f.label}
                  </option>
                ))}
              </select>
              <select
                className="studio-topbar-select studio-topbar-select--size"
                aria-label="Font size"
                value={Math.round(selection.fontSize ?? 16)}
                disabled={mode === 'use' && !selection.placeholder}
                onChange={(e) =>
                  editor.updateSelectedFontSize(Number(e.target.value))
                }
              >
                {studioFontSizeSelectOptions(selection.fontSize ?? 16).map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      )}

      {!hasSelection && (
        <label className="studio-color-swatch" title="Page background">
          <span className="studio-sr-only">Page background</span>
          <input
            type="color"
            value={pageBackground}
            onChange={(e) => editor.setPageBackground(e.target.value)}
          />
        </label>
      )}

      <div className="studio-topbar-spacer" />

      {hasSelection && (
        <div className="studio-topbar-group studio-topbar-actions">
          <div className="studio-opacity-popover-wrap" ref={opacityWrapRef}>
            <button
              type="button"
              className={`studio-opacity-trigger${opacityOpen ? ' active' : ''}`}
              aria-label={`Opacity, ${opacityPercent} percent`}
              aria-expanded={opacityOpen}
              aria-haspopup="dialog"
              onClick={() => setOpacityOpen((open) => !open)}
            >
              <IconOpacity />
              <span className="studio-opacity-trigger-value" aria-hidden>
                {opacityPercent}%
              </span>
            </button>
            {opacityOpen && (
              <div className="studio-opacity-popover" role="dialog" aria-label="Opacity">
                <span className="studio-opacity-popover-label">Opacity</span>
                <div className="studio-range-row studio-opacity-popover-row">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={opacityPercent}
                    className="studio-range"
                    aria-label="Opacity"
                    onChange={(e) =>
                      editor.updateSelectedOpacity(Number(e.target.value) / 100)
                    }
                  />
                  <span className="studio-range-value">{opacityPercent}%</span>
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            className={`studio-icon-btn${locked ? ' active' : ''}`}
            aria-label={locked ? 'Unlock' : 'Lock'}
            aria-pressed={locked}
            onClick={editor.toggleLockSelected}
          >
            <IconLock />
          </button>
          <button
            type="button"
            className="studio-icon-btn"
            aria-label="Duplicate"
            onClick={() => void editor.duplicateSelected()}
          >
            <IconDuplicate />
          </button>
          <button
            type="button"
            className="studio-icon-btn"
            aria-label="Delete"
            disabled={mode === 'use'}
            onClick={editor.deleteSelected}
          >
            <IconDelete />
          </button>
          <StudioFloatingTip
            variant="popover"
            placement="bottom"
            content={
              <>
                <p>Selection tips</p>
                <ul>
                  <li>⌘/Ctrl+Z undo, ⌘/Ctrl+Y or ⇧⌘/Ctrl+Z redo, Delete removes selection.</li>
                  <li>Locked items can be selected but not moved.</li>
                  <li>Use Layers to reorder and preview on canvas.</li>
                  <li>Drag sidebar tiles onto the page to place them.</li>
                </ul>
              </>
            }
          >
            <button type="button" className="studio-icon-btn" aria-label="Help">
              <IconHelp />
            </button>
          </StudioFloatingTip>
        </div>
      )}

      <div className="studio-download-wrap">
        <button
          type="button"
          className="studio-download-btn studio-download-btn-primary"
          aria-expanded={downloadOpen}
          onClick={onDownloadToggle}
        >
          <IconDownload />
          <span>Download</span>
        </button>
        {downloadOpen && (
          <div className="studio-download-menu" role="menu">
            <button type="button" role="menuitem" data-testid="export-png" onClick={onExportPng}>
              Save as image
            </button>
            <button type="button" role="menuitem" data-testid="export-pdf" onClick={onExportPdf}>
              Save as PDF
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
