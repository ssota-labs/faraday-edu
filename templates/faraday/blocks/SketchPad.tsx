// <SketchPad> — a pen/touch drawing check for tablets (Apple Pencil pressure
// supported): the learner SKETCHES a prediction (a curve, a construction, a
// region), then reveals the true answer as an overlay and self-assesses. This
// is the "predict-then-compare" assessment (see assessment.md) — sketches
// aren't machine-graded; the comparison against the revealed overlay IS the
// feedback, and the self-assess buttons close the loop.
//
//   <SketchPad
//     prompt="Draw the trajectory you expect for a 60° launch."
//     background={<Axes />}                 // static scene to draw over
//     overlay={<TruePath />}                // the answer, shown on reveal
//     onSelfAssess={(matched) => matched && complete()}
//   />
import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { ArrowCounterClockwiseIcon, ArrowUUpLeftIcon, EyeIcon, CheckIcon, XIcon } from "@phosphor-icons/react";
import { Button } from "@/faraday/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/faraday/ui/alert";
import { celebrate } from "./celebrate";

interface Stroke {
  width: number;
  points: string; // "x,y x,y …" in viewBox coords
}

export function SketchPad(props: {
  /** What to draw — the prediction being asked for. */
  prompt: string;
  /** SVG viewBox (drawing coordinates). Default "0 0 720 340". */
  viewBox?: string;
  /** Static scene rendered UNDER the ink (axes, the setup). SVG elements. */
  background?: ReactNode;
  /** The true answer, rendered on top when the learner reveals it. SVG elements. */
  overlay?: ReactNode;
  /** Called when the learner self-assesses after the reveal. */
  onSelfAssess?: (matched: boolean) => void;
  /** Ink color token. Default the primary color. */
  inkColor?: string;
}) {
  const viewBox = props.viewBox ?? "0 0 720 340";
  const ink = props.inkColor ?? "var(--primary)";
  const svgRef = useRef<SVGSVGElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [current, setCurrent] = useState<Stroke | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [assessed, setAssessed] = useState<null | boolean>(null);

  const toViewBox = (e: React.PointerEvent) => {
    const svg = svgRef.current!;
    const ctm = svg.getScreenCTM();
    const pt = new DOMPoint(e.clientX, e.clientY);
    const p = ctm ? pt.matrixTransform(ctm.inverse()) : pt;
    return { x: p.x, y: p.y };
  };

  const down = (e: React.PointerEvent) => {
    if (revealed) return;
    e.preventDefault();
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {
      /* already-released/synthetic pointer — element events still track */
    }
    const p = toViewBox(e);
    // pencil pressure (0..1) modulates ink width; mouse reports 0.5
    const width = 1.6 + (e.pressure > 0 ? e.pressure : 0.5) * 2.2;
    setCurrent({ width, points: `${p.x.toFixed(1)},${p.y.toFixed(1)}` });
  };
  const move = (e: React.PointerEvent) => {
    if (!current || revealed) return;
    const p = toViewBox(e);
    setCurrent((c) => c && { ...c, points: c.points + ` ${p.x.toFixed(1)},${p.y.toFixed(1)}` });
  };
  const up = () => {
    if (!current) return;
    setStrokes((s) => [...s, current]);
    setCurrent(null);
  };

  const hasInk = strokes.length > 0 || current != null;

  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-5">
      <p className="font-medium">{props.prompt}</p>
      <div className="relative overflow-hidden rounded-lg border bg-background">
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className="w-full touch-none select-none"
          role="img"
          aria-label="Sketch area"
          style={{ cursor: revealed ? "default" : "crosshair" }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        >
          {props.background}
          {[...strokes, ...(current ? [current] : [])].map((s, i) => (
            <polyline
              key={i}
              points={s.points}
              fill="none"
              style={{ stroke: ink }}
              strokeWidth={s.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={revealed ? 0.55 : 0.9}
            />
          ))}
          {revealed ? props.overlay : null}
        </svg>
        {!hasInk && !revealed ? (
          <span className="pointer-events-none absolute top-3 left-3 text-xs text-muted-foreground">
            Draw here — pen, finger, or mouse
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!revealed ? (
          <>
            <Button variant="outline" size="sm" disabled={!strokes.length} onClick={() => setStrokes((s) => s.slice(0, -1))}>
              <ArrowUUpLeftIcon /> Undo
            </Button>
            <Button variant="outline" size="sm" disabled={!hasInk} onClick={() => { setStrokes([]); setCurrent(null); }}>
              <ArrowCounterClockwiseIcon /> Clear
            </Button>
            <div className="flex-1" />
            <Button size="sm" disabled={!strokes.length} onClick={() => setRevealed(true)}>
              <EyeIcon /> Show the answer
            </Button>
          </>
        ) : assessed == null ? (
          <>
            <span className="text-sm text-muted-foreground">Compare your sketch with the answer —</span>
            <Button size="sm" onClick={(e) => { setAssessed(true); celebrate(e.currentTarget.closest("section")); props.onSelfAssess?.(true); }}>
              <CheckIcon /> I had it right
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setAssessed(false); setRevealed(false); setStrokes([]); props.onSelfAssess?.(false); }}
            >
              <XIcon /> Off — let me redraw
            </Button>
          </>
        ) : assessed ? (
          <Alert>
            <AlertTitle>Nice prediction</AlertTitle>
            <AlertDescription>Your sketch matched the real behaviour.</AlertDescription>
          </Alert>
        ) : null}
      </div>
    </section>
  );
}
