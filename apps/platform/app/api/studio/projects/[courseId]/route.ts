import { getPlatform, json, error, learnerIdFromRequest } from "@/lib/platform";
import {
  createStarterCourseDefinition,
  CourseDefinitionSchema,
  type CourseDefinition,
} from "@faraday-academy/platform-contracts";

const COURSE_JSON = "course.json";

function readDefinition(
  files: Record<string, string>,
  courseId: string,
  title: string,
): CourseDefinition {
  const raw = files[COURSE_JSON];
  if (!raw) {
    return createStarterCourseDefinition({ courseId, title });
  }
  try {
    return CourseDefinitionSchema.parse(JSON.parse(raw));
  } catch {
    return createStarterCourseDefinition({ courseId, title });
  }
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ courseId: string }> },
) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);
  const { courseId } = await ctx.params;
  const platform = getPlatform();
  const course = await platform.store.getCourse(courseId);
  if (!course) return error("NOT_FOUND", "course not found", 404);
  if (course.ownerId !== userId) return error("FORBIDDEN", "not owner", 403);

  const draft = await platform.studio.getDraftByCourseId(courseId, userId);
  const definition = readDefinition(draft.files, course.id, course.title);

  return json({
    course: {
      id: course.id,
      slug: course.slug,
      title: course.title,
      status: course.status,
      updatedAt: course.updatedAt,
    },
    draftId: draft.draftId,
    lectures: definition.lectures,
    definition,
  });
}
