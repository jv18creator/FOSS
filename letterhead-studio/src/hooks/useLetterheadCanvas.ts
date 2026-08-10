import { useEffect, useRef, useCallback, useState } from 'react';
import {
  Canvas,
  Circle,
  FabricImage,
  FabricText,
  Gradient,
  Line,
  Path,
  PencilBrush,
  Polygon,
  Rect,
  Triangle,
  loadSVGFromString,
  util,
  type FabricObject,
} from 'fabric';
import { GRADIENT_BACKGROUNDS } from '../editor/studioBackgrounds';
import type { StudioDragPayload } from '../editor/studioDragDrop';
import {
  getShapeById,
  type LineStyleId,
  type PrimitiveShapeKind,
} from '../editor/studioElements';
import { TEXT_PRESETS, TEXT_STYLE_TEMPLATES, FONT_SHOWCASE } from '../editor/studioFonts';
import type { PageFormat } from '../lib/pageFormats';
import {
  EDITOR_DPI,
  mmToPx,
  SAFE_MARGIN_MM,
} from '../lib/pageFormats';
import { removeFabricGuides } from '../lib/guides';
import {
  syncCanvasViewport,
  displayScale,
} from '../lib/canvasViewport';
import { rescaleObjectsForPageResize } from '../lib/rescaleObjects';
import { clampObjectToPage } from '../lib/pageBounds';
import { centerObjectAt } from '../lib/objectLayout';
import { normalizeLetterheadLayout } from '../lib/normalizeLetterheadLayout';
import {
  applyLockState,
  applyUseMode,
  getMeta,
  setMeta,
  isGuide,
} from '../lib/fabricMeta';
import '../lib/fabricSetup';

export type EditorMode = 'design' | 'use';

export type ActiveSelectionState =
  | { kind: 'none' }
  | {
      kind: 'text' | 'image' | 'shape' | 'line' | 'draw' | 'other';
      fill?: string;
      fontFamily?: string;
      fontSize?: number;
      opacity?: number;
      locked?: boolean;
      placeholder?: boolean;
    };

export function useLetterheadCanvas(
  format: PageFormat,
  pageSize: { width: number; height: number },
  mode: EditorMode,
  viewScale: number,
  magicResize: boolean,
) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const historyLockRef = useRef(false);
  const layerHoverOpacityRef = useRef(new WeakMap<FabricObject, number>());
  const [revision, setRevision] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [drawingEnabled, setDrawingEnabledState] = useState(false);
  const [pageBgColor, setPageBgColor] = useState('#ffffff');

  type CanvasPoint = { left: number; top: number };

  const clientToCanvas = useCallback((clientX: number, clientY: number): CanvasPoint | null => {
    const canvas = fabricRef.current;
    if (!canvas) return null;
    canvas.calcOffset();
    const point = canvas.getScenePoint({
      clientX,
      clientY,
    } as MouseEvent);
    return { left: point.x, top: point.y };
  }, []);

  const defaultDropPoint = (): CanvasPoint => ({
    left: mmToPx(30, EDITOR_DPI),
    top: mmToPx(50, EDITOR_DPI),
  });

  const bump = useCallback(() => setRevision((r) => r + 1), []);

  const syncHistoryFlags = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const pushHistory = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || historyLockRef.current) return;
    const snap = JSON.stringify(canvas.toJSON());
    const idx = historyIndexRef.current;
    historyRef.current = historyRef.current.slice(0, idx + 1);
    historyRef.current.push(snap);
    historyIndexRef.current = historyRef.current.length - 1;
    syncHistoryFlags();
  }, [syncHistoryFlags]);

  const applyHistory = useCallback(
    async (index: number) => {
      const canvas = fabricRef.current;
      const snap = historyRef.current[index];
      if (!canvas || !snap) return;
      historyLockRef.current = true;
      await canvas.loadFromJSON(snap);
      removeFabricGuides(canvas);
      normalizeLetterheadLayout(canvas);
      historyIndexRef.current = index;
      syncHistoryFlags();
      historyLockRef.current = false;
      canvas.requestRenderAll();
      bump();
    },
    [bump, syncHistoryFlags],
  );

  const { width, height } = pageSize;
  const magicResizeRef = useRef(magicResize);

  useEffect(() => {
    magicResizeRef.current = magicResize;
  }, [magicResize]);

  const sizeRef = useRef({ width, height });
  const pageRef = useRef({ width, height });
  const formatRef = useRef(format);
  const editorBridgeRef = useRef<{
    pushHistory: () => void;
    selectObject: (index: number) => void;
  }>({
    pushHistory: () => {},
    selectObject: () => {},
  });

  useEffect(() => {
    formatRef.current = format;
  }, [format]);

  useEffect(() => {
    pageRef.current = { width, height };
  }, [width, height]);

  useEffect(() => {
    if (!canvasElRef.current) return;
    const canvas = new Canvas(canvasElRef.current, {
      width,
      height,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: mode === 'design',
    });
    fabricRef.current = canvas;
    sizeRef.current = { width, height };
    syncCanvasViewport(canvas, width, height, viewScale);

    const onChange = () => {
      bump();
      pushHistory();
    };
    canvas.on('object:added', onChange);
    canvas.on('object:removed', onChange);
    canvas.on('object:modified', (e: { target?: FabricObject }) => {
      const obj = e.target;
      if (obj && !isGuide(obj)) {
        clampObjectToPage(obj, pageRef.current.width, pageRef.current.height);
      }
      onChange();
    });
    canvas.on('path:created', (e) => {
      const path = e.path;
      if (path) {
        setMeta(path, {
          role: 'draw',
          locked: false,
          placeholder: false,
          label: 'Drawing',
        });
      }
      bump();
      pushHistory();
    });
    canvas.on('selection:created', () => bump());
    canvas.on('selection:updated', () => bump());
    canvas.on('selection:cleared', () => bump());

    removeFabricGuides(canvas);
    historyRef.current = [JSON.stringify(canvas.toJSON())];
    historyIndexRef.current = 0;
    syncHistoryFlags();

    if (typeof window !== 'undefined') {
      (
        window as Window & {
          __letterheadEditor?: {
            getCounts: () => {
              total: number;
              content: number;
              guides: number;
            } | null;
            getCanvasPixelSize: () => { width: number; height: number };
            isGuideVisible: () => boolean;
            getActiveType: () => string | null;
            moveActive: (left: number, top: number) => boolean;
            moveActiveClamped: (left: number, top: number) => boolean;
            getActivePosition: () => { left: number; top: number } | null;
            getStackRoles: () => string[];
            getLogoWidthPx: () => number | null;
            getViewportZoom: () => number;
            selectContentIndex: (index: number) => void;
            transformActive: (patch: {
              left?: number;
              top?: number;
              width?: number;
              height?: number;
              fill?: string;
              stroke?: string;
              strokeWidth?: number;
              opacity?: number;
              fontSize?: number;
              fontFamily?: string;
              line?: { x1: number; y1: number; x2: number; y2: number };
              sendToBack?: boolean;
            }) => boolean;
            exportPayload: () => object | null;
          };
        }
      ).__letterheadEditor = {
        getCounts: () => {
          const c = fabricRef.current;
          if (!c) return null;
          const objs = c.getObjects();
          return {
            total: objs.length,
            content: objs.filter((o) => !isGuide(o)).length,
            guides: objs.filter((o) => isGuide(o)).length,
          };
        },
        getCanvasPixelSize: () => ({ ...sizeRef.current }),
        isGuideVisible: () => false,
        getActiveType: () => {
          const a = fabricRef.current?.getActiveObject();
          return a ? a.type : null;
        },
        moveActive: (left: number, top: number) => {
          const c = fabricRef.current;
          const obj = c?.getActiveObject();
          if (!c || !obj || isGuide(obj)) return false;
          obj.set({ left, top });
          obj.setCoords();
          c.requestRenderAll();
          return true;
        },
        moveActiveClamped: (left: number, top: number) => {
          const c = fabricRef.current;
          const obj = c?.getActiveObject();
          if (!c || !obj || isGuide(obj)) return false;
          obj.set({ left, top });
          clampObjectToPage(obj, pageRef.current.width, pageRef.current.height);
          c.requestRenderAll();
          return true;
        },
        getActivePosition: () => {
          const obj = fabricRef.current?.getActiveObject();
          if (!obj || isGuide(obj)) return null;
          return { left: obj.left ?? 0, top: obj.top ?? 0 };
        },
        getStackRoles: () => {
          const c = fabricRef.current;
          if (!c) return [];
          return c.getObjects().map((o) => getMeta(o)?.role ?? o.type ?? '?');
        },
        getLogoWidthPx: () => {
          const c = fabricRef.current;
          if (!c) return null;
          const logo = c
            .getObjects()
            .find((o) => {
              const meta = getMeta(o);
              if (!meta) return false;
              if (meta.role === 'logo') return true;
              return (
                meta.role === 'image' &&
                /\.(png|jpe?g|webp)$/i.test(meta.label ?? '')
              );
            });
          if (!logo) return null;
          const w = (logo.width ?? 0) * (logo.scaleX ?? 1);
          return w;
        },
        getViewportZoom: () => {
          const c = fabricRef.current;
          if (!c) return 1;
          return displayScale(c);
        },
        selectContentIndex: (index: number) => {
          editorBridgeRef.current.selectObject(index);
        },
        transformActive: (patch: {
          left?: number;
          top?: number;
          width?: number;
          height?: number;
          fill?: string;
          stroke?: string;
          strokeWidth?: number;
          opacity?: number;
          fontSize?: number;
          fontFamily?: string;
          line?: { x1: number; y1: number; x2: number; y2: number };
          sendToBack?: boolean;
        }) => {
          const c = fabricRef.current;
          const obj = c?.getActiveObject();
          if (!c || !obj || isGuide(obj)) return false;
          if (patch.left !== undefined || patch.top !== undefined) {
            if (obj instanceof FabricText || obj instanceof FabricImage || obj instanceof Rect) {
              obj.set({ originX: 'left', originY: 'top' });
            }
          }
          if (patch.left !== undefined) obj.set({ left: patch.left });
          if (patch.top !== undefined) obj.set({ top: patch.top });
          if (obj instanceof Rect) {
            obj.set({ originX: 'left', originY: 'top' });
            if (patch.width !== undefined) obj.set({ width: patch.width, scaleX: 1 });
            if (patch.height !== undefined) obj.set({ height: patch.height, scaleY: 1 });
          } else if (obj instanceof FabricImage && patch.width !== undefined && patch.height !== undefined) {
            obj.set({ originX: 'left', originY: 'top' });
            const iw = obj.width ?? 1;
            const ih = obj.height ?? 1;
            const scale = Math.max(patch.width / iw, patch.height / ih);
            obj.set({
              scaleX: scale,
              scaleY: scale,
              cropX: 0,
              cropY: 0,
            });
            if (patch.left !== undefined) obj.set({ left: patch.left });
            if (patch.top !== undefined) obj.set({ top: patch.top });
          } else if (obj instanceof Circle && patch.width !== undefined) {
            obj.set({ radius: patch.width / 2, scaleX: 1, scaleY: 1 });
          } else if (patch.width !== undefined && patch.height !== undefined) {
            const baseW = obj.width ?? obj.getScaledWidth();
            const baseH = obj.height ?? obj.getScaledHeight();
            if (baseW > 0 && baseH > 0) {
              obj.set({
                scaleX: patch.width / baseW,
                scaleY: patch.height / baseH,
              });
            }
          }
          if (patch.stroke !== undefined) {
            if (obj instanceof Line || obj instanceof Path) {
              obj.set({ stroke: patch.stroke });
            } else if ('stroke' in obj) {
              obj.set({ stroke: patch.stroke });
            }
          }
          if (patch.strokeWidth !== undefined && (obj instanceof Line || obj instanceof Path)) {
            obj.set({ strokeWidth: patch.strokeWidth });
          }
          if (patch.fill !== undefined) {
            if (obj instanceof FabricText) obj.set({ fill: patch.fill });
            else if (obj instanceof Line || obj instanceof Path) obj.set({ stroke: patch.fill });
            else obj.set({ fill: patch.fill });
          }
          if (patch.opacity !== undefined) obj.set({ opacity: patch.opacity });
          if (patch.fontSize !== undefined && obj instanceof FabricText) {
            obj.set({ fontSize: patch.fontSize });
          }
          if (patch.fontFamily !== undefined && obj instanceof FabricText) {
            obj.set({ fontFamily: patch.fontFamily });
          }
          if (patch.line && obj instanceof Line) {
            obj.set({
              x1: patch.line.x1,
              y1: patch.line.y1,
              x2: patch.line.x2,
              y2: patch.line.y2,
            });
          }
          obj.setCoords();
          clampObjectToPage(obj, pageRef.current.width, pageRef.current.height);
          if (patch.sendToBack) {
            c.sendObjectToBack(obj);
            const guide = c.getObjects().find((o) => isGuide(o));
            if (guide) c.sendObjectToBack(guide);
          }
          c.requestRenderAll();
          editorBridgeRef.current.pushHistory();
          return true;
        },
        exportPayload: () => {
          const c = fabricRef.current;
          const meta = (
            window as Window & {
              __letterheadTemplateMeta?: {
                name: string;
                formatId: string;
                orientation: string;
              };
            }
          ).__letterheadTemplateMeta;
          if (!c || !meta) return null;
          return {
            version: 1,
            name: meta.name,
            formatId: meta.formatId,
            orientation: meta.orientation,
            editorDpi: EDITOR_DPI,
            canvas: c.toJSON(),
          };
        },
      };
    }

    return () => {
      const w = window as Window & { __letterheadEditor?: unknown };
      delete w.__letterheadEditor;
      canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once
  }, []);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const prev = sizeRef.current;
    if (prev.width !== width || prev.height !== height) {
      if (
        magicResizeRef.current &&
        prev.width > 0 &&
        prev.height > 0 &&
        (prev.width !== width || prev.height !== height)
      ) {
        const sx = width / prev.width;
        const sy = height / prev.height;
        rescaleObjectsForPageResize(canvas.getObjects(), sx, sy);
      }
      sizeRef.current = { width, height };
    }
    removeFabricGuides(canvas);
    syncCanvasViewport(canvas, width, height, viewScale);
    canvas.requestRenderAll();
    bump();
  }, [width, height, viewScale, bump]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !containerRef.current) return;
    const ro = new ResizeObserver(() => {
      canvas.calcOffset();
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.getObjects().forEach((obj) => {
      if (isGuide(obj)) return;
      applyUseMode(obj, mode === 'use');
      if (mode === 'design') applyLockState(obj);
    });
    canvas.selection = mode === 'design';
    canvas.requestRenderAll();
  }, [mode, revision]);

  const getCanvas = () => fabricRef.current;

  const setDrawingEnabled = (enabled: boolean) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    setDrawingEnabledState(enabled);
    if (enabled) {
      const brush = new PencilBrush(canvas);
      brush.width = 3;
      brush.color = '#1e293b';
      canvas.freeDrawingBrush = brush;
      canvas.isDrawingMode = true;
      canvas.discardActiveObject();
      canvas.selection = false;
    } else {
      canvas.isDrawingMode = false;
      canvas.selection = mode === 'design';
    }
    canvas.requestRenderAll();
  };

  const setBrushWidth = (width: number) => {
    const canvas = fabricRef.current;
    if (canvas?.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = width;
    }
  };

  const setBrushColor = (color: string) => {
    const canvas = fabricRef.current;
    if (canvas?.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
    }
  };

  const setPageBackground = (color: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.backgroundColor = color;
    setPageBgColor(color);
    canvas.requestRenderAll();
    pushHistory();
    bump();
  };

  const setPageBackgroundGradient = (gradientId: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const def = GRADIENT_BACKGROUNDS.find((g) => g.id === gradientId);
    if (!def) return;
    const w = canvas.getWidth();
    const h = canvas.getHeight();
    const angle = ((def.angleDeg ?? 135) * Math.PI) / 180;
    const x2 = w * Math.cos(angle);
    const y2 = h * Math.sin(angle);
    canvas.backgroundColor = new Gradient({
      type: 'linear',
      coords: { x1: 0, y1: 0, x2, y2 },
      colorStops: def.colorStops,
    });
    setPageBgColor(def.colorStops[0]?.color ?? '#ffffff');
    canvas.requestRenderAll();
    pushHistory();
    bump();
  };

  const addShape = (kind: PrimitiveShapeKind, at?: CanvasPoint) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const m = (mm: number) => mmToPx(mm, EDITOR_DPI);
    const anchor = at ?? defaultDropPoint();
    let obj: FabricObject;
    if (kind === 'rect') {
      obj = new Rect({
        left: 0,
        top: 0,
        width: m(40),
        height: m(25),
        fill: '#cbd5e1',
        stroke: '#64748b',
        strokeWidth: 1,
      });
    } else if (kind === 'circle') {
      obj = new Circle({
        left: 0,
        top: 0,
        radius: m(12),
        fill: '#cbd5e1',
        stroke: '#64748b',
        strokeWidth: 1,
      });
    } else if (kind === 'star') {
      const points = [
        { x: 0, y: -m(14) },
        { x: m(4), y: -m(4) },
        { x: m(14), y: -m(3) },
        { x: m(6), y: m(5) },
        { x: m(9), y: m(15) },
        { x: 0, y: m(9) },
        { x: -m(9), y: m(15) },
        { x: -m(6), y: m(5) },
        { x: -m(14), y: -m(3) },
        { x: -m(4), y: -m(4) },
      ];
      obj = new Polygon(points, {
        left: 0,
        top: 0,
        fill: '#cbd5e1',
        stroke: '#64748b',
        strokeWidth: 1,
      });
    } else if (kind === 'diamond') {
      obj = new Polygon(
        [
          { x: 0, y: -m(14) },
          { x: m(12), y: 0 },
          { x: 0, y: m(14) },
          { x: -m(12), y: 0 },
        ],
        {
          left: 0,
          top: 0,
          fill: '#cbd5e1',
          stroke: '#64748b',
          strokeWidth: 1,
        },
      );
    } else if (kind === 'pentagon') {
      const r = m(14);
      const pts = Array.from({ length: 5 }, (_, i) => {
        const a = (-Math.PI / 2) + (i * 2 * Math.PI) / 5;
        return { x: r * Math.cos(a), y: r * Math.sin(a) };
      });
      obj = new Polygon(pts, {
        left: 0,
        top: 0,
        fill: '#cbd5e1',
        stroke: '#64748b',
        strokeWidth: 1,
      });
    } else if (kind === 'hexagon') {
      const r = m(14);
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (i * 2 * Math.PI) / 6;
        return { x: r * Math.cos(a), y: r * Math.sin(a) };
      });
      obj = new Polygon(pts, {
        left: 0,
        top: 0,
        fill: '#cbd5e1',
        stroke: '#64748b',
        strokeWidth: 1,
      });
    } else if (kind === 'right-triangle') {
      obj = new Polygon(
        [
          { x: 0, y: 0 },
          { x: m(24), y: 0 },
          { x: 0, y: m(24) },
        ],
        {
          left: 0,
          top: 0,
          fill: '#cbd5e1',
          stroke: '#64748b',
          strokeWidth: 1,
        },
      );
    } else if (kind === 'parallelogram') {
      obj = new Polygon(
        [
          { x: m(6), y: 0 },
          { x: m(30), y: 0 },
          { x: m(24), y: m(20) },
          { x: 0, y: m(20) },
        ],
        {
          left: 0,
          top: 0,
          fill: '#cbd5e1',
          stroke: '#64748b',
          strokeWidth: 1,
        },
      );
    } else {
      obj = new Triangle({
        left: 0,
        top: 0,
        width: m(30),
        height: m(26),
        fill: '#cbd5e1',
        stroke: '#64748b',
        strokeWidth: 1,
      });
    }
    centerObjectAt(obj, anchor);
    setMeta(obj, {
      role: 'shape',
      locked: false,
      placeholder: false,
      label: kind,
    });
    canvas.add(obj);
    clampObjectToPage(obj, width, height);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
  };

  const addElementShape = (shapeId: string, at?: CanvasPoint) => {
    const entry = getShapeById(shapeId);
    if (!entry) return;
    if (entry.kind === 'primitive') {
      addShape(entry.primitive, at);
      return;
    }
    void addSvgAsset(entry.markup, entry.label, at);
  };

  const duplicateSelected = async () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !obj || isGuide(obj)) return;
    const clone = await obj.clone();
    clone.set({
      left: (obj.left ?? 0) + 12,
      top: (obj.top ?? 0) + 12,
    });
    const meta = getMeta(obj);
    if (meta) setMeta(clone, { ...meta, fieldId: `${meta.fieldId ?? 'dup'}_${Date.now()}` });
    canvas.add(clone);
    canvas.setActiveObject(clone);
    canvas.requestRenderAll();
  };

  const toggleLockSelected = () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !obj || isGuide(obj)) return;
    const meta = getMeta(obj);
    updateSelectedMeta({ locked: !meta?.locked });
  };

  const undo = () => {
    if (historyIndexRef.current <= 0) return;
    void applyHistory(historyIndexRef.current - 1);
  };

  const redo = () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    void applyHistory(historyIndexRef.current + 1);
  };

  const addHeading = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const m = (mm: number) => mmToPx(mm, EDITOR_DPI);
    const text = new FabricText('Company name', {
      left: m(SAFE_MARGIN_MM),
      top: m(20),
      originX: 'left',
      originY: 'top',
      fontFamily: 'Georgia, serif',
      fontSize: 24,
      fill: '#0f172a',
      fontWeight: 'bold',
    });
    setMeta(text, {
      role: 'heading',
      locked: false,
      placeholder: true,
      fieldId: `heading_${Date.now()}`,
      label: 'Heading',
    });
    canvas.add(text);
    clampObjectToPage(text, width, height);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  };

  const addBody = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const m = (mm: number) => mmToPx(mm, EDITOR_DPI);
    const text = new FabricText('Address line\nCity, ZIP  •  phone@email', {
      left: m(SAFE_MARGIN_MM),
      top: m(40),
      originX: 'left',
      originY: 'top',
      fontFamily: 'system-ui, sans-serif',
      fontSize: 11,
      fill: '#475569',
      lineHeight: 1.35,
    });
    setMeta(text, {
      role: 'body',
      locked: false,
      placeholder: true,
      fieldId: `body_${Date.now()}`,
      label: 'Body text',
    });
    canvas.add(text);
    clampObjectToPage(text, width, height);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  };

  const addDivider = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const m = (mm: number) => mmToPx(mm, EDITOR_DPI);
    const pw = pageRef.current.width;
    const line = new Line([m(SAFE_MARGIN_MM), m(35), pw - m(SAFE_MARGIN_MM), m(35)], {
      stroke: '#cbd5e1',
      strokeWidth: 1,
    });
    setMeta(line, { role: 'line', locked: false, placeholder: false, label: 'Line' });
    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.requestRenderAll();
  };

  const addBand = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const m = (mm: number) => mmToPx(mm, EDITOR_DPI);
    const rect = new Rect({
      left: 0,
      top: 0,
      width: pageRef.current.width,
      height: m(22),
      fill: '#1e293b',
    });
    setMeta(rect, { role: 'shape', locked: true, placeholder: false, label: 'Header band' });
    canvas.add(rect);
    canvas.sendObjectToBack(rect);
    const guide = canvas.getObjects().find((o) => isGuide(o));
    if (guide) canvas.sendObjectToBack(guide);
    canvas.setActiveObject(rect);
    canvas.requestRenderAll();
  };

  const deleteSelected = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    active.forEach((obj) => {
      if (!isGuide(obj)) canvas.remove(obj);
    });
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  };

  const updateSelectedMeta = (patch: {
    locked?: boolean;
    placeholder?: boolean;
    label?: string;
  }) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj || isGuide(obj)) return;
    setMeta(obj, patch);
    applyLockState(obj);
    applyUseMode(obj, mode === 'use');
    canvas.requestRenderAll();
    bump();
  };

  const updateSelectedText = (value: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj && obj instanceof FabricText) {
      obj.set({ text: value });
      canvas.requestRenderAll();
      bump();
    }
  };

  const bringForward = () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (canvas && obj && !isGuide(obj)) {
      canvas.bringObjectForward(obj);
      canvas.requestRenderAll();
      bump();
    }
  };

  const sendBackward = () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (canvas && obj && !isGuide(obj)) {
      canvas.sendObjectBackwards(obj);
      const guide = canvas.getObjects().find((o) => isGuide(o));
      if (guide) canvas.sendObjectToBack(guide);
      canvas.requestRenderAll();
      bump();
    }
  };

  const selectObject = (index: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const objects = canvas.getObjects().filter((o) => !isGuide(o));
    const obj = objects[index];
    if (!obj) return;
    if (mode === 'use') {
      const meta = getMeta(obj);
      if (!meta?.placeholder) {
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        bump();
        return;
      }
    }
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    bump();
  };

  const layers = () => {
    const canvas = fabricRef.current;
    if (!canvas) return [];
    return canvas
      .getObjects()
      .filter((o) => !isGuide(o))
      .map((o, i) => ({
        index: i,
        label: getMeta(o)?.label ?? o.type ?? 'Object',
        role: getMeta(o)?.role ?? 'body',
        locked: getMeta(o)?.locked ?? false,
        placeholder: getMeta(o)?.placeholder ?? false,
        visible: o.visible !== false,
      }));
  };

  const addLineStyled = (style: LineStyleId, at?: CanvasPoint) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const m = (mm: number) => mmToPx(mm, EDITOR_DPI);
    const anchor = at ?? defaultDropPoint();
    const half = m(35);
    const x1 = anchor.left - half;
    const x2 = anchor.left + half;
    const y = anchor.top;
    let strokeDashArray: number[] | undefined;
    if (style === 'dashed') strokeDashArray = [12, 6];
    if (style === 'dotted') strokeDashArray = [2, 4];

    const pathStyles: LineStyleId[] = [
      'arrow-end',
      'arrow-both',
      'circle-arrow',
      'square-bar',
    ];
    if (pathStyles.includes(style)) {
      let d = `M ${x1} ${y} L ${x2} ${y}`;
      if (style === 'arrow-both') {
        d = `M ${x1 + 8} ${y} L ${x2 - 8} ${y} M ${x1} ${y} l 6 -4 v 8 z M ${x2} ${y} l -6 -4 v 8 z`;
      } else if (style === 'arrow-end') {
        d = `M ${x1} ${y} L ${x2 - 8} ${y} M ${x2 - 8} ${y - 5} L ${x2} ${y} L ${x2 - 8} ${y + 5} Z`;
      } else if (style === 'circle-arrow') {
        d = `M ${x1 + 6} ${y} m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M ${x1 + 12} ${y} L ${x2 - 8} ${y} M ${x2 - 8} ${y - 5} L ${x2} ${y} L ${x2 - 8} ${y + 5} Z`;
      } else if (style === 'square-bar') {
        d = `M ${x1} ${y - 4} v 8 h 6 v -8 z M ${x1 + 6} ${y} L ${x2 - 4} ${y} M ${x2 - 4} ${y - 6} v 12`;
      }
      const path = new Path(d, {
        stroke: '#64748b',
        strokeWidth: 2,
        fill: style === 'arrow-end' || style === 'arrow-both' || style === 'circle-arrow' ? '#64748b' : '',
      });
      setMeta(path, { role: 'line', locked: false, placeholder: false, label: 'Line' });
      canvas.add(path);
      canvas.setActiveObject(path);
      canvas.requestRenderAll();
      return;
    }

    const line = new Line([x1, y, x2, y], {
      stroke: '#64748b',
      strokeWidth: style === 'dotted' ? 2 : 1,
      strokeDashArray,
    });
    setMeta(line, { role: 'line', locked: false, placeholder: false, label: 'Line' });
    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.requestRenderAll();
  };

  const addSvgAsset = async (markup: string, label: string, at?: CanvasPoint) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const { objects, options } = await loadSVGFromString(markup);
    const filtered = objects.filter((o): o is FabricObject => o != null);
    if (filtered.length === 0) return;
    const obj = util.groupSVGElements(filtered, options);
    const maxW = width * 0.18;
    const scale = maxW / (obj.width || maxW);
    obj.set({
      scaleX: scale,
      scaleY: scale,
    });
    centerObjectAt(obj, at ?? defaultDropPoint());
    setMeta(obj, {
      role: 'shape',
      locked: false,
      placeholder: false,
      label,
    });
    canvas.add(obj);
    clampObjectToPage(obj, width, height);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
  };

  const addImageFromDataUrl = async (
    dataUrl: string,
    label: string,
    at?: CanvasPoint,
  ) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const img = await FabricImage.fromURL(dataUrl, { crossOrigin: 'anonymous' });
    const maxW = mmToPx(40, EDITOR_DPI);
    const scale = Math.min(maxW / (img.width ?? maxW), 1);
    const anchor = at ?? defaultDropPoint();
    img.set({
      scaleX: scale,
      scaleY: scale,
    });
    if (at) {
      centerObjectAt(img, at);
    } else {
      centerObjectAt(img, anchor);
    }
    setMeta(img, {
      role: 'image',
      locked: false,
      placeholder: false,
      label,
    });
    canvas.add(img);
    clampObjectToPage(img, width, height);
    canvas.setActiveObject(img);
    canvas.requestRenderAll();
  };

  const addTextPreset = (
    preset: {
      text: string;
      fontSize: number;
      fontWeight: string;
      fontFamily: string;
      role: 'heading' | 'body';
      label: string;
    },
    at?: CanvasPoint,
  ) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const anchor = at ?? {
      left: mmToPx(SAFE_MARGIN_MM, EDITOR_DPI),
      top: mmToPx(35, EDITOR_DPI),
    };
    const text = new FabricText(preset.text, {
      left: anchor.left,
      top: anchor.top,
      originX: 'left',
      originY: 'top',
      fontFamily: preset.fontFamily,
      fontSize: preset.fontSize,
      fill: '#0f172a',
      fontWeight: preset.fontWeight,
    });
    setMeta(text, {
      role: preset.role,
      locked: false,
      placeholder: preset.role === 'heading' || preset.role === 'body',
      fieldId: `${preset.role}_${Date.now()}`,
      label: preset.label,
    });
    canvas.add(text);
    clampObjectToPage(text, width, height);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  };

  const addStyledTextTemplate = (
    preset: {
      text: string;
      fontFamily: string;
      fontSize: number;
      fill: string;
      fontWeight?: string;
    },
    at?: CanvasPoint,
  ) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const anchor = at ?? {
      left: mmToPx(SAFE_MARGIN_MM, EDITOR_DPI),
      top: mmToPx(60, EDITOR_DPI),
    };
    const text = new FabricText(preset.text, {
      left: anchor.left,
      top: anchor.top,
      originX: 'left',
      originY: 'top',
      fontFamily: preset.fontFamily,
      fontSize: preset.fontSize,
      fill: preset.fill,
      fontWeight: preset.fontWeight ?? 'normal',
      textAlign: 'left',
    });
    setMeta(text, {
      role: 'heading',
      locked: false,
      placeholder: false,
      label: 'Text template',
    });
    canvas.add(text);
    clampObjectToPage(text, width, height);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  };

  const applyDragPayload = (payload: StudioDragPayload, at: CanvasPoint) => {
    if (payload.type === 'line') {
      addLineStyled(payload.style as LineStyleId, at);
      return;
    }
    if (payload.type === 'shape') {
      addElementShape(payload.shapeId, at);
      return;
    }
    if (payload.type === 'text-preset') {
      const preset = TEXT_PRESETS.find((p) => p.id === payload.presetId);
      if (preset) {
        addTextPreset({ ...preset }, at);
      }
      return;
    }
    if (payload.type === 'text-template') {
      const template =
        TEXT_STYLE_TEMPLATES.find((t) => t.id === payload.templateId) ??
        FONT_SHOWCASE.find((f) => f.id === payload.templateId);
      if (template) {
        addStyledTextTemplate(template, at);
      }
      return;
    }
    if (payload.type === 'background-solid') {
      setPageBackground(payload.color);
      return;
    }
    if (payload.type === 'background-gradient') {
      setPageBackgroundGradient(payload.gradientId);
    }
  };

  const getObjectFill = (obj: FabricObject): string | undefined => {
    if (obj instanceof FabricText) return (obj.fill as string) ?? '#000000';
    if ('fill' in obj && typeof obj.fill === 'string') return obj.fill;
    if ('stroke' in obj && typeof obj.stroke === 'string') return obj.stroke;
    return '#000000';
  };

  const updateSelectedFill = (color: string) => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !obj || isGuide(obj)) return;
    if (obj instanceof FabricText) {
      obj.set({ fill: color });
    } else if (obj instanceof Line || obj instanceof Path) {
      obj.set({ stroke: color });
    } else {
      obj.set({ fill: color });
    }
    canvas.requestRenderAll();
    pushHistory();
    bump();
  };

  const updateSelectedFontFamily = (family: string) => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !obj || !(obj instanceof FabricText)) return;
    obj.set({ fontFamily: family });
    canvas.requestRenderAll();
    pushHistory();
    bump();
  };

  const updateSelectedFontSize = (size: number) => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !obj || !(obj instanceof FabricText)) return;
    obj.set({ fontSize: size });
    canvas.requestRenderAll();
    pushHistory();
    bump();
  };

  const updateSelectedOpacity = (opacity: number) => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !obj || isGuide(obj)) return;
    obj.set({ opacity });
    canvas.requestRenderAll();
    pushHistory();
    bump();
  };

  const getPageBackground = () => pageBgColor;

  const clearLayerHoverHighlight = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const objects = canvas.getObjects().filter((o) => !isGuide(o));
    objects.forEach((o) => {
      const prev = layerHoverOpacityRef.current.get(o);
      if (prev !== undefined) {
        o.set('opacity', prev);
        layerHoverOpacityRef.current.delete(o);
      }
    });
    canvas.requestRenderAll();
  };

  const setLayerHoverHighlight = (contentIndex: number | null) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    clearLayerHoverHighlight();
    if (contentIndex === null) return;
    const objects = canvas.getObjects().filter((o) => !isGuide(o));
    objects.forEach((o, i) => {
      const base = o.opacity ?? 1;
      layerHoverOpacityRef.current.set(o, base);
      o.set('opacity', i === contentIndex ? 1 : base * 0.28);
    });
    canvas.requestRenderAll();
  };

  const toggleLayerVisibility = (index: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const objects = canvas.getObjects().filter((o) => !isGuide(o));
    const obj = objects[index];
    if (!obj) return;
    obj.set({ visible: obj.visible === false });
    canvas.requestRenderAll();
    bump();
  };

  const reorderLayer = (fromContentIndex: number, toContentIndex: number) => {
    const canvas = fabricRef.current;
    if (!canvas || fromContentIndex === toContentIndex) return;
    const content = canvas.getObjects().filter((o) => !isGuide(o));
    const obj = content[fromContentIndex];
    if (!obj) return;
    const steps = toContentIndex - fromContentIndex;
    if (steps > 0) {
      for (let i = 0; i < steps; i++) canvas.bringObjectForward(obj);
    } else {
      for (let i = 0; i < -steps; i++) {
        canvas.sendObjectBackwards(obj);
        const guide = canvas.getObjects().find((o) => isGuide(o));
        if (guide) canvas.sendObjectToBack(guide);
      }
    }
    canvas.requestRenderAll();
    pushHistory();
    bump();
  };

  const activeSelection = (): ActiveSelectionState => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj || isGuide(obj)) return { kind: 'none' };
    const meta = getMeta(obj);
    const opacity = obj.opacity ?? 1;
    if (obj instanceof FabricText) {
      return {
        kind: 'text',
        fill: (obj.fill as string) ?? '#000000',
        fontFamily: obj.fontFamily,
        fontSize: obj.fontSize,
        opacity,
        locked: meta?.locked,
        placeholder: meta?.placeholder,
      };
    }
    if (obj instanceof FabricImage) {
      return {
        kind: 'image',
        fill: '#000000',
        opacity,
        locked: meta?.locked,
        placeholder: meta?.placeholder,
      };
    }
    if (obj instanceof Line || obj instanceof Path) {
      return {
        kind: 'line',
        fill: getObjectFill(obj),
        opacity,
        locked: meta?.locked,
        placeholder: meta?.placeholder,
      };
    }
    if (meta?.role === 'draw') {
      return {
        kind: 'draw',
        fill: getObjectFill(obj),
        opacity,
        locked: meta?.locked,
      };
    }
    return {
      kind: 'shape',
      fill: getObjectFill(obj),
      opacity,
      locked: meta?.locked,
      placeholder: meta?.placeholder,
    };
  };

  const activeMeta = () => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj || isGuide(obj)) return null;
    return {
      meta: getMeta(obj),
      text: obj instanceof FabricText ? obj.text : undefined,
    };
  };

  const getActiveLayerIndex = (): number | null => {
    const canvas = fabricRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !obj || isGuide(obj)) return null;
    const objects = canvas.getObjects().filter((o) => !isGuide(o));
    const idx = objects.indexOf(obj);
    return idx >= 0 ? idx : null;
  };

  editorBridgeRef.current = { pushHistory, selectObject };

  return {
    canvasElRef,
    containerRef,
    getCanvas,
    addHeading,
    addBody,
    addDivider,
    addBand,
    addShape,
    addElementShape,
    addLineStyled,
    addSvgAsset,
    addImageFromDataUrl,
    applyDragPayload,
    clientToCanvas,
    addTextPreset,
    addStyledTextTemplate,
    setPageBackground,
    setPageBackgroundGradient,
    getPageBackground,
    setDrawingEnabled,
    setBrushWidth,
    setBrushColor,
    drawingEnabled,
    duplicateSelected,
    toggleLockSelected,
    undo,
    redo,
    canUndo,
    canRedo,
    deleteSelected,
    updateSelectedMeta,
    updateSelectedText,
    updateSelectedFill,
    updateSelectedFontFamily,
    updateSelectedFontSize,
    updateSelectedOpacity,
    bringForward,
    sendBackward,
    selectObject,
    setLayerHoverHighlight,
    clearLayerHoverHighlight,
    toggleLayerVisibility,
    reorderLayer,
    layers,
    activeMeta,
    getActiveLayerIndex,
    activeSelection,
    revision,
    displayWidth: width,
    displayHeight: height,
  };
}
