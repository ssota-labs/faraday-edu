// Public entry point for the Faraday lesson blocks (shadcn-composed).
// Import from "./" in lesson code.
export { Lesson } from "./Lesson";
export { Lecture, type LectureView } from "./Lecture";
export { useLecture, type LectureContextValue, type LectureViewMeta } from "./lecture-context";
export { PresentationCanvas, type CanvasItem, type CanvasCardLayout } from "./PresentationCanvas";
export { PresentationToolbar } from "./PresentationToolbar";
export { PresentationTopBar, PRESENTATION_TOP_PAD } from "./PresentationTopBar";
export { InkToolbar } from "./InkToolbar";
export { SlideInkLayer } from "./SlideInkLayer";
export type { InkTool, InkStroke } from "./ink";
export { Prose } from "./Prose";
export { Stage } from "./Stage";
export { Workbench } from "./Workbench";
export { ControlGroup } from "./ControlGroup";
export { Chart, type ChartSeries } from "./Chart";
export { ParamSlider } from "./ParamSlider";
export { ParamSwitch } from "./ParamSwitch";
export { Segmented } from "./Segmented";
export { Scrubber } from "./Scrubber";
export { Quiz, type QuizOption } from "./Quiz";
export { Callout } from "./Callout";
export { Reveal } from "./Reveal";
export { Compare } from "./Compare";
export { Stat } from "./Stat";
export { TeX } from "./TeX";
export { SlideDeck } from "./SlideDeck";
export type { Slide } from "./SlideDeck";
/** @deprecated Use SlideDeck */
export { Paged } from "./Paged";
/** @deprecated Use Slide */
export type { PagedPage } from "./Paged";
export { NumericAnswer } from "./NumericAnswer";
export { Derivation } from "./Derivation";
export type { DerivationStep } from "./Derivation";
export { SketchPad } from "./SketchPad";
export { Challenge } from "./Challenge";
export { celebrate } from "./celebrate";
export { CodeCell } from "./CodeCell";
export { Readout } from "./Readout";
