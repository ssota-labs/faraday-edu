// <TeX> — KaTeX-rendered math. EVERY symbolic expression in a lesson goes
// through this block (inline in prose, or `block` for display equations);
// ASCII/`<code>` math is a quality-bar fail. Pass the TeX source as the child
// string — String.raw`…` keeps backslashes readable.
//
//   The area swept obeys <TeX>{String.raw`\frac{dA}{dt} = \frac{L}{2m}`}</TeX>.
//   <TeX block>{String.raw`T^2 = \frac{4\pi^2}{GM}a^3`}</TeX>
//   <TeX block stream>…</TeX>   // writes itself out left→right, professor-style
import { useEffect, useMemo, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { cn } from "@/faraday/lib/utils";

export function TeX(props: {
  /** TeX source (preferred: a plain string child, e.g. String.raw`\alpha`). */
  children?: string;
  /** Alternative to children. */
  tex?: string;
  /** Display (centered, own line) instead of inline. */
  block?: boolean;
  /** Block only: reveal the equation left→right with a pen caret riding the
   *  ink edge, like it's being written on the board. Re-streams when the
   *  source changes. No-op under prefers-reduced-motion. */
  stream?: boolean;
  className?: string;
}) {
  const src = props.tex ?? (typeof props.children === "string" ? props.children : "");
  const html = useMemo(
    () =>
      katex.renderToString(src, {
        displayMode: !!props.block,
        throwOnError: false, // render the error in red rather than crashing the lesson
        strict: "ignore",
      }),
    [src, props.block],
  );

  // ── streaming (block mode): clip-path wipes the ink in, caret tracks the edge
  const streaming = !!props.stream && !!props.block;
  const [written, setWritten] = useState(!streaming);
  // writing speed scales with formula size; linear so caret and ink edge stay glued
  const duration = Math.min(2400, Math.max(650, src.length * 30));
  useEffect(() => {
    if (!streaming) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setWritten(true);
      return;
    }
    setWritten(false);
    // double-rAF so the pre-transition state paints before the wipe starts
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setWritten(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [streaming, src]);

  if (!props.block) {
    return <span className={props.className} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  if (!streaming) {
    return (
      <div
        className={cn("my-2 overflow-x-auto py-1 text-center [&_.katex]:text-[1.12em]", props.className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className={cn("my-2 overflow-x-auto py-1 text-center [&_.katex]:text-[1.12em]", props.className)}>
      <span key={src} className="relative inline-block">
        <span
          style={{
            display: "inline-block",
            clipPath: written ? "inset(-8% -2% -8% 0)" : "inset(-8% 100% -8% 0)",
            transition: `clip-path ${duration}ms linear`,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {/* the pen: a nib riding the ink edge, lifting off when the line is done */}
        <span
          aria-hidden
          className="absolute top-1/2 h-[1.5em] w-0.5 -translate-y-1/2 rounded-full bg-primary"
          style={{
            left: written ? "100%" : "0%",
            opacity: written ? 0 : 1,
            transition: `left ${duration}ms linear, opacity 250ms ease ${duration}ms`,
          }}
        />
      </span>
    </div>
  );
}
