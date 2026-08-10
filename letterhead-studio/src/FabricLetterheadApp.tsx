import { useState, useMemo, useEffect } from 'react';
import { StudioEditor } from './editor/StudioEditor';
import { useLetterheadCanvas } from './hooks/useLetterheadCanvas';
import {
  getFormatById,
  canvasPixelSize,
  EDITOR_DPI,
  type PageFormatId,
  type PageOrientation,
} from './lib/pageFormats';
import { removeFabricGuides } from './lib/guides';
import { addLogoFromFile } from './lib/logoUpload';
import { applyLetterheadTemplate } from './lib/applyLetterheadTemplate';
import type { LetterheadTemplateFile } from './lib/letterheadTemplate';
import { fetchStarterTemplate } from './lib/starterTemplates';
import { exportPdf, exportPng, exportTemplateJson } from './lib/export';

type TemplatePayload = LetterheadTemplateFile & {
  pageWidthPx?: number;
  pageHeightPx?: number;
};

export function FabricLetterheadApp() {
  const [formatId, setFormatId] = useState<PageFormatId>('a4');
  const [orientation, setOrientation] = useState<PageOrientation>('portrait');
  const [mode, setMode] = useState<'design' | 'use'>('design');
  const [templateName, setTemplateName] = useState('My letterhead');
  const [zoomPercent, setZoomPercent] = useState(100);
  const [magicResize, setMagicResize] = useState(true);
  const [pageSize, setPageSize] = useState(() =>
    canvasPixelSize(getFormatById('a4', 'portrait'), EDITOR_DPI),
  );

  const format = useMemo(
    () => getFormatById(formatId, orientation),
    [formatId, orientation],
  );

  const fitScale = useMemo(() => {
    const { width, height } = pageSize;
    const pad = 420;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const scale = Math.min((vw - pad) / width, (vh - 160) / height, 1);
    return Math.min(scale, 0.92);
  }, [pageSize]);

  const viewScale = fitScale * (zoomPercent / 100);

  const editor = useLetterheadCanvas(format, pageSize, mode, viewScale, magicResize);

  useEffect(() => {
    (
      window as Window & {
        __letterheadTemplateMeta?: {
          name: string;
          formatId: PageFormatId;
          orientation: PageOrientation;
        };
      }
    ).__letterheadTemplateMeta = {
      name: templateName,
      formatId,
      orientation,
    };
  }, [templateName, formatId, orientation]);

  const applyPageResize = (widthPx: number, heightPx: number) => {
    setPageSize({
      width: Math.max(1, Math.round(widthPx)),
      height: Math.max(1, Math.round(heightPx)),
    });
  };

  const onFormatIdChange = (id: PageFormatId) => {
    setFormatId(id);
    setPageSize(canvasPixelSize(getFormatById(id, orientation), EDITOR_DPI));
  };

  const onOrientationChange = (o: PageOrientation) => {
    setOrientation(o);
    setPageSize(canvasPixelSize(getFormatById(formatId, o), EDITOR_DPI));
  };

  const onUploadLogo = async (file: File) => {
    const canvas = editor.getCanvas();
    if (!canvas) return;
    await addLogoFromFile(canvas, file, format);
  };

  const onExportJson = () => {
    const canvas = editor.getCanvas();
    if (canvas) exportTemplateJson(canvas, format, templateName, pageSize);
  };

  const onExportPng = async () => {
    const canvas = editor.getCanvas();
    if (canvas) await exportPng(canvas, format, templateName, pageSize);
  };

  const onExportPdf = async () => {
    const canvas = editor.getCanvas();
    if (canvas) await exportPdf(canvas, format, templateName, pageSize);
  };

  const applyTemplate = async (parsed: TemplatePayload) => {
    const canvas = editor.getCanvas();
    if (!canvas) return;
    await applyLetterheadTemplate(canvas, parsed, (meta) => {
      if (meta.formatId) setFormatId(meta.formatId);
      if (meta.orientation) setOrientation(meta.orientation);
      if (meta.name) setTemplateName(meta.name);
    });
    if (parsed.pageWidthPx && parsed.pageHeightPx) {
      setPageSize({
        width: Math.round(parsed.pageWidthPx),
        height: Math.round(parsed.pageHeightPx),
      });
    } else {
      const fid = parsed.formatId ?? formatId;
      const orient = parsed.orientation ?? orientation;
      setPageSize(canvasPixelSize(getFormatById(fid, orient), EDITOR_DPI));
    }
    removeFabricGuides(canvas);
    canvas.requestRenderAll();
  };

  const onImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as TemplatePayload;
        await applyTemplate(parsed);
      } catch {
        alert('Could not load template JSON.');
      }
    };
    reader.readAsText(file);
  };

  const onLoadStarterTemplate = async (id: string) => {
    try {
      const parsed = (await fetchStarterTemplate(id)) as LetterheadTemplateFile;
      await applyTemplate(parsed);
    } catch {
      alert('Could not load starter template.');
    }
  };

  return (
    <StudioEditor
      format={format}
      formatId={formatId}
      orientation={orientation}
      mode={mode}
      templateName={templateName}
      viewScale={viewScale}
      zoomPercent={zoomPercent}
      pageSize={pageSize}
      magicResize={magicResize}
      editor={editor}
      onFormatIdChange={onFormatIdChange}
      onOrientationChange={onOrientationChange}
      onModeChange={setMode}
      onTemplateNameChange={setTemplateName}
      onZoomPercentChange={setZoomPercent}
      onMagicResizeChange={setMagicResize}
      onApplyPageResize={applyPageResize}
      onUploadLogo={onUploadLogo}
      onExportJson={onExportJson}
      onExportPng={onExportPng}
      onExportPdf={onExportPdf}
      onImportJson={onImportJson}
      onLoadStarterTemplate={onLoadStarterTemplate}
    />
  );
}
