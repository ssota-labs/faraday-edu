export interface ClientPoint {
  x: number;
  y: number;
}

export function clientDistance(a: ClientPoint, b: ClientPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function clientMidpoint(a: ClientPoint, b: ClientPoint): ClientPoint {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Pinch zoom around the gesture midpoint; returns updated pan + zoom. */
export function pinchZoomAtMidpoint(opts: {
  rect: DOMRect;
  startDist: number;
  startZoom: number;
  startPanX: number;
  startPanY: number;
  dist: number;
  mid: ClientPoint;
  minZoom?: number;
  maxZoom?: number;
}): { panX: number; panY: number; zoom: number } {
  const min = opts.minZoom ?? 0.35;
  const max = opts.maxZoom ?? 2.5;
  const scale = opts.dist / Math.max(opts.startDist, 1);
  const zoom = Math.min(max, Math.max(min, opts.startZoom * scale));
  const mx = opts.mid.x - opts.rect.left;
  const my = opts.mid.y - opts.rect.top;
  const panX = mx - ((mx - opts.startPanX) * zoom) / opts.startZoom;
  const panY = my - ((my - opts.startPanY) * zoom) / opts.startZoom;
  return { panX, panY, zoom };
}
