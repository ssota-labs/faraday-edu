// <TeX> — KaTeX-rendered math. EVERY symbolic expression in a lesson goes
// through this block (inline in prose, or `block` for display equations);
// ASCII/`<code>` math is a quality-bar fail. Pass the TeX source as the child
// string — String.raw`…` keeps backslashes readable.
//
//   The area swept obeys <TeX>{String.raw`\frac{dA}{dt} = \frac{L}{2m}`}</TeX>.
//   <TeX block>{String.raw`T^2 = \frac{4\pi^2}{GM}a^3`}</TeX>
import { useMemo } from "react";
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
  return props.block ? (
    <div
      className={cn("my-2 overflow-x-auto py-1 text-center [&_.katex]:text-[1.12em]", props.className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : (
    <span className={props.className} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
