// LMS v0 — optional local progress analytics over host-independent events.
export {
  useLmsRecorder,
  summarize,
  type LearningEvent,
  type LmsEvent,
  type LmsSummary,
  type NodeStat,
} from "./recorder";
export {
  ProgressDashboard,
  type CourseDescriptor,
  type Learner,
} from "./dashboard";
