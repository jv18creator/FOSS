import { useEffect, useState } from 'react';
import { RESIZE_CATEGORIES, type ResizePresetResolved } from './studioResizePresets';
import {
  formatUnitValue,
  pxToUnit,
  unitToPx,
  type ResizeUnit,
} from '../lib/resizeUnits';
import type { EditorMode } from '../hooks/useLetterheadCanvas';
import type { PageFormatId, PageOrientation } from '../lib/pageFormats';
import { PAGE_FORMATS } from '../lib/pageFormats';
import { IconHelp } from './StudioToolbarIcons';

function CategoryIcon({ id }: { id: string }) {
  const cls = 'studio-resize-cat-icon';
  switch (id) {
    case 'instagram':
      return (
        <svg className={cls} viewBox="0 0 24 24" aria-hidden>
          <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="17" cy="7" r="1" fill="currentColor" />
        </svg>
      );
    case 'facebook':
      return (
        <svg className={cls} viewBox="0 0 24 24" aria-hidden>
          <path
            d="M14 8h2.5V5H14c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.5l.5-3H13V9c0-.6.4-1 1-1z"
            fill="currentColor"
          />
        </svg>
      );
    case 'youtube':
      return (
        <svg className={cls} viewBox="0 0 24 24" aria-hidden>
          <rect x="3" y="7" width="18" height="10" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 10l4 2-4 2v-4z" fill="currentColor" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg className={cls} viewBox="0 0 24 24" aria-hidden>
          <rect x="5" y="9" width="3" height="10" fill="currentColor" />
          <circle cx="6.5" cy="6.5" r="1.75" fill="currentColor" />
          <path
            d="M11 9h3v1.4c.5-.9 1.6-1.5 3-1.5 2.2 0 3.5 1.4 3.5 4.2V19h-3v-4.8c0-1.4-.5-2.3-1.7-2.3-1 0-1.6.7-1.9 1.4-.1.2-.1.5-.1.8V19h-3V9z"
            fill="currentColor"
          />
        </svg>
      );
    case 'twitter':
      return (
        <svg className={cls} viewBox="0 0 24 24" aria-hidden>
          <path
            d="M18.9 6.5h2.1l-4.6 5.2 5.4 7.8h-4.2l-3.3-4.3-3.8 4.3H8.5l4.9-5.6L8.3 6.5h4.3l3 3.9 3.3-3.9zm-.7 12.1h1.2L9.2 7.6H8l10.2 11z"
            fill="currentColor"
          />
        </svg>
      );
    case 'video':
      return (
        <svg className={cls} viewBox="0 0 24 24" aria-hidden>
          <rect x="3" y="6" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 10l5-3v10l-5-3v-4z" fill="currentColor" />
        </svg>
      );
    case 'print':
      return (
        <svg className={cls} viewBox="0 0 24 24" aria-hidden>
          <path
            d="M7 8V5h10v3M7 16v3h10v-3M5 12h14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <rect x="6" y="10" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    default:
      return null;
  }
}

function PresetIcon({ preset }: { preset: ResizePresetResolved }) {
  const cls = 'studio-resize-preset-icon';
  const isLandscape = preset.widthPx >= preset.heightPx;
  const isSquare = preset.widthPx === preset.heightPx;
  return (
    <span
      className={`${cls}${isSquare ? ' is-square' : isLandscape ? ' is-landscape' : ' is-portrait'}`}
      aria-hidden
    />
  );
}

function presetMatchesPage(
  preset: ResizePresetResolved,
  widthPx: number,
  heightPx: number,
): boolean {
  return preset.widthPx === Math.round(widthPx) && preset.heightPx === Math.round(heightPx);
}

export interface ResizePanelProps {
  widthPx: number;
  heightPx: number;
  magicResize: boolean;
  onMagicResizeChange: (value: boolean) => void;
  onApplyResize: (widthPx: number, heightPx: number) => void;
  formatId: PageFormatId;
  orientation: PageOrientation;
  mode: EditorMode;
  onFormatIdChange: (id: PageFormatId) => void;
  onOrientationChange: (o: PageOrientation) => void;
  onModeChange: (mode: EditorMode) => void;
}

export function ResizePanel({
  widthPx,
  heightPx,
  magicResize,
  onMagicResizeChange,
  onApplyResize,
  formatId,
  orientation,
  mode,
  onFormatIdChange,
  onOrientationChange,
  onModeChange,
}: ResizePanelProps) {
  const [units, setUnits] = useState<ResizeUnit>('px');
  const [widthInput, setWidthInput] = useState('1080');
  const [heightInput, setHeightInput] = useState('1080');
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    setWidthInput(formatUnitValue(pxToUnit(widthPx, units), units));
    setHeightInput(formatUnitValue(pxToUnit(heightPx, units), units));
  }, [widthPx, heightPx, units]);

  const unitLabel = units === 'px' ? 'px' : units === 'cm' ? 'cm' : 'in';

  const parseAndApply = () => {
    const w = parseFloat(widthInput);
    const h = parseFloat(heightInput);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return;
    onApplyResize(unitToPx(w, units), unitToPx(h, units));
  };

  const applyPreset = (preset: ResizePresetResolved) => {
    onApplyResize(preset.widthPx, preset.heightPx);
    setUnits(preset.unit === 'in' || preset.unit === 'cm' ? preset.unit : 'px');
  };

  return (
    <div className="studio-resize-panel">
      <div className="studio-resize-magic-row">
        <span className="studio-resize-magic-label">
          Use magic resize
          <span
            className="studio-resize-help-wrap"
            onMouseEnter={() => setHelpOpen(true)}
            onMouseLeave={() => setHelpOpen(false)}
          >
            <button
              type="button"
              className="studio-resize-help-btn"
              aria-label="Magic resize help"
              aria-expanded={helpOpen}
              onClick={() => setHelpOpen((o) => !o)}
            >
              <IconHelp />
            </button>
            {helpOpen ? (
              <span className="studio-resize-help-tip" role="tooltip">
                Magic resize will automatically resize and move all elements on the canvas
              </span>
            ) : null}
          </span>
        </span>
        <label className="studio-toggle">
          <input
            type="checkbox"
            checked={magicResize}
            onChange={(e) => onMagicResizeChange(e.target.checked)}
            data-testid="magic-resize-toggle"
          />
          <span className="studio-toggle-track" aria-hidden />
        </label>
      </div>

      <label className="studio-field studio-resize-field">
        <span>Width ({unitLabel})</span>
        <input
          type="number"
          min={0.1}
          step={units === 'px' ? 1 : 0.1}
          value={widthInput}
          data-testid="resize-width"
          onChange={(e) => setWidthInput(e.target.value)}
        />
      </label>
      <label className="studio-field studio-resize-field">
        <span>Height ({unitLabel})</span>
        <input
          type="number"
          min={0.1}
          step={units === 'px' ? 1 : 0.1}
          value={heightInput}
          data-testid="resize-height"
          onChange={(e) => setHeightInput(e.target.value)}
        />
      </label>
      <label className="studio-field studio-resize-field">
        <span>Units</span>
        <select
          value={units}
          data-testid="resize-units"
          onChange={(e) => {
            const next = e.target.value as ResizeUnit;
            setWidthInput(formatUnitValue(pxToUnit(widthPx, next), next));
            setHeightInput(formatUnitValue(pxToUnit(heightPx, next), next));
            setUnits(next);
          }}
        >
          <option value="px">px</option>
          <option value="cm">cm</option>
          <option value="in">in</option>
        </select>
      </label>

      <button
        type="button"
        className="studio-resize-apply-btn"
        data-testid="resize-apply"
        onClick={parseAndApply}
      >
        Resize
      </button>

      <div className="studio-resize-presets">
        {RESIZE_CATEGORIES.map((cat) => (
          <section key={cat.id} className="studio-resize-category">
            <h3 className="studio-resize-category-title">
              <CategoryIcon id={cat.id} />
              {cat.label}
            </h3>
            <div className="studio-resize-preset-grid">
              {cat.presets.map((preset) => {
                const active = presetMatchesPage(preset, widthPx, heightPx);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`studio-resize-preset-btn${active ? ' active' : ''}`}
                    aria-pressed={active}
                    onClick={() => applyPreset(preset)}
                  >
                  <PresetIcon preset={preset} />
                  <span className="studio-resize-preset-label">{preset.label}</span>
                  <span className="studio-resize-preset-dims">{preset.dimensionLabel}</span>
                </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <details className="studio-resize-letterhead" open>
        <summary>Letterhead document</summary>
        <div className="studio-resize-letterhead-body">
          <label className="studio-field">
            <span>Page size</span>
            <select
              data-testid="page-format"
              value={formatId}
              onChange={(e) => onFormatIdChange(e.target.value as PageFormatId)}
            >
              {PAGE_FORMATS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <div className="studio-segmented" role="tablist" aria-label="Orientation">
            <button
              type="button"
              role="tab"
              data-testid="orientation-portrait"
              className={orientation === 'portrait' ? 'active' : ''}
              onClick={() => onOrientationChange('portrait')}
            >
              Portrait
            </button>
            <button
              type="button"
              role="tab"
              data-testid="orientation-landscape"
              className={orientation === 'landscape' ? 'active' : ''}
              onClick={() => onOrientationChange('landscape')}
            >
              Landscape
            </button>
          </div>
          <div className="studio-segmented" role="tablist" aria-label="Editor mode">
            <button
              type="button"
              role="tab"
              data-testid="mode-design"
              className={mode === 'design' ? 'active' : ''}
              onClick={() => onModeChange('design')}
            >
              Design
            </button>
            <button
              type="button"
              role="tab"
              data-testid="mode-use"
              className={mode === 'use' ? 'active' : ''}
              onClick={() => onModeChange('use')}
            >
              Use template
            </button>
          </div>
        </div>
      </details>
    </div>
  );
}
