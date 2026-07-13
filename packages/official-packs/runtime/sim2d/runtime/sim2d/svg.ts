import gsap from "gsap";

/** Imperative SVG transform — avoids React re-render per frame. */
export function setSvgTranslate(el: Element | null, x: number, y: number, rotateDeg = 0) {
  if (!el) return;
  const transform =
    rotateDeg !== 0 ? `translate(${x}, ${y}) rotate(${rotateDeg})` : `translate(${x}, ${y})`;
  gsap.set(el, { attr: { transform } });
}
