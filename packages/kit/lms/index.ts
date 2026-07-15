// LMS v0 — progress analytics over the course event stream.
// Import from "./". Wire useLmsRecorder().onEvent into <CourseHost>.
export { useLmsRecorder, summarize, type LmsEvent, type LmsSummary, type NodeStat } from "./recorder";
export { ProgressDashboard, type Learner } from "./dashboard";
