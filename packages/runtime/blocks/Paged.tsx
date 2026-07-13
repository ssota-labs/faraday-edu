// @deprecated Use <SlideDeck> from ./SlideDeck — kept for backward compatibility.
import { SlideDeck, type Slide } from "./SlideDeck";
import type { ReactNode } from "react";

/** @deprecated Renamed to `Slide`. */
export type PagedPage = Slide;

/** @deprecated Use `<SlideDeck slides={…}>` instead. */
export function Paged(props: {
  pages: PagedPage[];
  height?: string;
  onLastPage?: () => void;
}) {
  return (
    <SlideDeck
      slides={props.pages}
      onLastSlide={props.onLastPage}
    />
  );
}

export { SlideDeck, type Slide } from "./SlideDeck";
