// Functional sub-grouping of the lesson blocks — by the ROLE each plays when an
// author builds a lesson, so "where/how would I use this" reads off the sidebar.
// (The five assessment check-forms are Quiz/NumericAnswer/SketchPad/Challenge +
// the --tutor open-response; CodeCell is an explore/verify tool, not a gate.)

export type BlockGroupDef = { id: string; title: string; blurb: string; dot: string; members: string[] };

export const BLOCK_GROUPS: BlockGroupDef[] = [
  {
    id: "structure",
    title: "Structure · 구조",
    dot: "var(--chart-1)",
    blurb: "The page skeleton — the frame, text, and reading-surface layout everything else sits inside.",
    members: ["Lesson", "Prose", "Stage", "Paged"],
  },
  {
    id: "model",
    title: "Interactive model · 조작",
    dot: "var(--chart-2)",
    blurb: "The manipulable instrument and its controls — the thing the learner actually drives.",
    members: ["Workbench", "ControlGroup", "ParamSlider", "ParamSwitch", "Segmented", "Scrubber"],
  },
  {
    id: "data",
    title: "Data & math · 표시",
    dot: "var(--chart-3)",
    blurb: "Show values, relationships, live numbers, and formulas.",
    members: ["Chart", "TeX", "Derivation", "Stat", "Readout"],
  },
  {
    id: "assessment",
    title: "Assessment · 평가",
    dot: "var(--chart-4)",
    blurb: "The check forms that gate progress — pick by the outcome verb (recognize / compute / predict / do).",
    members: ["Quiz", "NumericAnswer", "SketchPad", "Challenge"],
  },
  {
    id: "explain",
    title: "Explain & explore · 부연",
    dot: "var(--chart-5)",
    blurb: "Notes, hidden depth, side-by-side comparison, and runnable code.",
    members: ["Callout", "Reveal", "Compare", "CodeCell"],
  },
];
