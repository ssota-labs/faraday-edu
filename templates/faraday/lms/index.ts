// LMS v0 — progress analytics over the curriculum event stream.
// Import from "@/faraday/lms". Wire useLmsRecorder().onEvent into <CurriculumHost>.
export { useLmsRecorder, summarize, type LmsEvent, type LmsSummary, type NodeStat } from "./recorder";
export { ProgressDashboard, type Learner } from "./dashboard";
