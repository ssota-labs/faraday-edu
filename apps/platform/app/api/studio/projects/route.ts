import { getPlatform, json, error, learnerIdFromRequest } from "@/lib/platform";
import {
  createStarterCourseDefinition,
  CourseDefinitionSchema,
  type CourseDefinition,
} from "@faraday-academy/platform-contracts";

const COURSE_JSON = "course.json";

function definitionFromFiles(
  files: Record<string, string>,
  fallback: CourseDefinition,
): CourseDefinition {
  const raw = files[COURSE_JSON];
  if (!raw) return fallback;
  try {
    return CourseDefinitionSchema.parse(JSON.parse(raw));
  } catch {
    return fallback;
  }
}

export async function GET(req: Request) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);
  const platform = getPlatform();
  const courses = await platform.studio.listOwnerCourses(userId);
  const items = await Promise.all(
    courses.map(async (course) => {
      const draft = await platform.store.getDraftByCourseId(course.id);
      const definition = draft
        ? definitionFromFiles(
            draft.files,
            createStarterCourseDefinition({
              courseId: course.id,
              title: course.title,
            }),
          )
        : createStarterCourseDefinition({
            courseId: course.id,
            title: course.title,
          });
      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        status: course.status,
        updatedAt: course.updatedAt,
        draftId: draft?.draftId ?? null,
        lectures: definition.lectures,
      };
    }),
  );
  return json({ courses: items });
}

export async function POST(req: Request) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);
  const body = await req.json();
  const platform = getPlatform();
  const title = typeof body.title === "string" && body.title.trim()
    ? body.title.trim()
    : "Untitled course";
  const slug =
    typeof body.slug === "string" && body.slug.trim()
      ? body.slug.trim()
      : `course-${Date.now().toString(36)}`;
  const lectureTitle =
    typeof body.lectureTitle === "string" && body.lectureTitle.trim()
      ? body.lectureTitle.trim()
      : "Lecture 1";

  let course;
  try {
    course = await platform.releases.createCourse({
      ownerId: userId,
      slug,
      title,
      access: body.access,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "SLUG_TAKEN") {
      return error("SLUG_TAKEN", "slug already exists", 409);
    }
    throw err;
  }

  const definition = createStarterCourseDefinition({
    courseId: course.id,
    title: course.title,
    lectureTitle,
  });

  const { draftId } = await platform.studio.saveDraft({
    courseId: course.id,
    ownerId: userId,
    files: {
      "index.html": `<!doctype html><html><body><h1>${course.title}</h1><p>${lectureTitle}</p></body></html>`,
      [COURSE_JSON]: JSON.stringify(definition, null, 2),
    },
  });

  return json({
    courseId: course.id,
    draftId,
    slug: course.slug,
    title: course.title,
    lectures: definition.lectures,
    definition,
  });
}
