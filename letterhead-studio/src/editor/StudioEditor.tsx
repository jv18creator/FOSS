import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from 'react';
import type { useLetterheadCanvas } from '../hooks/useLetterheadCanvas';
import {
  formatStageLabel,
  type PageFormat,
  type PageFormatId,
  type PageOrientation,
} from '../lib/pageFormats';
import { STUDIO_TOOLS, type StudioTool } from './studioTools';
import { TOOL_ICONS } from './StudioIcons';
import { SelectionPanel } from './SelectionPanel';
import { StudioTopBar } from './StudioTopBar';
import { TEXT_PRESETS, TEXT_STYLE_TEMPLATES, FONT_SHOWCASE } from './studioFonts';
import { LINE_STYLES, SHAPE_CATALOG } from './studioElements';
import { SOLID_BACKGROUNDS, GRADIENT_BACKGROUNDS } from './studioBackgrounds';
import { readStudioDragData } from './studioDragDrop';
import { StudioDragTile } from './StudioDragTile';
import { LayersPanel } from './LayersPanel';
import { IconChevronPanel, IconMoon, IconSun } from './StudioToolbarIcons';
import { useStudioTheme } from './useStudioTheme';
import { StudioEmptyState } from './StudioEmptyState';
import { IconEmptyLayers, IconEmptySearch, IconEmptyUpload, IconSearch } from './StudioPanelIcons';
import { STARTER_TEMPLATES } from '../lib/starterTemplates';
import { ResizePanel } from './ResizePanel';
import './studio-editor.css';

const TEXT_PRESET_DISPLAY = {
  header: { title: 'Header', meta: 'Large title text', sampleClass: 'is-header' },
  subheader: { title: 'Subheader', meta: 'Section heading', sampleClass: 'is-sub' },
  body: { title: 'Body', meta: 'Paragraph copy', sampleClass: 'is-body' },
} as const;

type EditorApi = ReturnType<typeof useLetterheadCanvas>;

export interface StudioEditorProps {
  format: PageFormat;
  formatId: PageFormatId;
  orientation: PageOrientation;
  mode: 'design' | 'use';
  templateName: string;
  viewScale: number;
  zoomPercent: number;
  pageSize: { width: number; height: number };
  magicResize: boolean;
  editor: EditorApi;
  onFormatIdChange: (id: PageFormatId) => void;
  onOrientationChange: (o: PageOrientation) => void;
  onModeChange: (mode: 'design' | 'use') => void;
  onTemplateNameChange: (name: string) => void;
  onZoomPercentChange: (n: number) => void;
  onMagicResizeChange: (value: boolean) => void;
  onApplyPageResize: (widthPx: number, heightPx: number) => void;
  onUploadLogo: (file: File) => void;
  onExportJson: () => void;
  onExportPng: () => void;
  onExportPdf: () => void;
  onImportJson: (file: File) => void;
  onLoadStarterTemplate: (id: string) => void | Promise<void>;
}

type UploadedAsset = {
  id: string;
  name: string;
  dataUrl: string;
};

const UPLOAD_ACCEPT = 'image/png,image/jpeg,image/jpg,image/webp,.png,.jpg,.jpeg,.webp';

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function StudioEditor({
  format,
  formatId,
  orientation,
  mode,
  templateName,
  viewScale,
  zoomPercent,
  pageSize,
  magicResize,
  editor,
  onFormatIdChange,
  onOrientationChange,
  onModeChange,
  onTemplateNameChange,
  onZoomPercentChange,
  onMagicResizeChange,
  onApplyPageResize,
  onUploadLogo: _onUploadLogo,
  onExportJson,
  onExportPng,
  onExportPdf,
  onImportJson,
  onLoadStarterTemplate,
}: StudioEditorProps) {
  const [activeTool, setActiveTool] = useState<StudioTool>('templates');
  const [activeStarterId, setActiveStarterId] = useState<string | null>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [drawMode, setDrawMode] = useState<'brush' | 'highlighter'>('brush');
  const [brushWidth, setBrushWidth] = useState(5);
  const [brushOpacity, setBrushOpacity] = useState(100);
  const [elementSearch, setElementSearch] = useState('');
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);
  const [canvasDragOver, setCanvasDragOver] = useState(false);

  const { theme, toggleTheme } = useStudioTheme();

  void editor.revision;

  const dropOnCanvas = useCallback(
    (clientX: number, clientY: number, dt: DataTransfer) => {
      const point = editor.clientToCanvas(clientX, clientY);
      if (!point) return;
      const payload = readStudioDragData(dt);
      if (!payload) return;
      if (payload.type === 'upload') {
        const asset = uploadedAssets.find((a) => a.id === payload.assetId);
        if (asset) {
          void editor.addImageFromDataUrl(asset.dataUrl, asset.name, point);
        }
        return;
      }
      editor.applyDragPayload(payload, point);
    },
    [editor, uploadedAssets],
  );

  const onCanvasDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setCanvasDragOver(true);
  };

  const onCanvasDrop = (e: DragEvent) => {
    e.preventDefault();
    setCanvasDragOver(false);
    dropOnCanvas(e.clientX, e.clientY, e.dataTransfer);
  };

  const ingestUploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const next: UploadedAsset[] = [];
    for (const file of Array.from(files)) {
      const ok =
        /^image\/(png|jpe?g|webp)$/i.test(file.type) ||
        /\.(png|jpe?g|webp)$/i.test(file.name);
      if (!ok) continue;
      const dataUrl = await readFileAsDataUrl(file);
      next.push({ id: crypto.randomUUID(), name: file.name, dataUrl });
    }
    if (next.length) setUploadedAssets((prev) => [...prev, ...next]);
  };

  const addUploadToCanvas = (asset: UploadedAsset) => {
    void editor.addImageFromDataUrl(asset.dataUrl, asset.name);
  };

  const selectTool = useCallback(
    (tool: StudioTool) => {
      setActiveTool(tool);
      if (tool === 'draw') {
        editor.setDrawingEnabled(true);
      } else {
        editor.setDrawingEnabled(false);
      }
    },
    [editor],
  );

  const editorRef = useRef(editor);
  editorRef.current = editor;

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      if (target.isContentEditable) return true;
      const tag = target.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      const mod = e.metaKey || e.ctrlKey;
      const ed = editorRef.current;

      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        ed.undo();
        return;
      }
      if (mod && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        ed.redo();
        return;
      }
      if (e.key === 'Delete' && mode !== 'use') {
        const selection = ed.activeSelection();
        if (selection.kind === 'none') return;
        e.preventDefault();
        ed.deleteSelected();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode]);

  useEffect(() => {
    if (activeTool !== 'draw') {
      editor.setDrawingEnabled(false);
    } else {
      editor.setDrawingEnabled(true);
      editor.setBrushWidth(brushWidth);
      if (drawMode === 'highlighter') {
        editor.setBrushColor('rgba(250, 204, 21, 0.45)');
      } else {
        editor.setBrushColor('#1e293b');
      }
    }
  }, [activeTool, drawMode, brushWidth, editor]);

  const frameW = editor.displayWidth * viewScale;
  const frameH = editor.displayHeight * viewScale;
  const layers = editor.layers();
  const pageBg = editor.getPageBackground();

  let panelBody: ReactNode = null;

  switch (activeTool) {
    case 'templates':
      panelBody = (
        <>
          <p className="studio-panel-section">Starter templates</p>
          <div className="studio-starter-list">
            {STARTER_TEMPLATES.map((starter) => (
              <button
                key={starter.id}
                type="button"
                data-testid={`starter-template-${starter.id}`}
                className={`studio-starter-card${activeStarterId === starter.id ? ' is-active' : ''}`}
                onClick={() => {
                  setActiveStarterId(starter.id);
                  void onLoadStarterTemplate(starter.id);
                }}
              >
                <span
                  className="studio-starter-preview"
                  style={{
                    background: starter.previewPage,
                    borderColor: starter.previewAccent,
                  }}
                  aria-hidden
                >
                  <span
                    className="studio-starter-preview-accent"
                    style={{ background: starter.previewAccent }}
                  />
                  <span className="studio-starter-preview-title">{starter.title}</span>
                </span>
                <span className="studio-starter-copy">
                  <span className="studio-starter-eyebrow">{starter.occasion}</span>
                  <span className="studio-starter-name">{starter.title}</span>
                  <span className="studio-starter-meta">
                    {starter.formatLabel} · {starter.description}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <div className="studio-panel-divider" />
          <p className="studio-panel-hint">
            Or start from a blank page. Build with Text and Elements, then save or load template
            JSON.
          </p>
          <label className="studio-field">
            <span>Template name</span>
            <input
              data-testid="template-name"
              value={templateName}
              onChange={(e) => onTemplateNameChange(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="studio-btn-secondary full"
            data-testid="export-json"
            onClick={onExportJson}
          >
            Save template JSON
          </button>
          <label className="studio-file-btn">
            Load template JSON
            <input
              type="file"
              accept="application/json,.json"
              data-testid="import-json"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImportJson(f);
                e.target.value = '';
              }}
            />
          </label>
        </>
      );
      break;
    case 'text':
      panelBody = (
        <>
          <div className="studio-text-preset-list">
            {TEXT_PRESETS.map((p) => {
              const display = TEXT_PRESET_DISPLAY[p.id];
              return (
                <StudioDragTile
                  key={p.id}
                  hideLabel
                  label={p.label}
                  testId={p.id === 'header' ? 'add-heading' : p.id === 'body' ? 'add-body' : undefined}
                  payload={{ type: 'text-preset', presetId: p.id }}
                  onActivate={() =>
                    editor.addTextPreset({
                      text: p.text,
                      fontSize: p.fontSize,
                      fontWeight: p.fontWeight,
                      fontFamily: p.fontFamily,
                      role: p.role,
                      label: p.label,
                    })
                  }
                  className="studio-text-preset studio-drag-tile"
                >
                  <div className={`studio-text-preset-inner ${display.sampleClass}`}>
                    <span className="studio-text-preset-sample" aria-hidden>
                      Ag
                    </span>
                    <span className="studio-text-preset-copy">
                      <span className="studio-text-preset-title">{display.title}</span>
                      <span className="studio-text-preset-meta">{display.meta}</span>
                    </span>
                  </div>
                </StudioDragTile>
              );
            })}
          </div>
          <p className="studio-panel-section">Text templates</p>
          <div className="studio-text-templates">
            {TEXT_STYLE_TEMPLATES.map((t) => (
              <StudioDragTile
                key={t.id}
                label={t.preview}
                payload={{ type: 'text-template', templateId: t.id }}
                onActivate={() => editor.addStyledTextTemplate(t)}
                className="studio-text-template-card studio-drag-tile"
              >
                <span style={{ fontFamily: t.fontFamily, color: t.fill, fontSize: '0.95rem' }}>
                  {t.preview}
                </span>
              </StudioDragTile>
            ))}
          </div>
          <p className="studio-panel-section">Fonts</p>
          <div className="studio-font-showcase-grid">
            {FONT_SHOWCASE.map((f) => (
              <StudioDragTile
                key={f.id}
                label={f.label}
                payload={{ type: 'text-template', templateId: f.id }}
                onActivate={() =>
                  editor.addStyledTextTemplate({
                    text: f.text,
                    fontFamily: f.fontFamily,
                    fontSize: f.fontSize,
                    fill: f.fill,
                    fontWeight: f.fontWeight,
                  })
                }
                className="studio-drag-tile studio-font-showcase-tile"
              >
                <span
                  className="studio-font-showcase-preview"
                  style={{ fontFamily: f.fontFamily, fontWeight: f.fontWeight ?? 'normal' }}
                >
                  {f.preview}
                </span>
              </StudioDragTile>
            ))}
          </div>
        </>
      );
      break;
    case 'elements': {
      const query = elementSearch.trim().toLowerCase();
      const filteredShapes = SHAPE_CATALOG.filter((s) =>
        query ? s.label.toLowerCase().includes(query) : true,
      );
      panelBody = (
        <>
          <div className="studio-search-field">
            <IconSearch className="studio-search-field-icon" />
            <input
              type="search"
              className="studio-search-field-input"
              placeholder="Search shapes..."
              value={elementSearch}
              onChange={(e) => setElementSearch(e.target.value)}
              aria-label="Search elements"
            />
          </div>
          <p className="studio-panel-section">Lines</p>
          <div className="studio-line-grid">
            {LINE_STYLES.map((line) => (
              <StudioDragTile
                key={line.id}
                label={line.label}
                testId={line.id === 'solid' ? 'add-line' : undefined}
                payload={{ type: 'line', style: line.id }}
                onActivate={() => editor.addLineStyled(line.id)}
                className="studio-line-tile studio-panel-tile studio-drag-tile"
              >
                <span className={`studio-line-preview line-${line.id}`} />
              </StudioDragTile>
            ))}
          </div>
          <p className="studio-panel-section">Shapes</p>
          {filteredShapes.length === 0 ? (
            <StudioEmptyState
              icon={<IconEmptySearch />}
              title="No shapes found"
              description="Try a different search term."
            />
          ) : (
            <div className="studio-element-grid">
              {filteredShapes.map((shape) => (
                <StudioDragTile
                  key={shape.id}
                  label={shape.label}
                  payload={{ type: 'shape', shapeId: shape.id }}
                  onActivate={() => editor.addElementShape(shape.id)}
                  className="studio-element-tile studio-panel-tile studio-drag-tile"
                >
                  <svg viewBox="0 0 24 24" aria-hidden dangerouslySetInnerHTML={{ __html: shape.preview }} />
                </StudioDragTile>
              ))}
            </div>
          )}
        </>
      );
      break;
    }
    case 'draw':
      panelBody = (
        <>
          <p className="studio-panel-section">Tool</p>
          <div className="studio-draw-modes studio-draw-modes-two">
            {(['brush', 'highlighter'] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={drawMode === m ? 'active' : ''}
                onClick={() => setDrawMode(m)}
              >
                {m === 'brush' ? 'Brush' : 'Highlighter'}
              </button>
            ))}
          </div>
          <label className="studio-field">
            <span>Stroke width</span>
            <div className="studio-range-row">
              <input
                type="range"
                className="studio-range"
                min={1}
                max={24}
                value={brushWidth}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setBrushWidth(v);
                  editor.setBrushWidth(v);
                }}
              />
              <input
                type="number"
                min={1}
                max={24}
                value={brushWidth}
                onChange={(e) => {
                  const v = Number(e.target.value) || 1;
                  setBrushWidth(v);
                  editor.setBrushWidth(v);
                }}
              />
            </div>
          </label>
          <label className="studio-field">
            <span>Color</span>
            <input
              type="color"
              defaultValue="#1e293b"
              onChange={(e) => editor.setBrushColor(e.target.value)}
            />
          </label>
          <label className="studio-field">
            <span>Opacity</span>
            <div className="studio-range-row">
              <input
                type="range"
                className="studio-range"
                min={10}
                max={100}
                value={brushOpacity}
                onChange={(e) => setBrushOpacity(Number(e.target.value))}
              />
              <span className="studio-range-value">{brushOpacity}%</span>
            </div>
          </label>
        </>
      );
      break;
    case 'upload':
      panelBody = (
        <>
          <div className="studio-panel-stack">
            <p className="studio-panel-hint studio-panel-hint-tight">
              PNG, JPG, JPEG, or WebP. Drag onto the canvas or click a tile to insert.
            </p>
            <label className="studio-add-file-btn">
              <span>+ Add file</span>
              <input
                type="file"
                accept={UPLOAD_ACCEPT}
                multiple
                data-testid="upload-logo"
                onChange={(e) => {
                  void ingestUploadFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
          {uploadedAssets.length > 0 ? (
            <div className="studio-upload-grid">
              {uploadedAssets.map((asset, index) => (
                <StudioDragTile
                  key={asset.id}
                  label={asset.name}
                  testId={index === 0 ? 'upload-asset' : undefined}
                  payload={{ type: 'upload', assetId: asset.id }}
                  onActivate={() => addUploadToCanvas(asset)}
                  className="studio-upload-tile"
                >
                  <img src={asset.dataUrl} alt="" className="studio-upload-thumb" />
                </StudioDragTile>
              ))}
            </div>
          ) : (
            <div className="studio-panel-empty-host studio-panel-empty-host--grow">
              <StudioEmptyState
                icon={<IconEmptyUpload />}
                title="No files yet"
                description="Add PNG, JPG, or WebP assets to use on your letterhead."
              />
            </div>
          )}
        </>
      );
      break;
    case 'background':
      panelBody = (
        <>
          <p className="studio-panel-section">Solid colors</p>
          <div className="studio-bg-mosaic studio-bg-mosaic-solids">
            {SOLID_BACKGROUNDS.map((bg) => (
              <StudioDragTile
                key={bg.id}
                hideLabel
                label={bg.label}
                payload={{ type: 'background-solid', color: bg.color }}
                onActivate={() => editor.setPageBackground(bg.color)}
                className="studio-bg-chip studio-drag-tile"
              >
                <span className="studio-bg-chip-fill" style={{ background: bg.color }} />
                <span className="studio-bg-chip-label">{bg.label}</span>
              </StudioDragTile>
            ))}
          </div>
          <p className="studio-panel-section">Gradients</p>
          <div className="studio-bg-mosaic studio-bg-mosaic-gradients">
            {GRADIENT_BACKGROUNDS.map((bg) => (
              <StudioDragTile
                key={bg.id}
                hideLabel
                label={bg.label}
                payload={{ type: 'background-gradient', gradientId: bg.id }}
                onActivate={() => editor.setPageBackgroundGradient(bg.id)}
                className="studio-bg-chip studio-bg-chip-wide studio-drag-tile"
              >
                <span className="studio-bg-chip-fill" style={{ background: bg.preview }} />
                <span className="studio-bg-chip-label">{bg.label}</span>
              </StudioDragTile>
            ))}
          </div>
        </>
      );
      break;
    case 'layers':
      panelBody =
        layers.length === 0 ? (
          <ul className="studio-layer-list polotno studio-layer-list-fill" data-testid="layer-list">
            <li className="studio-layer-empty studio-panel-empty-host studio-panel-empty-host--grow">
              <StudioEmptyState
                icon={<IconEmptyLayers />}
                title="No layers yet"
                description="Add text, shapes, or images to build your page."
              />
            </li>
          </ul>
        ) : (
          <>
            <p className="studio-panel-hint studio-panel-hint-tight">On the active page</p>
            <LayersPanel layers={layers} editor={editor} />
            <div className="studio-panel-divider" />
            <SelectionPanel
              mode={mode}
              activeMeta={editor.activeMeta()}
              onDelete={editor.deleteSelected}
              onBringForward={editor.bringForward}
              onSendBackward={editor.sendBackward}
              onMetaChange={editor.updateSelectedMeta}
              onTextChange={editor.updateSelectedText}
            />
          </>
        );
      break;
    case 'resize':
      panelBody = (
        <ResizePanel
          widthPx={pageSize.width}
          heightPx={pageSize.height}
          magicResize={magicResize}
          onMagicResizeChange={onMagicResizeChange}
          onApplyResize={onApplyPageResize}
          formatId={formatId}
          orientation={orientation}
          mode={mode}
          onFormatIdChange={onFormatIdChange}
          onOrientationChange={onOrientationChange}
          onModeChange={onModeChange}
        />
      );
      break;
  }

  return (
    <div
      className={`studio-root${panelOpen ? '' : ' studio-panel-collapsed'}`}
      data-theme={theme}
      data-testid="toolbar"
    >
      <h1 className="studio-sr-only">Letterhead Studio</h1>

      <nav className="studio-rail" aria-label="Editor tools">
        {STUDIO_TOOLS.map((tool) => {
          const Icon = TOOL_ICONS[tool.id];
          const active = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              className={`studio-rail-btn${active ? ' active' : ''}`}
              aria-current={active ? 'page' : undefined}
              aria-label={tool.label}
              title={tool.label}
              onClick={() => selectTool(tool.id)}
            >
              <Icon className="studio-rail-icon" />
              <span className="studio-rail-label">{tool.label}</span>
            </button>
          );
        })}
        <div className="studio-rail-footer">
          <button
            type="button"
            className="studio-rail-theme-btn"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={theme === 'light' ? 'Dark mode' : 'Light mode'}
            onClick={toggleTheme}
          >
            {theme === 'light' ? (
              <IconMoon className="studio-rail-icon" />
            ) : (
              <IconSun className="studio-rail-icon" />
            )}
            <span className="studio-rail-label">{theme === 'light' ? 'Dark' : 'Light'}</span>
          </button>
        </div>
      </nav>

      <aside className="studio-panel-wrap">
        <button
          type="button"
          className={`studio-panel-collapse${panelOpen ? '' : ' is-collapsed'}`}
          aria-label={panelOpen ? 'Collapse panel' : 'Expand panel'}
          onClick={() => setPanelOpen((o) => !o)}
        >
          <span className="studio-panel-chevron">
            <IconChevronPanel />
          </span>
        </button>
        <aside className="studio-panel" aria-label={`${activeTool} options`}>
          <header className="studio-panel-chrome">
            <h2 className="studio-panel-title">
              {STUDIO_TOOLS.find((t) => t.id === activeTool)?.label}
            </h2>
          </header>
          <div className="studio-panel-body">{panelBody}</div>
        </aside>
      </aside>

      <div className="studio-workspace">
        <StudioTopBar
          templateName={templateName}
          mode={mode}
          editor={editor}
          pageBackground={pageBg}
          downloadOpen={downloadOpen}
          onDownloadToggle={() => setDownloadOpen((o) => !o)}
          onExportPng={() => {
            setDownloadOpen(false);
            onExportPng();
          }}
          onExportPdf={() => {
            setDownloadOpen(false);
            onExportPdf();
          }}
        />

        <main className="studio-stage" data-testid="canvas-stage">
          <span className="studio-sr-only" data-testid="stage-format-label">
            {formatStageLabel(format)}
          </span>
          <span className="studio-sr-only" data-testid="stage-dimensions">
            {format.widthMm} × {format.heightMm} mm
          </span>
          <div
            className={`studio-canvas-frame canvas-frame${canvasDragOver ? ' studio-canvas-drop-target' : ''}`}
            ref={editor.containerRef}
            style={{ width: frameW, height: frameH }}
            onDragOver={onCanvasDragOver}
            onDragLeave={() => setCanvasDragOver(false)}
            onDrop={onCanvasDrop}
          >
            <canvas ref={editor.canvasElRef} data-testid="letterhead-canvas" />
          </div>
        </main>

        <footer className="studio-footer">
          <button type="button" className="studio-pages-btn">
            Pages
          </button>
          <div className="studio-zoom">
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => onZoomPercentChange(Math.max(25, zoomPercent - 10))}
            >
              −
            </button>
            <span>{Math.round(zoomPercent)}%</span>
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => onZoomPercentChange(Math.min(200, zoomPercent + 10))}
            >
              +
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
