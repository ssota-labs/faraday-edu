import { z } from "zod";

export const CourseStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export type CourseStatus = z.infer<typeof CourseStatusSchema>;

export const CourseAccessSchema = z.enum(["PUBLIC_FREE", "PUBLIC_PAID"]);
export type CourseAccess = z.infer<typeof CourseAccessSchema>;

export const CourseNodeSchema = z.object({
  id: z.string().min(1),
  lessonComponentId: z.string().min(1),
  requires: z.array(z.string().min(1)).optional(),
  completionRule: z.unknown().optional(),
});
export type CourseNode = z.infer<typeof CourseNodeSchema>;

/** Authoring unit inside a course — maps to a Faraday `<Lecture>` / lesson file. */
export const CourseLectureSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().optional(),
  order: z.number().int().nonnegative(),
  /** Node ids that belong to this lecture (subset of `nodes`). */
  nodeIds: z.array(z.string().min(1)).default([]),
});
export type CourseLecture = z.infer<typeof CourseLectureSchema>;

export const CourseDefinitionSchema = z.object({
  schemaVersion: z.literal(1),
  courseId: z.string().min(1),
  title: z.string().min(1).optional(),
  /** Course → lecture hierarchy (mirror-dimension project shell adaptation). */
  lectures: z.array(CourseLectureSchema).default([]),
  nodes: z.array(CourseNodeSchema),
  outcomes: z.array(z.unknown()).default([]),
  assessments: z.array(z.unknown()).default([]),
  completionRules: z.array(z.unknown()).default([]),
  gradingPolicy: z.record(z.unknown()).default({}),
  customMetadata: z.record(z.unknown()).default({}),
});
export type CourseDefinition = z.infer<typeof CourseDefinitionSchema>;

export const CourseRecordSchema = z.object({
  id: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  ownerId: z.string().min(1),
  title: z.string().min(1),
  status: CourseStatusSchema,
  access: CourseAccessSchema,
  activeReleaseId: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type CourseRecord = z.infer<typeof CourseRecordSchema>;

/** Build a starter definition with one empty lecture (Studio project bootstrap). */
export function createStarterCourseDefinition(input: {
  courseId: string;
  title: string;
  lectureTitle?: string;
}): CourseDefinition {
  const lectureId = `lecture_${input.courseId.replace(/^course_/, "").slice(0, 12) || "intro"}`;
  const nodeId = `node_${lectureId}`;
  return CourseDefinitionSchema.parse({
    schemaVersion: 1,
    courseId: input.courseId,
    title: input.title,
    lectures: [
      {
        id: lectureId,
        title: input.lectureTitle ?? "Lecture 1",
        summary: "Opening lecture",
        order: 0,
        nodeIds: [nodeId],
      },
    ],
    nodes: [
      {
        id: nodeId,
        lessonComponentId: `lesson.${lectureId}`,
      },
    ],
    outcomes: [],
    assessments: [],
    completionRules: [],
    gradingPolicy: {},
    customMetadata: {},
  });
}
