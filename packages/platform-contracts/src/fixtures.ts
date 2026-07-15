import type { CourseDefinition } from "./course";
import type { ReleaseManifest } from "./release";

export const sampleCourseDefinition: CourseDefinition = {
  schemaVersion: 1,
  courseId: "course_sample_physics",
  title: "Sample Physics",
  lectures: [
    {
      id: "lecture_intro",
      title: "Introduction",
      order: 0,
      nodeIds: ["node_intro"],
    },
    {
      id: "lecture_forces",
      title: "Forces",
      order: 1,
      nodeIds: ["node_forces"],
    },
  ],
  nodes: [
    {
      id: "node_intro",
      lessonComponentId: "lesson.intro",
    },
    {
      id: "node_forces",
      lessonComponentId: "lesson.forces",
      requires: ["node_intro"],
    },
  ],
  outcomes: [],
  assessments: [
    {
      assessmentId: "assess_forces_official",
      assessmentVersionId: "assess_forces_official_v1",
      mode: "OFFICIAL",
    },
  ],
  completionRules: [],
  gradingPolicy: {},
  customMetadata: { subject: "physics" },
};

export const sampleReleaseManifest: ReleaseManifest = {
  schemaVersion: 1,
  buildHash: "b".repeat(40),
  courseId: "course_sample_physics",
  courseVersionId: "cv_sample_1",
  runtimeVersion: "0.1.0",
  createdAt: "2026-07-14T00:00:00.000Z",
  entrypoint: "index.html",
  files: [
    {
      path: "index.html",
      sha256: "c".repeat(64),
      bytes: 120,
    },
    {
      path: "assets/index.js",
      sha256: "d".repeat(64),
      bytes: 4096,
    },
  ],
};

/** Sealed answers — must NEVER appear in public artifact scan. */
export const sampleSealedAnswers = {
  assessmentVersionId: "assess_forces_official_v1",
  gradingKeyHash: "e".repeat(64),
  answers: { i1: "4" },
  passThreshold: 0.7,
};
