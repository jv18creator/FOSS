import type { FabricObject } from 'fabric';
import { isGuide } from './fabricMeta';

export type AlignmentGuideLine = {
  orientation: 'h' | 'v';
  /** Scene-space coordinate (x for vertical, y for horizontal) */
  pos: number;
  /** Segment start along the perpendicular axis (scene space) */
  start: number;
  /** Segment end along the perpendicular axis (scene space) */
  end: number;
  kind: 'page' | 'object';
};

type EdgeSet = {
  left: number;
  centerX: number;
  right: number;
  top: number;
  centerY: number;
  bottom: number;
};

const SNAP_THRESHOLD = 8;
const MATCH_EPSILON = 0.75;
const SEGMENT_PAD = 8;

function edgesFromRect(r: {
  left: number;
  top: number;
  width: number;
  height: number;
}): EdgeSet {
  return {
    left: r.left,
    centerX: r.left + r.width / 2,
    right: r.left + r.width,
    top: r.top,
    centerY: r.top + r.height / 2,
    bottom: r.top + r.height,
  };
}

function pageEdges(pageW: number, pageH: number): EdgeSet {
  return {
    left: 0,
    centerX: pageW / 2,
    right: pageW,
    top: 0,
    centerY: pageH / 2,
    bottom: pageH,
  };
}

function xValues(e: EdgeSet): number[] {
  return [e.left, e.centerX, e.right];
}

function yValues(e: EdgeSet): number[] {
  return [e.top, e.centerY, e.bottom];
}

type SnapCandidate = { dist: number; delta: number; targetPos: number };

function bestCandidate(candidates: SnapCandidate[], threshold: number): SnapCandidate | null {
  let best: SnapCandidate | null = null;
  for (const c of candidates) {
    if (c.dist > threshold) continue;
    if (!best || c.dist < best.dist - 1e-6) best = c;
  }
  return best;
}

function collectXCandidates(moving: EdgeSet, target: EdgeSet): SnapCandidate[] {
  const out: SnapCandidate[] = [];
  for (const mv of xValues(moving)) {
    for (const tv of xValues(target)) {
      out.push({ dist: Math.abs(mv - tv), delta: tv - mv, targetPos: tv });
    }
  }
  return out;
}

function collectYCandidates(moving: EdgeSet, target: EdgeSet): SnapCandidate[] {
  const out: SnapCandidate[] = [];
  for (const mv of yValues(moving)) {
    for (const tv of yValues(target)) {
      out.push({ dist: Math.abs(mv - tv), delta: tv - mv, targetPos: tv });
    }
  }
  return out;
}

function verticalSegment(
  pos: number,
  a: EdgeSet,
  b: EdgeSet,
  kind: 'page' | 'object',
  pageH: number,
): AlignmentGuideLine {
  if (kind === 'page') {
    return { orientation: 'v', pos, start: 0, end: pageH, kind };
  }
  return {
    orientation: 'v',
    pos,
    start: Math.min(a.top, b.top) - SEGMENT_PAD,
    end: Math.max(a.bottom, b.bottom) + SEGMENT_PAD,
    kind,
  };
}

function horizontalSegment(
  pos: number,
  a: EdgeSet,
  b: EdgeSet,
  kind: 'page' | 'object',
  pageW: number,
): AlignmentGuideLine {
  if (kind === 'page') {
    return { orientation: 'h', pos, start: 0, end: pageW, kind };
  }
  return {
    orientation: 'h',
    pos,
    start: Math.min(a.left, b.left) - SEGMENT_PAD,
    end: Math.max(a.right, b.right) + SEGMENT_PAD,
    kind,
  };
}

function alignedOnX(a: EdgeSet, b: EdgeSet, epsilon: number): number[] {
  const hits: number[] = [];
  for (const av of xValues(a)) {
    for (const bv of xValues(b)) {
      if (Math.abs(av - bv) <= epsilon) hits.push(bv);
    }
  }
  return [...new Set(hits.map((v) => Math.round(v * 100) / 100))];
}

function alignedOnY(a: EdgeSet, b: EdgeSet, epsilon: number): number[] {
  const hits: number[] = [];
  for (const av of yValues(a)) {
    for (const bv of yValues(b)) {
      if (Math.abs(av - bv) <= epsilon) hits.push(bv);
    }
  }
  return [...new Set(hits.map((v) => Math.round(v * 100) / 100))];
}

/**
 * Snap moving object to page center/edges and peer object centers/edges.
 * Returns guide segments that show which elements (and page axes) match.
 */
export function computeAlignmentSnap(
  moving: FabricObject,
  peers: FabricObject[],
  pageW: number,
  pageH: number,
  threshold = SNAP_THRESHOLD,
): { lines: AlignmentGuideLine[]; dx: number; dy: number } {
  moving.setCoords();
  const movingBox = moving.getBoundingRect();
  const m0 = edgesFromRect(movingBox);

  type Target = { edges: EdgeSet; kind: 'page' | 'object' };
  const targets: Target[] = [{ edges: pageEdges(pageW, pageH), kind: 'page' }];
  for (const peer of peers) {
    if (peer === moving || isGuide(peer)) continue;
    peer.setCoords();
    targets.push({ edges: edgesFromRect(peer.getBoundingRect()), kind: 'object' });
  }

  const xCandidates: SnapCandidate[] = [];
  const yCandidates: SnapCandidate[] = [];
  for (const t of targets) {
    xCandidates.push(...collectXCandidates(m0, t.edges));
    yCandidates.push(...collectYCandidates(m0, t.edges));
  }

  const bestX = bestCandidate(xCandidates, threshold);
  const bestY = bestCandidate(yCandidates, threshold);
  const dx = bestX?.delta ?? 0;
  const dy = bestY?.delta ?? 0;

  // Post-snap edges used to discover every concurrent alignment to draw
  const m: EdgeSet = {
    left: m0.left + dx,
    centerX: m0.centerX + dx,
    right: m0.right + dx,
    top: m0.top + dy,
    centerY: m0.centerY + dy,
    bottom: m0.bottom + dy,
  };

  const lines: AlignmentGuideLine[] = [];
  const seen = new Set<string>();
  const pushLine = (line: AlignmentGuideLine) => {
    const key = `${line.orientation}:${line.pos.toFixed(2)}:${line.kind}:${line.start.toFixed(1)}:${line.end.toFixed(1)}`;
    if (seen.has(key)) return;
    seen.add(key);
    lines.push(line);
  };

  for (const t of targets) {
    for (const pos of alignedOnX(m, t.edges, MATCH_EPSILON)) {
      pushLine(verticalSegment(pos, m, t.edges, t.kind, pageH));
    }
    for (const pos of alignedOnY(m, t.edges, MATCH_EPSILON)) {
      pushLine(horizontalSegment(pos, m, t.edges, t.kind, pageW));
    }
  }

  return { lines, dx, dy };
}

export function drawAlignmentGuides(
  ctx: CanvasRenderingContext2D,
  lines: AlignmentGuideLine[],
  _pageW: number,
  _pageH: number,
  viewportTransform: number[],
) {
  if (lines.length === 0) return;
  const [a, b, c, d, e, f] = viewportTransform;
  const scale = Math.max(Math.abs(a), 0.001);
  ctx.save();
  ctx.transform(a, b, c, d, e, f);

  for (const line of lines) {
    const isPage = line.kind === 'page';
    ctx.strokeStyle = isPage ? '#e11d48' : '#06b6d4';
    ctx.lineWidth = (isPage ? 1.25 : 1) / scale;
    ctx.setLineDash(
      isPage
        ? [5 / scale, 4 / scale]
        : [3 / scale, 3 / scale],
    );
    ctx.beginPath();
    if (line.orientation === 'v') {
      ctx.moveTo(line.pos, line.start);
      ctx.lineTo(line.pos, line.end);
    } else {
      ctx.moveTo(line.start, line.pos);
      ctx.lineTo(line.end, line.pos);
    }
    ctx.stroke();

    // End ticks so object-to-object alignment is obvious
    if (!isPage) {
      const tick = 4 / scale;
      ctx.setLineDash([]);
      ctx.beginPath();
      if (line.orientation === 'v') {
        ctx.moveTo(line.pos - tick, line.start);
        ctx.lineTo(line.pos + tick, line.start);
        ctx.moveTo(line.pos - tick, line.end);
        ctx.lineTo(line.pos + tick, line.end);
      } else {
        ctx.moveTo(line.start, line.pos - tick);
        ctx.lineTo(line.start, line.pos + tick);
        ctx.moveTo(line.end, line.pos - tick);
        ctx.lineTo(line.end, line.pos + tick);
      }
      ctx.stroke();
    }
  }

  ctx.restore();
}
