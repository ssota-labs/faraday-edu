import { getPlatform, json, error, learnerIdFromRequest } from "@/lib/platform";
import {
  createStarterCourseDefinition,
  CourseDefinitionSchema,
  type CourseDefinition,
  type CourseLecture,
} from "@faraday-academy/platform-contracts";

const COURSE_JSON = "course.json";

function readDefinition(
  files: Record<string, string>,
  courseId: string,
  title: string,
): CourseDefinition {
  const raw = files[COURSE_JSON];
  if (!raw) return createStarterCourseDefinition({ courseId, title });
  try {
    return CourseDefinitionSchema.parse(JSON.parse(raw));
  } catch {
    return createStarterCourseDefinition({ courseId, title });
  }
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ courseId: string }> },
) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);
  const { courseId } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const platform = getPlatform();
  const course = await platform.store.getCourse(courseId);
  if (!course) return error("NOT_FOUND", "course not found", 404);
  if (course.ownerId !== userId) return error("FORBIDDEN", "not owner", 403);

  const draft = await platform.studio.getDraftByCourseId(courseId, userId);
  const definition = readDefinition(draft.files, course.id, course.title);
  const order = definition.lectures.length;
  const lectureId = `lecture_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const nodeId = `node_${lectureId}`;
  const title =
    typeof body.title === "string" && body.title.trim()
      ? body.title.trim()
      : `Lecture ${order + 1}`;

  const lecture: CourseLecture = {
    id: lectureId,
    title,
    summary: typeof body.summary === "string" ? body.summary : undefined,
    order,
    nodeIds: [nodeId],
  };

  const next: CourseDefinition = CourseDefinitionSchema.parse({
    ...definition,
    lectures: [...definition.lectures, lecture],
    nodes: [
      ...definition.nodes,
      { id: nodeId, lessonComponentId: `lesson.${lectureId}` },
    ],
  });

  await platform.studio.saveDraft({
    draftId: draft.draftId,
    courseId,
    ownerId: userId,
    files: {
      ...draft.files,
      [COURSE_JSON]: JSON.stringify(next, null, 2),
    },
  });

  return json({ lecture, lectures: next.lectures, definition: next });
}
