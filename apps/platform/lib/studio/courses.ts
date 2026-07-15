import "server-only";

import {
  createStarterCourseDefinition,
  CourseDefinitionSchema,
  type CourseDefinition,
  type CourseLecture,
} from "@faraday-academy/platform-contracts";
import { getPlatform } from "@/lib/platform";
import { DEMO_CREATOR_ID } from "@/lib/studio/constants";

const COURSE_JSON = "course.json";

export type StudioCourseListItem = {
  id: string;
  slug: string;
  title: string;
  status: string;
  updatedAt: string;
  draftId: string | null;
  lectures: Array<{ id: string; title: string; order: number }>;
};

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

export async function listStudioCourses(
  userId: string = DEMO_CREATOR_ID,
): Promise<StudioCourseListItem[]> {
  const platform = getPlatform();
  const courses = await platform.studio.listOwnerCourses(userId);
  return Promise.all(
    courses.map(async (course) => {
      const draft = await platform.store.getDraftByCourseId(course.id);
      const definition = draft
        ? readDefinition(draft.files, course.id, course.title)
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
        lectures: definition.lectures.map((l: CourseLecture) => ({
          id: l.id,
          title: l.title,
          order: l.order,
        })),
      };
    }),
  );
}

export async function loadStudioCourse(courseId: string, userId: string) {
  const platform = getPlatform();
  const course = await platform.store.getCourse(courseId);
  if (!course || course.ownerId !== userId) return null;
  const draft = await platform.studio.getDraftByCourseId(courseId, userId);
  const definition = readDefinition(draft.files, course.id, course.title);
  return {
    course,
    draftId: draft.draftId,
    definition,
    lectures: definition.lectures,
  };
}

export { DEMO_CREATOR_ID };
